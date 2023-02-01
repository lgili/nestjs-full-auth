import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { PrismaService } from 'src/prisma/prisma.service';

import { RoleEntity } from './entities/role.entity';

@Injectable()
export class RoleRepository extends BaseRepository<RoleEntity> {
  constructor(private prisma: PrismaService) {
    super('role', prisma);
  }
}
