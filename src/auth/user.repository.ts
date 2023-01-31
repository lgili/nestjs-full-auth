import { Injectable } from '@nestjs/common';
import { UserEntity } from 'src/auth/entity/user.entity';
import { BaseRepository } from 'src/common/repository/base.repository';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

@Injectable()
export class UserRepository extends BaseRepository<UserEntity> {
  constructor(private prisma: PrismaService) {
    super('user', prisma);
  }
}
