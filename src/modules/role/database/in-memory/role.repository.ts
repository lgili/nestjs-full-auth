import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';
import { RoleEntity } from '../../entities/role.entity';
import { IRoleRepository } from '../../i-role.repository';
import { RoleSerializer } from '../../serializer/role.serializer';


@Injectable()
export class RoleInMemoryRepository implements IRoleRepository {
  private roles: RoleEntity[] = [];


  async findById(id: string): Promise<RoleEntity> {
    const userIndex = this.roles.findIndex((userItem) => {
      return userItem.id === id;
    });

    return this.roles[userIndex];
  }

  async findByName(name: string): Promise<RoleEntity> {
    const roleIndex = this.roles.findIndex((roleItem) => {
      return roleItem.name === name;
    });

    return this.roles[roleIndex];
  }

  async findAll(): Promise<RoleEntity[]> {
    return this.roles;
  }

  async create(role: RoleEntity, permission: PermissionEntity[]): Promise<RoleEntity> {
    this.roles.push(role);

    return role;
  }

  async update(role: RoleEntity): Promise<RoleEntity> {
    const roleIndex = this.roles.findIndex((roleItem) => {
      return roleItem.id === role.id;
    });

    this.roles[roleIndex] = role;
    return role;
  }

  async delete(id: string): Promise<void> {
    const roleIndex = this.roles.findIndex((roleItem) => {
      return roleItem.id === id;
    });

    this.roles.splice(roleIndex, 1);
  }


}
