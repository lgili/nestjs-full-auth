import { forwardRef, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import * as config from 'config';
import { SignOptions, TokenExpiredError } from 'jsonwebtoken';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import QueryBuilder from 'src/common/repository/filter-prisma';
import { CustomHttpException } from 'src/exception/custom-http.exception';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { NotFoundException } from 'src/exception/not-found.exception';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserSerializer } from 'src/modules/auth/serializer/user.serializer';
import { Pagination } from 'src/modules/paginate';
import { PaginationInfoInterface } from 'src/modules/paginate/pagination-info.interface';
import { RefreshPaginateFilterDto } from 'src/modules/refresh-token/dto/refresh-paginate-filter.dto';
import { RefreshTokenInterface } from 'src/modules/refresh-token/interface/refresh-token.interface';
import { RefreshTokenSerializer } from 'src/modules/refresh-token/serializer/refresh-token.serializer';

import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { RefreshTokenRepository } from './refresh-token.repository';

const appConfig = config.get('app');
const tokenConfig = config.get('jwt');

const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl,
};

@Injectable()
export class RefreshTokenService {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
    private readonly jwt: JwtService,
  ) {}

  /**
   * Generate refresh token
   * @param user
   * @param refreshToken
   */
  public async generateRefreshToken(
    user: UserSerializer,
    refreshToken: Partial<RefreshTokenEntity>,
  ): Promise<string> {
    const token = new RefreshTokenEntity(refreshToken);
    token.userId = user.id;
    token.isRevoked = false;
    const expiration = new Date();
    expiration.setSeconds(
      expiration.getSeconds() + tokenConfig.refreshExpiresIn,
    );
    token.expires = expiration;
    console.log(token);

    const tokenSaved = await this.refreshTokenRepository.create(token);

    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id),
      jwtid: String(tokenSaved.id),
    };

    return this.jwt.signAsync(
      { ...opts },
      {
        expiresIn: tokenConfig.refreshExpiresIn,
      },
    );
  }

  /**
   * Resolve encoded refresh token
   * @param encoded
   */
  public async resolveRefreshToken(encoded: string): Promise<{
    user: UserSerializer;
    token: RefreshTokenSerializer;
  }> {
    const payload = await this.decodeRefreshToken(encoded);
    const token = await this.getStoredTokenFromRefreshTokenPayload(payload);

    if (!token) {
      throw new CustomHttpException(
        ExceptionTitleList.NotFound,
        HttpStatus.NOT_FOUND,
        StatusCodesList.NotFound,
      );
    }

    if (token.isRevoked) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken,
      );
    }

    const user = await this.getUserFromRefreshTokenPayload(payload);

    if (!user) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken,
      );
    }

    return {
      user,
      token,
    };
  }

  /**
   * Create access token from refresh token
   * @param refresh
   */
  public async createAccessTokenFromRefreshToken(refresh: string): Promise<{
    token: string;
    user: UserSerializer;
  }> {
    const { user } = await this.resolveRefreshToken(refresh);
    const token = await this.authService.generateAccessToken(user);

    return {
      user,
      token,
    };
  }

  /**
   * Decode refresh token
   * @param token
   */
  async decodeRefreshToken(token: string): Promise<RefreshTokenInterface> {
    try {
      return await this.jwt.verifyAsync(token);
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new CustomHttpException(
          ExceptionTitleList.RefreshTokenExpired,
          HttpStatus.BAD_REQUEST,
          StatusCodesList.RefreshTokenExpired,
        );
      } else {
        throw new CustomHttpException(
          ExceptionTitleList.InvalidRefreshToken,
          HttpStatus.BAD_REQUEST,
          StatusCodesList.InvalidRefreshToken,
        );
      }
    }
  }

  /**
   * get user detail from refresh token
   * @param payload
   */
  async getUserFromRefreshTokenPayload(
    payload: RefreshTokenInterface,
  ): Promise<UserSerializer> {
    const subId = payload.subject;

    if (!subId) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken,
      );
    }
    const user = await this.authService.findById(subId.toString());
    return user
  }

  /**
   * Get refresh token entity from token payload
   * @param payload
   */
  async getStoredTokenFromRefreshTokenPayload(
    payload: RefreshTokenInterface,
  ): Promise<RefreshTokenSerializer | null> {
    const tokenId = payload.jwtid;

    if (!tokenId) {
      throw new CustomHttpException(
        ExceptionTitleList.InvalidRefreshToken,
        HttpStatus.BAD_REQUEST,
        StatusCodesList.InvalidRefreshToken,
      );
    }
    const token = await this.refreshTokenRepository.findOne(tokenId.toString());
    return this.transform(token)
  }

  async updateRefreshToken(token: RefreshTokenSerializer) {
    return await this.refreshTokenRepository.update(token.id, token);
  }

  /**
   * Get active refresh token list of user
   * @param userId
   */
  async getRefreshTokenByUserId(
    userId: string,
    filter: RefreshPaginateFilterDto,
  ): Promise<RefreshTokenSerializer[]> {

    const qb = new QueryBuilder({
      userId: userId,      
      select: 'user',      
    });

    const findOptions = qb.filter().sort().build();
    const tokens = await this.refreshTokenRepository.findAll(
      findOptions,
      userId);

    // const { page, skip, limit } = paginationInfo;
    // findOptions.take = paginationInfo.limit;
    // findOptions.skip = paginationInfo.skip;
    // findOptions.order = {
    //   id: 'DESC'
    // };
    // const [results, total] = await this.repository.findAndCount(findOptions);
    // const serializedResult = this.transformMany(tokens);

    // return new Pagination<RefreshTokenSerializer>({
    //   results: serializedResult,
    //   totalItems: total,
    //   pageSize: limit,
    //   currentPage: page,
    //   previous: page > 1 ? page - 1 : 0,
    //   next: total > skip + limit ? page + 1 : 0
    // });
    return this.transformMany(tokens);
  }

  /**
   * Revoke refresh token by id
   * @param id
   * @param userId
   */
  async revokeRefreshTokenById(
    id: string,
    userId: string,
  ): Promise<RefreshTokenSerializer> {
    const token = await this.refreshTokenRepository.findOne(id);

    if (!token) {
      throw new NotFoundException();
    }

    if (token.userId !== userId) {
      throw new ForbiddenException();
    }
    token.isRevoked = true;
    const tokenSaved = await this.refreshTokenRepository.update(token.id, token);

    return this.transform(tokenSaved);
  }

  // async getRefreshTokenGroupedData(field: string) {
  //   return this.repository
  //     .createQueryBuilder('token')
  //     .select(`token.${field} AS type`)
  //     .where(`token.${field} IS NOT NULL`)
  //     .addSelect('COUNT(*)::int AS value')
  //     .groupBy(`token.${field}`)
  //     .getRawMany();
  // }


  /**
   * transform entity
   * @param model
   * @param transformOptions
   */
  transform(model: RefreshTokenEntity, transformOptions = {}): RefreshTokenSerializer { 
    return plainToInstance(RefreshTokenSerializer, model, transformOptions) ;
  }

  /**
   * transform array of entity
   * @param models
   * @param transformOptions
   */
  transformMany(models: RefreshTokenEntity[], transformOptions = {}): RefreshTokenSerializer[] {
    return models.map((model) => this.transform(model, transformOptions));
  }
  
}
