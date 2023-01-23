import { Injectable } from '@nestjs/common';
import { User as PersistenceUser } from '@prisma/client';
import {
  classToPlain,
  instanceToPlain,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { BaseRepository } from 'src/common/repository/base.repository';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { RefreshTokenEntity } from './entities/refresh-token.entity';
import { RefreshTokenSerializer } from './serializer/refresh-token.serializer';



@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshTokenEntity, RefreshTokenSerializer> {
  constructor(private prisma: PrismaService) {
    super('refreshToken', prisma);
  }
}
