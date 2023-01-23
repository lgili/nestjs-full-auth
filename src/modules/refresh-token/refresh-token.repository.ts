import { Injectable } from '@nestjs/common';

import { BaseRepository } from 'src/common/repository/base.repository';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { RefreshTokenEntity } from './entities/refresh-token.entity';



@Injectable()
export class RefreshTokenRepository extends BaseRepository<RefreshTokenEntity> {
  constructor(private prisma: PrismaService) {
    super('refreshToken', prisma);
  }
}
