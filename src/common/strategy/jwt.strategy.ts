import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as config from 'config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayloadDto } from 'src/auth/dto/jwt-payload.dto';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UserRepository } from 'src/auth/user.repository';
import { UnauthorizedException } from 'src/exception/unauthorized.exception';

import { QueryPrisma } from '../repository/query-buider-frontend/interfaces/Query';

const cookieExtractor = (req) => {
  return req?.cookies?.Authentication;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-strategy') {
  constructor(private userRepository: UserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'),
    });
  }

  /**
   * Validate if user exists and return user entity
   * @param payload
   */
  async validate(payload: JwtPayloadDto): Promise<UserEntity> {
    const { subject } = payload;

    const query: QueryPrisma = {
      select: 'all',
      filter: [{ path: 'id', value: subject }],
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

    const user = await this.userRepository.findOne({
      searchFilter: query,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
