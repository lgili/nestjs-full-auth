import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { PrismaService } from 'src/prisma/prisma.service';

import { PermissionEntity } from './entities/permission.entity';

@Injectable()
export class PermissionRepository extends BaseRepository<PermissionEntity> {
  constructor(private prisma: PrismaService) {
    super('permission', prisma);
  }
}
