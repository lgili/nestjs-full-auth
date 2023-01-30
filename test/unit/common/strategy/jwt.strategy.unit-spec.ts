import { Test } from '@nestjs/testing';
import { QueryPrisma } from 'src/common/repository/query-buider-frontend/interfaces/Query';
import { FindInterface } from 'src/common/repository/type.repository';
import { JwtStrategy } from 'src/common/strategy/jwt.strategy';
import { UnauthorizedException } from 'src/exception/unauthorized.exception';
import { JwtPayloadDto } from 'src/modules/auth/dto/jwt-payload.dto';
import { UserEntity } from 'src/modules/auth/entity/user.entity';
import { UserRepository } from 'src/modules/auth/user.repository';

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

const findOptions: FindInterface<UserEntity> = {
  searchFilter: query,
};

const mockUserRepository = () => ({
  findOne: jest.fn(),
});

describe('Test JWT strategy', () => {
  let userRepository, jwtStrategy: JwtStrategy;
  beforeEach(async () => {
    jest.mock('config', () => ({
      default: {
        get: () => jest.fn().mockImplementation(() => 'hello'),
      },
    }));

    const module = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: UserRepository,
          useFactory: mockUserRepository,
        },
      ],
    }).compile();
    jwtStrategy = await module.get<JwtStrategy>(JwtStrategy);
    userRepository = await module.get<UserRepository>(UserRepository);
  });

  describe('validate user', () => {
    it('should return user if username is found on database', async () => {
      const user = new UserEntity({
        name: 'test',
        username: 'tester',
      });

      const payload: JwtPayloadDto = {
        subject: '1',
      };
      userRepository.findOne.mockResolvedValue(user);
      const result = await jwtStrategy.validate(payload);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        ...findOptions,
      });
      expect(result).toEqual(user);
    });

    it('should throw error if subject is not found on database', async () => {
      const payload: JwtPayloadDto = {
        subject: '1',
      };
      userRepository.findOne.mockResolvedValue(null);
      await expect(jwtStrategy.validate(payload)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
