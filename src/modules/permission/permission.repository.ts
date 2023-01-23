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
import { PermissionEntity } from './entities/permission.entity';
import { PermissionSerializer } from './serializer/permission.serializer';


@Injectable()
export class PermissionRepository extends BaseRepository<PermissionEntity, PermissionSerializer> {
  constructor(private prisma: PrismaService) {
    super('permission', prisma);
  }
}
