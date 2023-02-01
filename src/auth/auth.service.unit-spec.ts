import { UnprocessableEntityException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';
import { ChangePasswordDto } from 'src/auth/dto/change-password.dto';
import { CreateUserDto } from 'src/auth/dto/create-user.dto';
import { ForgetPasswordDto } from 'src/auth/dto/forget-password.dto';
import { ResetPasswordDto } from 'src/auth/dto/reset-password.dto';
import { UpdateUserProfileDto } from 'src/auth/dto/update-user-profile.dto';
import { UserLoginDto } from 'src/auth/dto/user-login.dto';
import {
  GROUP_ADMIN,
  GROUP_USER,
  UserEntity,
} from 'src/auth/entity/user.entity';
import { UserStatusEnum } from 'src/auth/user-status.enum';
import { UserRepository } from 'src/auth/user.repository';
import { QueryPrisma } from 'src/common/repository/query-buider-frontend/interfaces/Query';
import { CustomHttpException } from 'src/exception/custom-http.exception';
import { NotFoundException } from 'src/exception/not-found.exception';
import { MailService } from 'src/mail/mail.service';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';
import { RolesService } from 'src/role/roles.service';

const mockUserRepository = () => ({
  findById: jest.fn(),
  findBy: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
  create: jest.fn(),
  login: jest.fn(),
  transform: jest.fn(),
  getUserForResetPassword: jest.fn(),
  countEntityByCondition: jest.fn(),
});

const mockUser = {
  email: 'test@mail.com',
  username: 'tester',
  name: 'test',
  password: 'test123',
  salt: '$2b$10$O9BWip02GuE14bDPfBomQe',
  roleId: '2',
  status: UserStatusEnum.ACTIVE,
  tokenValidityDate: new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
  save: jest.fn(),
};

const refreshTokenServiceMock = () => ({
  generateRefreshToken: jest.fn(),
  resolveRefreshToken: jest.fn(),
  getRefreshTokenByUserId: jest.fn(),
  revokeRefreshTokenById: jest.fn(),
});

const throttleMock = () => ({
  get: jest.fn(),
  delete: jest.fn(),
});

const mailServiceMock = () => ({
  sendMail: jest.fn(),
});

const jwtServiceMock = () => ({
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
});

const rolesServiceMock = () => ({
  delete: jest.fn(),
});

describe('AuthService', () => {
  let service: AuthService,
    userRepository,
    refreshTokenService,
    mailService,
    throttleService,
    jwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useFactory: jwtServiceMock,
        },
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
        {
          provide: RefreshTokenService,
          useFactory: refreshTokenServiceMock,
        },
        {
          provide: MailService,
          useFactory: mailServiceMock,
        },
        {
          provide: RolesService,
          useFactory: rolesServiceMock,
        },
        {
          provide: 'LOGIN_THROTTLE',
          useFactory: throttleMock,
        },
      ],
    }).compile();

    service = await module.get<AuthService>(AuthService);
    userRepository = await module.get<UserRepository>(UserRepository);
    refreshTokenService = await module.get<RefreshTokenService>(
      RefreshTokenService,
    );
    mailService = await module.get<MailService>(MailService);
    throttleService = await module.get<'LOGIN_THROTTLE'>('LOGIN_THROTTLE');
    jwtService = await module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('change or forgot password', () => {
    it('forgot password with email', async () => {
      userRepository.findBy.mockResolvedValue({ ...mockUser, id: '1' });
      userRepository.update.mockResolvedValue({ ...mockUser, id: '1' });
      const token = 'Adf2vBnVV';
      service.generateUniqueToken = jest.fn().mockResolvedValue(token);

      const forgetPasswordDto: ForgetPasswordDto = {
        email: 'test@mail.com',
      };
      await service.forgotPassword(forgetPasswordDto);
      expect(userRepository.findBy).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalledTimes(1);
      expect(mailService.sendMail).toHaveBeenCalled();
    });

    it('check if generate code works as expected', () => {
      const result = service.generateRandomCode(5);
      expect(typeof result).toBe('string');
      expect(result.length).toEqual(5);
    });

    it('generate unique code test', async () => {
      service.generateRandomCode = jest.fn().mockReturnValue('W45Rft');
      userRepository.findBy.mockResolvedValue(null);
      await service.generateUniqueToken(6);
      expect(service.generateRandomCode).toHaveBeenCalledWith(6);
      expect(userRepository.findBy).toHaveBeenCalledWith({
        fieldName: 'token',
        value: 'W45Rft',
      });
    });
  });

  describe('reset password test', () => {
    let resetPasswordDto: ResetPasswordDto;
    beforeEach(() => {
      resetPasswordDto = {
        password: 'Truthy@123',
        confirmPassword: 'Truthy@123',
        token: 'Aer23C',
      };
    });

    it('reset password for existing user', async () => {
      userRepository.findBy.mockResolvedValue(mockUser);
      service.generateUniqueToken = jest.fn();
      await service.resetPassword(resetPasswordDto);
      expect(userRepository.findBy).toHaveBeenCalledWith({
        fieldName: 'token',
        value: resetPasswordDto.token,
      });
      expect(service.generateUniqueToken).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalled();
    });

    it('try to reset password with invalid token', async () => {
      userRepository.findBy.mockResolvedValue(null);
      await expect(
        service.resetPassword(resetPasswordDto),
      ).rejects.toThrowError(NotFoundException);
    });
    describe('change password', () => {
      let user: UserEntity, changePasswordDto: ChangePasswordDto;
      beforeEach(() => {
        jest.clearAllMocks();
        changePasswordDto = {
          oldPassword: 'Truthy@prev',
          password: 'Truthy@123',
          confirmPassword: 'Truthy@123',
        };

        user = new UserEntity();
        user.email = mockUser.email;
        user.username = mockUser.username;
        user.password = mockUser.password;
        user.salt = 'result';
      });
      it('change password for loggedin user with correct password', async () => {
        user.validatePassword = jest.fn().mockResolvedValue(true);
        bcrypt.hash = jest.fn().mockResolvedValue('result');
        await service.changePassword(user, changePasswordDto);
        expect(user.validatePassword).toHaveBeenCalledTimes(1);
        expect(userRepository.update).toHaveBeenCalled();
      });
      it('change password for loggedin user with incorrect password', async () => {
        bcrypt.hash = jest.fn().mockResolvedValue('result');
        user.validatePassword = jest.fn().mockResolvedValue(false);
        await expect(
          service.changePassword(user, changePasswordDto),
        ).rejects.toThrowError(CustomHttpException);
        expect(user.validatePassword).toHaveBeenCalledTimes(1);
        expect(userRepository.update).toHaveBeenCalledTimes(0);
      });
    });
  });

  it('generate access token', async () => {
    const user = new UserEntity();
    user.id = '1';
    user.email = 'test@mail.com';
    await service.generateAccessToken(user);
    expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
  });

  describe('addUser', () => {
    it('add new user test', async () => {
      const token = 'Adf2vBnVV';
      service.generateUniqueToken = jest.fn().mockResolvedValue(token);
      bcrypt.genSalt = jest.fn().mockResolvedValue('result');
      bcrypt.hash = jest.fn().mockResolvedValue('test123');
      userRepository.create.mockResolvedValue(mockUser);
      const createUserDto: CreateUserDto = mockUser;
      await service.create(createUserDto);
      expect(service.generateUniqueToken).toHaveBeenCalled();
      const user = new UserEntity(createUserDto);
      user.token = token;
      user.salt = 'result';
      user.password = 'test123';
      expect(userRepository.create).toHaveBeenCalledWith({
        data: user,
        cls: UserEntity,
      });
      expect(mailService.sendMail).toHaveBeenCalledTimes(1);
      expect(userRepository.create).not.toThrow();
    });

    it('activate account with valid token', async () => {
      service.generateUniqueToken = jest.fn();
      mockUser.status = UserStatusEnum.INACTIVE; // initially user will have inactive status
      userRepository.findBy.mockResolvedValue({ ...mockUser, id: '1' });
      const token = 'Adf2vBnVV';
      await service.activateAccount(token);
      expect(userRepository.findBy).toHaveBeenCalledWith({
        fieldName: 'token',
        value: token,
      });
      expect(service.generateUniqueToken).toHaveBeenCalled();
      expect(userRepository.update).toHaveBeenCalled();
    });

    it('activate account with invalid token', async () => {
      userRepository.findBy.mockResolvedValue(null);
      const token = 'Bgf2vBnVV';
      await expect(service.activateAccount(token)).rejects.toThrowError(
        NotFoundException,
      );
      expect(userRepository.findBy).toHaveBeenCalledTimes(1);
      expect(userRepository.update).toHaveBeenCalledTimes(0);
    });
  });

  describe('findBy', () => {
    it('find user by user Entity', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const query: QueryPrisma = {
        select: 'all',
        filter: [{ path: 'id', value: '1' }],
        populate: [
          {
            path: 'role',
            select: 'all',
          },
        ],
      };

      const result = await service.get({
        ...mockUser,
        id: '1',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        searchFilter: query,
      });
      expect(result).toBe(mockUser);
    });

    it('find user by user Entity without id', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.get({
          ...mockUser,
        }),
      ).rejects.toThrowError(NotFoundException);

      expect(userRepository.findOne).toHaveBeenCalledTimes(0);
    });

    it('find user by id with password', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const query: QueryPrisma = {
        select: 'all',
        filter: [{ path: 'id', value: '1' }],
        populate: [
          {
            path: 'role',
            select: 'all',
            populate: [
              {
                path: 'permissions',
                select: 'all',
              },
            ],
          },
        ],
      };
      const result = await service.getWithPassword('1');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        searchFilter: query,
      });
      expect(result).toBe(mockUser);
    });

    it('find user by id', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const query: QueryPrisma = {
        select: 'all',
        filter: [{ path: 'id', value: '1' }],
        populate: [
          {
            path: 'role',
            select: 'all',
            populate: [
              {
                path: 'permissions',
                select: 'all',
              },
            ],
          },
        ],
      };
      const result = await service.findById('1');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        searchFilter: query,
        cls: UserEntity,
        transformOptions: {
          groups: [GROUP_USER, GROUP_ADMIN],
        },
      });
      expect(result).toBe(mockUser);
    });

    it('find user by username', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const query: QueryPrisma = {
        select: 'all',
        filter: [{ path: 'username', value: mockUser.username }],
      };

      const result = await service.findByUsername(mockUser.username);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        searchFilter: query,
        cls: UserEntity,
        transformOptions: {
          groups: [GROUP_USER, GROUP_ADMIN],
        },
      });
      expect(result).toBe(mockUser);
    });
  });

  describe('logged in user functionality', () => {
    let userLoginDto: UserLoginDto, user, ip: string, refreshTokenPayload;
    beforeEach(() => {
      userLoginDto = {
        password: mockUser.password,
        username: mockUser.username,
        remember: true,
      };
      user = new UserEntity();
      user.id = '1';
      user.email = mockUser.email;
      user.username = mockUser.username;
      user.password = mockUser.password;
      user.status = UserStatusEnum.ACTIVE;
      ip = '::1';
      refreshTokenPayload = {
        ip: '::1',
        userAgent: 'mozilla',
      };
    });

    it('check if throttle error occurs if user tries to login multiple times', async () => {
      throttleService.get.mockResolvedValue({
        consumedPoints: 6,
        msBeforeNext: 3000,
      });
      userRepository.login.mockResolvedValue(user);
      await expect(
        service.login(userLoginDto, refreshTokenPayload),
      ).rejects.toThrowError(CustomHttpException);
    });

    it('login user successfully', async () => {
      throttleService.get.mockResolvedValue(null);
      bcrypt.hash = jest.fn().mockResolvedValue(mockUser.password);
      jest.spyOn(service, 'buildResponsePayload').mockReturnValue(['result']);
      userRepository.findBy.mockResolvedValue(user);
      jest
        .spyOn(service, 'generateAccessToken')
        .mockResolvedValue('access_token');
      await service.login(userLoginDto, refreshTokenPayload);
      expect(userRepository.findBy).toHaveBeenCalledWith({
        fieldName: 'username',
        value: userLoginDto.username,
      });
      expect(throttleService.delete).toHaveBeenCalledWith(
        `${user.username}_${ip}`,
      );
      expect(refreshTokenService.generateRefreshToken).toHaveBeenCalledTimes(1);
      expect(service.generateAccessToken).toHaveBeenCalledTimes(1);
      expect(service.buildResponsePayload).toHaveBeenCalledTimes(1);
    });

    describe('update user', () => {
      let updateUserDto: UpdateUserProfileDto;
      beforeEach(() => {
        updateUserDto = {
          email: 'test@test.com',
          username: 'tester123',
          name: 'tester',
          avatar: 'test.jpg',
          address: 'test',
          contact: 'test',
        };
      });

      it('update user with duplicate username & email', async () => {
        userRepository.findBy.mockResolvedValue(mockUser);
        userRepository.findById.mockResolvedValue(mockUser);

        await expect(service.update(user, updateUserDto)).rejects.toThrowError(
          UnprocessableEntityException,
        );
        expect(userRepository.findById).toHaveBeenCalledTimes(1);
        expect(userRepository.findBy).toHaveBeenCalledTimes(2);
      });

      it('update user with non duplicate username & email', async () => {
        userRepository.update.mockResolvedValue(mockUser);
        userRepository.findById.mockResolvedValue({ ...mockUser, id: '1' });
        userRepository.findBy.mockResolvedValue(null);
        await service.update(user.id, updateUserDto);
        expect(userRepository.findBy).toHaveBeenCalledTimes(2);
        expect(userRepository.update).toHaveBeenCalledTimes(1);
        expect(userRepository.update).toHaveBeenCalledWith({
          id: user.id,
          data: updateUserDto,
          cls: UserEntity,
          transformOptions: {
            groups: [GROUP_USER, GROUP_ADMIN],
          },
        });
        expect(userRepository.update).not.toThrow();
      });
    });

    it('logout user', async () => {
      const mockToken = {
        id: '1',
        userId: '1',
        save: jest.fn(),
      };
      refreshTokenService.resolveRefreshToken.mockResolvedValue({
        user: mockUser,
        token: mockToken,
      });
      refreshTokenService.updateRefreshToken = jest.fn();

      await service.revokeRefreshToken('refresh_token');
      expect(refreshTokenService.resolveRefreshToken).toHaveBeenCalledTimes(1);
      expect(refreshTokenService.resolveRefreshToken).toHaveBeenCalledWith(
        'refresh_token',
      );
    });
  });

  it('get user token list', async () => {
    const userId = '1';

    const filter: QueryPrisma = {
      limit: 10,
      page: 1,
    };
    await service.activeRefreshTokenList(userId, filter);
    expect(refreshTokenService.getRefreshTokenByUserId).toHaveBeenCalledWith(
      userId,
      filter,
    );
    expect(refreshTokenService.getRefreshTokenByUserId).toHaveBeenCalledTimes(
      1,
    );
  });

  it('revokeTokenById', async () => {
    const mockRefreshToken = {
      ip: '::1',
      userAgent: 'mozilla',
    };
    refreshTokenService.revokeRefreshTokenById.mockResolvedValue(
      mockRefreshToken,
    );
    await expect(service.revokeTokenById('1', '1')).resolves.not.toThrow();
    expect(refreshTokenService.revokeRefreshTokenById).toHaveBeenCalledTimes(1);
  });

  it('should update user twofa secret', async () => {
    userRepository.findById.mockResolvedValue({
      ...mockUser,
      twoFASecret: '',
      twoFAThrottleTime: '',
    });
    await service.setTwoFactorAuthenticationSecret('secret', '1');
    expect(userRepository.update).toHaveBeenCalledTimes(1);
  });

  it('should update user twofa enable status', async () => {
    const user = new UserEntity();
    user.id = '1';
    user.email = mockUser.email;
    user.username = mockUser.username;
    user.password = mockUser.password;
    await service.turnOnTwoFactorAuthentication(user, true, 'qrcode');
    expect(userRepository.update).toHaveBeenCalledTimes(1);
    user.isTwoFAEnabled = true;
    expect(userRepository.update).toHaveBeenCalledWith({
      id: user.id,
      data: user,
    });
  });
});
