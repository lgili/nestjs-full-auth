import { Injectable } from '@nestjs/common';

import { BaseRepository } from 'src/common/repository/base.repository';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { UserEntity } from 'src/modules/auth/entity/user.entity';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(private prisma: PrismaService) {
    super('user', prisma);
  }
}
