import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { TokenExpiredError } from 'jsonwebtoken';
import { AuthService } from 'src/auth/auth.service';
import { UserEntity } from 'src/auth/entity/user.entity';
import { QueryPrisma } from 'src/common/repository/query-buider-frontend/interfaces/Query';
import { CustomHttpException } from 'src/exception/custom-http.exception';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { NotFoundException } from 'src/exception/not-found.exception';
import { RefreshTokenEntity } from 'src/refresh-token/entities/refresh-token.entity';
import { RefreshTokenRepository } from 'src/refresh-token/refresh-token.repository';
import { RefreshTokenService } from 'src/refresh-token/refresh-token.service';

const jwtServiceMock = () => ({
  signAsync: jest.fn(),
  verifyAsync: jest.fn(),
});

const authServiceMock = () => ({
  findById: jest.fn(),
  generateAccessToken: jest.fn(),
});

const repositoryMock = () => ({
  create: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  paginate: jest.fn(),
  findAndCount: jest.fn(),
  transformMany: jest.fn(),
  find: jest.fn(),
});

describe('RefreshTokenService', () => {
  let service: RefreshTokenService,
    jwtService,
    authService,
    repository,
    user: UserEntity,
    refreshToken: RefreshTokenEntity;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefreshTokenService,
        {
          provide: JwtService,
          useFactory: jwtServiceMock,
        },
        {
          provide: AuthService,
          useFactory: authServiceMock,
        },
        {
          provide: RefreshTokenRepository,
          useFactory: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<RefreshTokenService>(RefreshTokenService);
    jwtService = await module.get<JwtService>(JwtService);
    authService = await module.get<AuthService>(AuthService);
    repository = await module.get<RefreshTokenRepository>(
      RefreshTokenRepository,
    );
    user = new UserEntity();
    user.id = '1';
    user.email = 'test@mail.com';
    refreshToken = new RefreshTokenEntity();
    refreshToken.id = '1';
    refreshToken.userId = '1';
    refreshToken.isRevoked = false;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('generate refresh token', async () => {
    repository.create.mockResolvedValue(refreshToken);

    const tokenPayload = {
      ip: '::1',
      userAgent: 'mozilla',
    };
    await service.generateRefreshToken(user, tokenPayload);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(jwtService.signAsync).toHaveBeenCalledTimes(1);
  });

  describe('resolveRefreshToken', () => {
    it('test for malformed token', async () => {
      const testToken = 'test_token_hash';
      jest.spyOn(service, 'decodeRefreshToken').mockResolvedValue({
        jwtid: 1,
        subject: 1,
      });
      jest
        .spyOn(service, 'getStoredTokenFromRefreshTokenPayload')
        .mockResolvedValue(refreshToken);
      jest
        .spyOn(service, 'getUserFromRefreshTokenPayload')
        .mockResolvedValue(null);
      await expect(service.resolveRefreshToken(testToken)).rejects.toThrowError(
        CustomHttpException,
      );
      expect(service.decodeRefreshToken).toHaveBeenCalledTimes(1);
      expect(
        service.getStoredTokenFromRefreshTokenPayload,
      ).toHaveBeenCalledTimes(1);
      expect(
        service.getStoredTokenFromRefreshTokenPayload,
      ).toHaveBeenCalledTimes(1);
    });

    it('resolve refresh token for valid refresh token', async () => {
      const testToken = 'test_token_hash';
      jest.spyOn(service, 'decodeRefreshToken').mockResolvedValue({
        jwtid: 1,
        subject: 1,
      });
      jest
        .spyOn(service, 'getStoredTokenFromRefreshTokenPayload')
        .mockResolvedValue(refreshToken);
      jest
        .spyOn(service, 'getUserFromRefreshTokenPayload')
        .mockResolvedValue(user);
      await service.resolveRefreshToken(testToken);
      expect(service.decodeRefreshToken).toHaveBeenCalledTimes(1);
      expect(service.decodeRefreshToken).toHaveBeenCalledWith(testToken);
      expect(
        service.getStoredTokenFromRefreshTokenPayload,
      ).toHaveBeenCalledTimes(1);
      expect(
        service.getStoredTokenFromRefreshTokenPayload,
      ).toHaveBeenCalledWith({
        jwtid: 1,
        subject: 1,
      });
    });
  });

  it('createAccessTokenFromRefreshToken', async () => {
    jest.spyOn(service, 'resolveRefreshToken').mockResolvedValue({
      user,
      token: refreshToken,
    });
    // jest
    //   .spyOn(service, 'generateAccessToken')
    //   .mockResolvedValue('refresh_token_hash');
    await service.createAccessTokenFromRefreshToken('old_token_hash');
    expect(service.resolveRefreshToken).toHaveBeenCalledWith('old_token_hash');
    expect(service.resolveRefreshToken).toHaveBeenCalledTimes(1);
    expect(authService.generateAccessToken).toHaveBeenCalledTimes(1);
    expect(authService.generateAccessToken).toHaveBeenCalledWith(user);
  });

  describe('decodeRefreshToken', () => {
    it('check token expired error', async () => {
      jwtService.verifyAsync.mockImplementation(() => {
        throw new TokenExpiredError('tokenExpired', new Date());
      });

      await expect(
        service.decodeRefreshToken('refresh_token_hash'),
      ).rejects.toThrowError(CustomHttpException);
    });

    it('decode valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        jwtid: 1,
        subject: 1,
      });
      await service.decodeRefreshToken('refresh_token_hash');
      expect(jwtService.verifyAsync).toHaveBeenCalledTimes(1);
      expect(jwtService.verifyAsync).toHaveBeenCalledWith('refresh_token_hash');
    });
  });

  describe('getUserFromRefreshTokenPayload', () => {
    it('check get user from refresh token with malformed token', async () => {
      await expect(
        service.getUserFromRefreshTokenPayload({
          jwtid: null,
          subject: null,
        }),
      ).rejects.toThrowError(CustomHttpException);
      expect(authService.findById).toHaveBeenCalledTimes(0);
    });

    it('get user from valid refresh token', async () => {
      authService.findById.mockResolvedValue(user);
      await expect(
        service.getUserFromRefreshTokenPayload({
          jwtid: 1,
          subject: 1,
        }),
      ).resolves.not.toThrow();
      expect(authService.findById).toHaveBeenCalledTimes(1);
      expect(authService.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('getStoredTokenFromRefreshTokenPayload', () => {
    it('check for malformed token', async () => {
      await expect(
        service.getStoredTokenFromRefreshTokenPayload({
          jwtid: null,
          subject: null,
        }),
      ).rejects.toThrowError(CustomHttpException);
    });

    it('get stored token from refresh token payload', async () => {
      repository.findById.mockResolvedValue(refreshToken);
      await expect(
        service.getStoredTokenFromRefreshTokenPayload({
          jwtid: 1,
          subject: 1,
        }),
      ).resolves.not.toThrow();
      expect(repository.findById).toHaveBeenCalledTimes(1);
    });
  });

  it('getRefreshTokenByUserId', async () => {
    const userId = '1';

    const filter: QueryPrisma = {
      limit: 10,
      page: 1,
    };

    repository.findAndCount.mockResolvedValue(['results', 'total']);
    await service.getRefreshTokenByUserId(userId, filter);
    expect(repository.paginate).toHaveBeenCalledTimes(1);
  });

  describe('revokeRefreshTokenById', () => {
    it('revoke refresh token error for invalid id', async () => {
      repository.findById.mockResolvedValue(null);
      await expect(
        service.revokeRefreshTokenById('1', '1'),
      ).rejects.toThrowError(NotFoundException);
      expect(repository.findById).toHaveBeenCalledTimes(1);
    });

    it('revoke refresh token of another user', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue({
        userId: 2,
      });
      await expect(
        service.revokeRefreshTokenById('1', '1'),
      ).rejects.toThrowError(ForbiddenException);
      expect(repository.findById).toHaveBeenCalledTimes(1);
    });

    it('revoke refresh token for valid id', async () => {
      jest.spyOn(repository, 'findById').mockResolvedValue({
        userId: '1',
      });
      await service.revokeRefreshTokenById('1', '1');
      expect(repository.findById).toHaveBeenCalledTimes(1);
    });
  });
});
