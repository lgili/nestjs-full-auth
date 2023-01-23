import {
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import * as config from 'config';
// import { existsSync, unlinkSync } from 'fs';
import { SignOptions } from 'jsonwebtoken';
import {
  RateLimiterRes,
  RateLimiterStoreAbstract,
} from 'rate-limiter-flexible';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { SearchFilterInterface } from 'src/common/interfaces/search-filter.interface';
import { ValidationPayloadInterface } from 'src/common/interfaces/validation-error.interface';
import QueryBuilder from 'src/common/repository/filter-prisma';
import { DeepPartial } from 'src/common/repository/type.repository';
import { CustomHttpException } from 'src/exception/custom-http.exception';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { NotFoundException } from 'src/exception/not-found.exception';
import { UnauthorizedException } from 'src/exception/unauthorized.exception';
import { UserSearchFilterDto } from 'src/modules/auth/dto/user-search-filter.dto';
import { UserEntity } from 'src/modules/auth/entity/user.entity';
import { UserStatusEnum } from 'src/modules/auth/user-status.enum';
import { Pagination } from 'src/modules/paginate';
import { RefreshTokenEntity } from 'src/modules/refresh-token/entities/refresh-token.entity';

import { MailJobInterface } from '../mail/interface/mail-job.interface';
import { MailService } from '../mail/mail.service';
import { RefreshPaginateFilterDto } from '../refresh-token/dto/refresh-paginate-filter.dto';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';
import { RefreshTokenSerializer } from '../refresh-token/serializer/refresh-token.serializer';
import { RolesService } from '../role/roles.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgetPasswordDto } from './dto/forget-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserLoginDto } from './dto/user-login.dto';
import {
  GROUP_ADMIN,
  GROUP_USER,
  UserSerializer,
} from './serializer/user.serializer';
import { UserRepository } from './user.repository';

const throttleConfig = config.get('throttle.login');
const jwtConfig = config.get('jwt');
const appConfig = config.get('app');

const isSameSite =
  appConfig.sameSite !== null
    ? appConfig.sameSite
    : process.env.IS_SAME_SITE === 'true';

