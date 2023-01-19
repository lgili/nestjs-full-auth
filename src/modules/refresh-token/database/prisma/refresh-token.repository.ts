import { Injectable, Logger } from '@nestjs/common';
import { RefreshToken as PersistenceRefreshToken } from '@prisma/client';
import {
  classToPlain,
  instanceToPlain,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { RefreshTokenEntity } from 'src/modules/refresh-token/entities/refresh-token.entity';

import { IRefreshTokenRepository } from '../../i-refresh-token.repository';

@Injectable()
export class RefreshTokenPrismaRepository implements IRefreshTokenRepository {
  private readonly logger = new Logger(RefreshTokenPrismaRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<RefreshTokenEntity> {
    const token = await this.prismaService.refreshToken.findUnique({
      where: {
        id,
      },
    });

    if (!token) {
      return null;
    }

    return this.toDomain(token);
  }

  async findByUser(userId: string): Promise<RefreshTokenEntity[]> {
    const token = await this.prismaService.refreshToken.findMany({
      where: {
        userId: userId,
        isRevoked: false,
        expires: {
          gte: new Date(),
        },
      },
    });

    if (!token) {
      return null;
    }

    return this.transformMany(token);
  }

  async findAll(): Promise<RefreshTokenEntity[]> {
    const tokens = await this.prismaService.refreshToken.findMany();

    if (!tokens) {
      return [];
    }

    return this.transformMany(tokens);
  }

  async create(token: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    try {
      const data = this.toPersistence(token);

      const tokenSaved = await this.prismaService.refreshToken.create({
        data,
      });
      return this.toDomain(tokenSaved);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async update(token: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    const data = this.toPersistence(token);
    delete data.id;
    const tokenUpdated = await this.prismaService.refreshToken.update({
      where: {
        id: token.id,
      },
      data,
    });

    return this.toDomain(tokenUpdated);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.refreshToken.delete({ where: { id } });
  }

  /**
   * toDomain user
   * @param model
   * @param transformOption
   */
  toDomain(
    model: PersistenceRefreshToken,
    transformOption = {},
  ): RefreshTokenEntity {
    return plainToInstance(
      RefreshTokenEntity,
      instanceToPlain(model, transformOption),
      transformOption,
    );
  }

  /**
   * toDomain users collection
   * @param models
   * @param transformOption
   */
  transformMany(
    models: PersistenceRefreshToken[],
    transformOption = {},
  ): RefreshTokenEntity[] {
    return models.map((model) => this.toDomain(model, transformOption));
  }

  toPersistence(token: RefreshTokenEntity) {
    return {
      id: token.id,
      userId: token.userId,
      ip: token.ip,
      userAgent: token.userAgent,
      browser: token.browser,
      os: token.os,
      isRevoked: token.isRevoked,
      expires: token.expires,
    };
  }
}
