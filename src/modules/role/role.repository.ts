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
import { RoleEntity } from './entities/role.entity';
import { RoleSerializer } from './serializer/role.serializer';


@Injectable()
export class RoleRepository extends BaseRepository<RoleEntity, RoleSerializer> {
  constructor(private prisma: PrismaService) {
    super('role', prisma);
  }
}
