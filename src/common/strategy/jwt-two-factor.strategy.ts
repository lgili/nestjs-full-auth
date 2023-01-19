import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import * as config from 'config';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { CustomHttpException } from 'src/exception/custom-http.exception';
import { JwtPayloadDto } from 'src/modules/auth/dto/jwt-payload.dto';

import { UserEntity } from 'src/modules/auth/entity/user.entity';
import { IUserRepository } from 'src/modules/auth/i-user.repository';

@Injectable()
export class JwtTwoFactorStrategy extends PassportStrategy(
  Strategy,
  'jwt-two-factor',
) {
  constructor(private userRepository: IUserRepository) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.Authentication;
        },
      ]),
      secretOrKey: process.env.JWT_SECRET || config.get('jwt.secret'),
    });
  }

  async validate(payload: JwtPayloadDto): Promise<UserEntity> {
    const { isTwoFAAuthenticated, subject } = payload;
    // const user = await this.userRepository.findOne(Number(subject), {
    //   relations: ['role', 'role.permission']
    // });
    // FIXME:
    const user = await this.userRepository.findById(subject);
    if (!user.isTwoFAEnabled) {
      return user;
    }
    if (isTwoFAAuthenticated) {
      return user;
    }
    throw new CustomHttpException(
      'otpRequired',
      HttpStatus.FORBIDDEN,
      StatusCodesList.OtpRequired,
    );
  }
}
