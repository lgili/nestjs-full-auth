import {
  HttpStatus,
  Inject,
  Injectable,
  UnprocessableEntityException
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import * as config from 'config';
import { existsSync, unlinkSync } from 'fs';


import { UserSearchFilterDto } from 'src/modules/auth/dto/user-search-filter.dto';
import { UserEntity } from 'src/modules/auth/entity/user.entity';

import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { ValidationPayloadInterface } from 'src/common/interfaces/validation-error.interface';
import { CustomHttpException } from 'src/exception/custom-http.exception';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { NotFoundException } from 'src/exception/not-found.exception';
import { UnauthorizedException } from 'src/exception/unauthorized.exception';
import { IUserRepository } from 'src/modules/auth/i-user.repository';
import { UserStatusEnum } from 'src/modules/auth/user-status.enum';

import { Pagination } from 'src/modules/paginate';
import { CreateUserDto } from './dto/create-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { UserSerializer } from './serializer/user.serializer';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { MailService } from '../mail/mail.service';
import { RefreshTokenService } from '../refresh-token/refresh-token.service';


const throttleConfig = config.get('throttle.login');
const jwtConfig = config.get('jwt');
const appConfig = config.get('app');

const BASE_OPTIONS: SignOptions = {
  issuer: appConfig.appUrl,
  audience: appConfig.frontendUrl
};
@Injectable()
export class AuthService {
  constructor(    
    private readonly userRepository: IUserRepository,
    private readonly jwt: JwtService,
    private readonly mailService: MailService,
    private readonly refreshTokenService: RefreshTokenService,
  ) {}

  
  /**
   * add new user
   * @param createUserDto
   */
  async register(
    registerUserDto: RegisterUserDto
  ): Promise<UserSerializer> {    
    
    const user = new UserEntity(registerUserDto)
    console.log(user)
    const userSaved = await this.userRepository.create(user);    
    console.log(userSaved)
    return this.transform(userSaved);
  }

 
  /**
   * get user profile
   * @param user
   */
  async get(user: UserEntity): Promise<UserSerializer> {
    // return this.userRepository.transform(user, {
    //   groups: ownerUserGroupsForSerializing
    // });
    const userSaved = await this.userRepository.findById(user.id);
    return this.transform(userSaved)
  }

  /**
   * Get user By Id
   * @param id
   */
  async findById(id: string): Promise<UserSerializer> {
    // return this.userRepository.get(id, ['role'], {
    //   groups: [
    //     ...adminUserGroupsForSerializing,
    //     ...ownerUserGroupsForSerializing
    //   ]
    // });
    const userSaved = await this.userRepository.findById(id);
    return this.transform(userSaved)
  }

  /**
   * Generate access token
   * @param user
   * @param isTwoFAAuthenticated
   */
  public async generateAccessToken(
    user: UserSerializer,
    isTwoFAAuthenticated = false
  ): Promise<string> {
    const opts: SignOptions = {
      ...BASE_OPTIONS,
      subject: String(user.id)
    };
    return this.jwt.signAsync({
      ...opts,
      isTwoFAAuthenticated
    });
  }

    /**
   * transform role entity
   * @param model
   * @param transformOption
   */
    transform(model: UserEntity, transformOption = {}): UserSerializer {
      return plainToInstance(
        UserSerializer,
        instanceToPlain(model, transformOption),
        transformOption
      );
    }
  
    
    
    /**
     * transform many roles collection
     * @param models
     * @param transformOption
     */
    transformMany(models: UserEntity[], transformOption = {}): UserSerializer[] {
      return models.map((model) => this.transform(model, transformOption));
    }

}