const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl,
};

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwt: JwtService,
    private readonly roleService: RolesService,
    private readonly mailService: MailService,
    private readonly refreshTokenService: RefreshTokenService,
    @Inject('LOGIN_THROTTLE')
    private readonly rateLimiter: RateLimiterStoreAbstract,
  ) {}

  /**
   * send mail
   * @param user
   * @param subject
   * @param url
   * @param slug
   * @param linkLabel
   */
  async sendMailToUser(
    user: UserSerializer,
    subject: string,
    url: string,
    slug: string,
    linkLabel: string,
  ) {
    const appConfig = config.get('app');

    const mailData: MailJobInterface = {
      to: user.email,
      subject,
      slug,
      context: {
        email: user.email,
        link: `<a href="${appConfig.frontendUrl}/${url}">${linkLabel} →</a>`,
        username: user.username,
        subject,
      },
    };
    await this.mailService.sendMail(mailData, 'system-mail');
  }

  /**
   * add new user
   * @param createUserDto
   */
  async create(
    createUserDto: DeepPartial<UserEntity>,
  ): Promise<UserSerializer> {
    const user = new UserEntity(createUserDto);
    const token = await this.generateUniqueToken(12);

    if (!user.status) {
      // normal user creation
      const normalRole = await this.roleService.findByName('normal');
      user.roleId = normalRole.id;
      const currentDateTime = new Date();
      currentDateTime.setHours(currentDateTime.getHours() + 1);
      user.tokenValidityDate = currentDateTime;
      user.status = UserStatusEnum.INACTIVE;
    }

    // just possible create normal user from register
    user.token = token;
    user.salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(user.password, user.salt);

    const userSaved = await this.userRepository.create(user);

    // console.log(userSaved)
    if (userSaved) {
      const registerProcess = createUserDto.status;
      const subject = registerProcess ? 'Account created' : 'Set Password';
      const link = registerProcess ? `verify/${token}` : `reset/${token}`;

      const slug = registerProcess
        ? 'activate-account'
        : 'new-user-set-password';
      const linkLabel = registerProcess ? 'Activate Account' : 'Set Password';

      const userSerialized = this.transform(userSaved);
      await this.sendMailToUser(userSerialized, subject, link, slug, linkLabel);

      return userSerialized;
    }
    throw new CustomHttpException(
      `Error to create new user`,
      HttpStatus.BAD_REQUEST,
      StatusCodesList.InternalServerError,
    );
  }

  /**
   * Login user by username and password
   * @param userLoginDto
   * @param refreshTokenPayload
   */
  async login(
    userLoginDto: UserLoginDto,
    refreshTokenPayload: Partial<RefreshTokenEntity>,
  ): Promise<string[]> {
    const usernameIPkey = `${userLoginDto.username}_${refreshTokenPayload.ip}`;
    const resUsernameAndIP = await this.rateLimiter.get(usernameIPkey);
    let retrySecs = 0;

    // Check if user is already blocked
    if (
      resUsernameAndIP !== null &&
      resUsernameAndIP.consumedPoints > throttleConfig.limit
    ) {
      retrySecs = Math.round(resUsernameAndIP.msBeforeNext / 1000) || 1;
    }

    if (retrySecs > 0) {
      throw new CustomHttpException(
        `tooManyRequest-{"second":"${String(retrySecs)}"}`,
        HttpStatus.TOO_MANY_REQUESTS,
        StatusCodesList.TooManyTries,
      );
    }

    const [user, error, code] = await this.verifyUser(userLoginDto);

    if (!user) {
      const [result, throttleError] = await this.limitConsumerPromiseHandler(
        usernameIPkey,
      );

      if (!result) {
        throw new CustomHttpException(
          `tooManyRequest-{"second":${String(
            Math.round(throttleError.msBeforeNext / 1000) || 1,
          )}}`,
          HttpStatus.TOO_MANY_REQUESTS,
          StatusCodesList.TooManyTries,
        );
      }
      throw new UnauthorizedException(error, code);
    }

    const accessToken = await this.generateAccessToken(user);
    let refreshToken = null;

    if (userLoginDto.remember) {
      refreshToken = await this.refreshTokenService.generateRefreshToken(
        user,
        refreshTokenPayload,
      );
    }
    await this.rateLimiter.delete(usernameIPkey);

    return this.buildResponsePayload(accessToken, refreshToken);
  }

  /**
   * update user
   * @param id
   * @param updateUserDto
   */
  async update(
    id: string,
    updateUserDto: Partial<UserEntity>,
  ): Promise<UserSerializer> {
    const user = await this.userRepository.findOne(id, { role: true });
    const errorPayload: ValidationPayloadInterface[] = [];

    if (updateUserDto.email) {
      const newEmail = await this.userRepository.findBy(
        'email',
        updateUserDto.email,
      );

      if (newEmail) {
        errorPayload.push({
          property: 'email',
          constraints: {
            unique: 'already taken',
          },
        });
      }
    }

    if (updateUserDto.username) {
      const newUsername = await this.userRepository.findBy(
        'username',
        updateUserDto.username,
      );

      if (newUsername) {
        errorPayload.push({
          property: 'username',
          constraints: {
            unique: 'already taken',
          },
        });
      }
    }

    if (Object.keys(errorPayload).length > 0) {
      throw new UnprocessableEntityException(errorPayload);
    }
    // TODO
    // if (updateUserDto.avatar && user.avatar) {
    //   const path = `public/images/profile/${user.avatar}`;
    //   if (existsSync(path)) {
    //     unlinkSync(`public/images/profile/${user.avatar}`);
    //   }
    // }
    // user.update(updateUserDto);
    const userSaved = await this.userRepository.update(user.id, updateUserDto);

    return this.transform(userSaved, { groups: [GROUP_USER, GROUP_ADMIN] });
  }

  /**
   * login user
   * @param userLoginDto
   */
  async verifyUser(
    userLoginDto: UserLoginDto,
  ): Promise<[user: UserSerializer, error: string, code: number]> {
    const { username, password } = userLoginDto;
    const user = await this.userRepository.findBy('username', username);

    const userSerialized = this.transform(user, {
      groups: [GROUP_USER, GROUP_ADMIN],
    });

    if (user) {
      const hash = await bcrypt.hash(password, user.salt);

      if (user && hash === user.password) {
        if (user.status !== UserStatusEnum.ACTIVE) {
          return [
            null,
            ExceptionTitleList.UserInactive,
            StatusCodesList.UserInactive,
          ];
        }

        return [userSerialized, null, null];
      }
    }

    return [
      null,
      ExceptionTitleList.InvalidCredentials,
      StatusCodesList.InvalidCredentials,
    ];
  }

  /**
   * activate newly register account
   * @param token
   */
  async activateAccount(token: string): Promise<void> {
    const user = await this.userRepository.findBy('token', token);

    if (!user) {
      throw new NotFoundException();
    }

    if (user.status !== UserStatusEnum.INACTIVE) {
      throw new ForbiddenException(
        ExceptionTitleList.UserInactive,
        StatusCodesList.UserInactive,
      );
    }
    user.status = UserStatusEnum.ACTIVE;
    user.token = await this.generateUniqueToken(6);
    user.skipHashPassword = true;
    await this.userRepository.update(user.id, user);
  }

  /**
   * promise handler to handle result and error for login
   * throttle by user
   * @param usernameIPkey
   */
  async limitConsumerPromiseHandler(
    usernameIPkey: string,
  ): Promise<[RateLimiterRes, RateLimiterRes]> {
    return new Promise((resolve) => {
      this.rateLimiter
        .consume(usernameIPkey)
        .then((rateLimiterRes) => {
          resolve([rateLimiterRes, null]);
        })
        .catch((rateLimiterError) => {
          resolve([null, rateLimiterError]);
        });
    });
  }

  /**
   * get user profile
   * @param user
   */
  async get(user: UserEntity): Promise<UserSerializer> {
    const userSaved = await this.userRepository.findOne(user.id, {
      role: true,
    });

    return this.transform(userSaved, { groups: [GROUP_USER] });
  }

  /**
   * Get user By Id
   * @param id
   */
  async findById(id: string): Promise<UserSerializer> {
    const userSaved = await this.userRepository.findOne(id, {
      role: {
        include: {
          permissions: true,
        },
      },
    });

    return this.transform(userSaved, { groups: [GROUP_USER, GROUP_ADMIN] });
  }

  /**
   * Get user By username
   * @param id
   */
  async findByUsername(username: string): Promise<UserSerializer> {
    const userSaved = await this.userRepository.findBy('username', username);

    return this.transform(userSaved, { groups: [GROUP_USER, GROUP_ADMIN] });
  }

  /**
   * Get all user paginated
   * @param userSearchFilterDto
   */
  async findAll(
    userSearchFilterDto: UserSearchFilterDto,
  ): Promise<Pagination<UserSerializer>> {
    const users = await this.paginate(userSearchFilterDto);

    return users;
  }

  /**
   * generate unique token
   * @param length
   */
  async generateUniqueToken(length: number): Promise<string> {
    const token = this.generateRandomCode(length);

    const tokenCount = await this.userRepository.findBy('token', token);

    // recursively find unique tokens
    if (tokenCount) {
      await this.generateUniqueToken(length);
    }

    return token;
  }

  /**
   * revoke refresh token for logout action
   * @param encoded
   */
  async revokeRefreshToken(encoded: string): Promise<void> {
    // ignore exception because anyway we are going invalidate cookies
    try {
      const { token } = await this.refreshTokenService.resolveRefreshToken(
        encoded,
      );

      if (token) {
        token.isRevoked = true;
        await this.refreshTokenService.updateRefreshToken(token);
      }
    } catch (e) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.PRECONDITION_FAILED,
        StatusCodesList.InvalidRefreshToken,
      );
    }
  }

  /**
   * forget password and send reset code by email
   * @param forgetPasswordDto
   */
  async forgotPassword(forgetPasswordDto: ForgetPasswordDto): Promise<void> {
    const { email } = forgetPasswordDto;

    const user = await this.userRepository.findBy('email,', email);

    if (!user) {
      return;
    }
    const token = await this.generateUniqueToken(6);
    user.token = token;
    const currentDateTime = new Date();
    currentDateTime.setHours(currentDateTime.getHours() + 1);
    user.tokenValidityDate = currentDateTime;
    user.skipHashPassword = true;
    const userUpdated = await this.userRepository.update(user.id, user);
    const userSerialized = this.transform(userUpdated);
    const subject = 'Reset Password';

    await this.sendMailToUser(
      userSerialized,
      subject,
      `reset/${token}`,
      'reset-password',
      subject,
    );
  }

  /**
   * reset password using token
   * @param resetPasswordDto
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { password } = resetPasswordDto;
    const user = await this.getUserForResetPassword(resetPasswordDto);

    if (!user) {
      throw new NotFoundException();
    }
    user.token = await this.generateUniqueToken(6);
    user.password = await bcrypt.hash(password, user.salt);
    // user.password = password;
    await this.userRepository.update(user.id, user);
  }

  /**
   * change password of logged in user
   * @param user
   * @param changePasswordDto
   */
  async changePassword(
    user: UserEntity,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const { oldPassword, password } = changePasswordDto;
    const hash = await bcrypt.hash(oldPassword, user.salt);

    let checkOldPwdMatches = false;

    if (hash === user.password) {
      checkOldPwdMatches = true;
    }

    if (!checkOldPwdMatches) {
      throw new CustomHttpException(
        ExceptionTitleList.IncorrectOldPassword,
        HttpStatus.PRECONDITION_FAILED,
        StatusCodesList.IncorrectOldPassword,
      );
    }
    user.password = await bcrypt.hash(password, user.salt);
    delete user['role'];
    delete user['roleId'];

    await this.userRepository.update(user.id, user);
  }

  /**
   * generate random string code providing length
   * @param length
   * @param uppercase
   * @param lowercase
   * @param numerical
   */
  generateRandomCode(
    length: number,
    uppercase = true,
    lowercase = true,
    numerical = true,
  ): string {
    let result = '';
    const lowerCaseAlphabets = 'abcdefghijklmnopqrstuvwxyz';
    const upperCaseAlphabets = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numericalLetters = '0123456789';
    let characters = '';

    if (uppercase) {
      characters += upperCaseAlphabets;
    }

    if (lowercase) {
      characters += lowerCaseAlphabets;
    }

    if (numerical) {
      characters += numericalLetters;
    }
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  /**
   * Generate access token
   * @param user
   * @param isTwoFAAuthenticated
   */
  public async generateAccessToken(
    user: UserSerializer,
    isTwoFAAuthenticated = false,
  ): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id),
    };

    return this.jwt.signAsync({
      ...opts,
      isTwoFAAuthenticated,
    });
  }

  /**
   * Get cookie for logout action
   */
  getCookieForLogOut(): string[] {
    return [
      `Authentication=; HttpOnly; Path=/; Max-Age=0; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      }`,
      `Refresh=; HttpOnly; Path=/; Max-Age=0; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      }`,
      `ExpiresIn=; Path=/; Max-Age=0; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      }`,
    ];
  }

  /**
   * build response payload
   * @param accessToken
   * @param refreshToken
   */
  buildResponsePayload(accessToken: string, refreshToken?: string): string[] {
    let tokenCookies = [
      `Authentication=${accessToken}; HttpOnly; Path=/; ${
        !isSameSite ? 'SameSite=None; Secure;' : ''
      } Max-Age=${jwtConfig.cookieExpiresIn}`,
    ];

    if (refreshToken) {
      const expiration = new Date();
      expiration.setSeconds(expiration.getSeconds() + jwtConfig.expiresIn);
      tokenCookies = tokenCookies.concat([
        `Refresh=${refreshToken}; HttpOnly; Path=/; ${
          !isSameSite ? 'SameSite=None; Secure;' : ''
        } Max-Age=${jwtConfig.cookieExpiresIn}`,
        `ExpiresIn=${expiration}; Path=/; ${
          !isSameSite ? 'SameSite=None; Secure;' : ''
        } Max-Age=${jwtConfig.cookieExpiresIn}`,
      ]);
    }

    return tokenCookies;
  }

  /**
   * Create access token from refresh token
   * @param refreshToken
   */
  async createAccessTokenFromRefreshToken(refreshToken: string) {
    const { token } =
      await this.refreshTokenService.createAccessTokenFromRefreshToken(
        refreshToken,
      );

    return this.buildResponsePayload(token);
  }

  /**
   * get active refresh token list for user
   * @param userId
   * @param filter
   **/
  activeRefreshTokenList(
    userId: string,
    filter: RefreshPaginateFilterDto,
  ): Promise<RefreshTokenSerializer[]> {
    return this.refreshTokenService.getRefreshTokenByUserId(userId, filter);
  }

  /**
   * revoke token by id
   * @param id
   * @param userId
   **/
  revokeTokenById(id: string, userId: string): Promise<RefreshTokenSerializer> {
    return this.refreshTokenService.revokeRefreshTokenById(id, userId);
  }

  /**
   * set two factor auth secret for user
   * @param secret
   * @param userId
   **/
  async setTwoFactorAuthenticationSecret(secret: string, userId: string) {
    // add one minute throttle to generate next two factor token
    const twoFAThrottleTime = new Date();
    twoFAThrottleTime.setSeconds(twoFAThrottleTime.getSeconds() + 60);
    const user = await this.userRepository.findOne(userId);
    user.twoFASecret = secret;
    user.twoFAThrottleTime = twoFAThrottleTime;

    return this.userRepository.update(user.id, user);
  }

  /**
   * Turn two factor authentication for user
   * @param user
   * @param isTwoFAEnabled
   * @param qrDataUri
   **/
  async turnOnTwoFactorAuthentication(
    user: UserEntity,
    isTwoFAEnabled = true,
    qrDataUri: string,
  ) {
    if (isTwoFAEnabled) {
      const subject = 'Activate Two Factor Authentication';

      const mailData: MailJobInterface = {
        to: user.email,
        subject,
        slug: 'two-factor-authentication',
        context: {
          email: user.email,
          qrcode: 'cid:2fa-qrcode',
          username: user.username,
          subject,
        },
        attachments: [
          {
            filename: '2fa-qrcode.png',
            path: qrDataUri,
            cid: '2fa-qrcode',
          },
        ],
      };
      await this.mailService.sendMail(mailData, 'system-mail');
    }
    user.isTwoFAEnabled = isTwoFAEnabled;

    return this.userRepository.update(user.id, user);
  }

  /**
   * Get user entity for reset password
   * @param resetPasswordDto
   */
  async getUserForResetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<UserSerializer> {
    const { token } = resetPasswordDto;
    // const query = this.createQueryBuilder('user');
    // query.where('user.token = :token', { token });
    // query.andWhere('user.tokenValidityDate > :date', {
    //   date: new Date()
    // });
    // return query.getOne();

    const user = await this.userRepository.findBy('token', token);

    if (user && user.tokenValidityDate > new Date()) {
      return this.transform(user);
    }

    return null;
  }

  // need to test more
  async paginate(
    searchFilter: DeepPartial<SearchFilterInterface>,
  ): Promise<Pagination<UserSerializer>> {
    const qb = new QueryBuilder({
      page: searchFilter.page,
      perPage: searchFilter.perPage,
    });
    const filterOptions = qb.paginate().build();

    const [results, total] = await this.userRepository.findAndCount(
      filterOptions,
    );
    const serializedResult = this.transformMany(results);

    const currentPage = Number(searchFilter?.page) || 1;
    const perPage = Number(searchFilter.perPage) || 10;
    // const skip = currentPage > 0 ? perPage * (currentPage - 1) : 0;
    const lastPage = Math.ceil(total / perPage);
    console.log(searchFilter?.page);

    return new Pagination<UserSerializer>({
      results: serializedResult,
      meta: {
        total,
        lastPage,
        currentPage,
        perPage,
        previous: currentPage > 1 ? currentPage - 1 : null,
        next: currentPage < lastPage ? currentPage + 1 : null,
      },
    });
  }

  /**
   * transform entity
   * @param model
   * @param transformOptions
   */
  transform(model: UserEntity, transformOptions = {}): UserSerializer {
    return plainToInstance(UserSerializer, model, transformOptions);
  }

  /**
   * transform array of entity
   * @param models
   * @param transformOptions
   */
  transformMany(models: UserEntity[], transformOptions = {}): UserSerializer[] {
    return models.map((model) => this.transform(model, transformOptions));
  }
}
