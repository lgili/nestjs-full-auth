import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';
import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { IPermissionRepository } from '../../i-permission.repository';
import { PermissionSerializer } from '../../serializer/permission.serializer';

@Injectable()
export class PermissionInMemoryRepository implements IPermissionRepository {
  private permissions: PermissionEntity[] = [];

  async findById(id: string): Promise<PermissionEntity> {
    const userIndex = this.permissions.findIndex((userItem) => {
      return userItem.id === id;
    });

    return this.permissions[userIndex];
  }

  async findSeveralById(ids: string[]): Promise<PermissionEntity[]> {
    const permissions: PermissionEntity[] = [];
    ids.forEach(async (id) => {
      const userIndex = this.permissions.findIndex((userItem) => {
        return userItem.id === id;
      });

      permissions.push(this.permissions[userIndex]);
    });

    return permissions;
  }

  async findByName(name: string): Promise<PermissionEntity> {
    const permissionIndex = this.permissions.findIndex((permissionItem) => {
      return permissionItem.description === name;
    });

    return this.permissions[permissionIndex];
  }

  async findAll(): Promise<PermissionEntity[]> {
    return this.permissions;
  }

  async create(permission: PermissionEntity): Promise<PermissionEntity> {
    this.permissions.push(permission);

    return permission;
  }

  async update(permission: PermissionEntity): Promise<PermissionEntity> {
    const permissionIndex = this.permissions.findIndex((permissionItem) => {
      return permissionItem.id === permission.id;
    });

    this.permissions[permissionIndex] = permission;
    return permission;
  }

  async delete(id: string): Promise<void> {
    const permissionIndex = this.permissions.findIndex((permissionItem) => {
      return permissionItem.id === id;
    });

    this.permissions.splice(permissionIndex, 1);
  }
}
