import { Injectable, Logger } from '@nestjs/common';
import { User as PersistenceUser } from '@prisma/client';
import { classToPlain, instanceToPlain, plainToClass, plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { IUserRepository } from 'src/modules/auth/i-user.repository';
import { UserEntity } from 'src/modules/auth/entity/user.entity';
import { UserSerializer } from '../../serializer/user.serializer';



@Injectable()
export class UserPrismaRepository implements IUserRepository {
  private readonly logger = new Logger(UserPrismaRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const user = await this.prismaService.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return null;
    }

    return this.toDomain(user);
  }

  async findAll(): Promise<UserEntity[]> {
    const users = await this.prismaService.user.findMany();

    if (!users) {
      return [];
    }

    return this.transformMany(users);
  }

  async create(user: UserEntity): Promise<UserEntity> {
    try {
      const data = this.toPersistence(user);
      const userSaved = await this.prismaService.user.create(
        {
           data
        });
      return this.toDomain(userSaved);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const data = this.toPersistence(user);
    delete data.id;
    const userUpdated = await this.prismaService.user.update({
      where: {
        id: user.id,
      },
      data,
    });

    return this.toDomain(userUpdated);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.user.delete({ where: { id } });
  }

  /**
   * toDomain user
   * @param model
   * @param transformOption
   */
  toDomain(model: PersistenceUser, transformOption = {}): UserEntity {
    return plainToInstance(
      UserEntity,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  
  /**
   * toDomain users collection
   * @param models
   * @param transformOption
   */
  transformMany(models: PersistenceUser[], transformOption = {}): UserEntity[] {
    return models.map((model) => this.toDomain(model, transformOption));
  }


  toPersistence(user: UserEntity) {
    
    const dd = instanceToPlain(
      user,      
    )
    console.log(dd)
    console.log("was")
    return {
      id: user.id,
      name: user.name,
      username: user.username,
      password: user.password,
      email: user.email,      
    };
  }
}
