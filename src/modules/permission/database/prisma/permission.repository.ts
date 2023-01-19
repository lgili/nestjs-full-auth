import { Injectable, Logger } from '@nestjs/common';
import { Permission as PersistencePermission } from '@prisma/client';
import {
  classToPlain,
  instanceToPlain,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';
import { RoleEntity } from 'src/modules/role/entities/role.entity';

import { IPermissionRepository } from '../../i-permission.repository';

@Injectable()
export class PermissionPrismaRepository implements IPermissionRepository {
  private readonly logger = new Logger(PermissionPrismaRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<PermissionEntity> {
    const permission = await this.prismaService.permission.findUnique({
      where: {
        id,
      },
    });

    if (!permission) {
      return null;
    }

    return this.toDomain(permission);
  }

  async findByName(description: string): Promise<PermissionEntity> {
    const permission = await this.prismaService.permission.findUnique({
      where: {
        description,
      },
    });

    if (!permission) {
      return null;
    }

    return this.toDomain(permission);
  }

  async findSeveralById(ids: string[]): Promise<PermissionEntity[]> {
    const permissions: PermissionEntity[] = [];

    ids.forEach(async (id) => {
      const permission = await this.prismaService.permission.findUnique({
        where: {
          id,
        },
      });
      permissions.push(this.toDomain(permission));
    });

    return permissions;
  }

  async findAll(): Promise<PermissionEntity[]> {
    const permissions = await this.prismaService.permission.findMany();

    if (!permissions) {
      return [];
    }

    return this.transformMany(permissions);
  }

  async create(permission: PermissionEntity): Promise<PermissionEntity> {
    try {
      const data = this.toPersistence(permission);

      const permissionSaved = await this.prismaService.permission.create({
        data,
      });
      return this.toDomain(permissionSaved);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async update(permission: PermissionEntity): Promise<PermissionEntity> {
    const data = this.toPersistence(permission);
    delete data.id;
    const permissionUpdated = await this.prismaService.permission.update({
      where: {
        id: permission.id,
      },
      data,
    });

    return this.toDomain(permissionUpdated);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.permission.delete({ where: { id } });
  }

  /**
   * toDomain user
   * @param model
   * @param transformOption
   */
  toDomain(
    model: PersistencePermission,
    transformOption = {},
  ): PermissionEntity {
    return plainToInstance(
      PermissionEntity,
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
    models: PersistencePermission[],
    transformOption = {},
  ): PermissionEntity[] {
    return models.map((model) => this.toDomain(model, transformOption));
  }

  toPersistence(permission: PermissionEntity) {
    return {
      id: permission.id,
      resource: permission.resource,
      description: permission.description,
      path: permission.path,
      method: permission.method,
      isDefault: permission.isDefault,
    };
  }
}
