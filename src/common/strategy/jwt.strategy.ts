import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import * as config from 'config';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UnauthorizedException } from 'src/exception/unauthorized.exception';
import { AuthService } from 'src/modules/auth/auth.service';
import { JwtPayloadDto } from 'src/modules/auth/dto/jwt-payload.dto';
import { UserEntity } from 'src/modules/auth/entity/user.entity';

const cookieExtractor = (req) => {
  return req?.cookies?.Authentication;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt-strategy') {
  constructor(private authService: AuthService) {
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
    const user = await this.authService.getWithPassword(subject);

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
