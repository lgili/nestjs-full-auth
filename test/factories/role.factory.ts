import { faker } from '@faker-js/faker';
import { BaseRepository } from 'src/common/repository/base.repository';
import { RoleEntity } from 'src/role/entities/role.entity';

import { prisma } from '../factories/ prisma-utils';

export class RoleFactory extends BaseRepository<RoleEntity> {
  constructor() {
    super('role', prisma);
  }

  static new() {
    return new RoleFactory();
  }

  build(role: Partial<RoleEntity> = {}): RoleEntity {
    return new RoleEntity({
      name: faker.name.jobTitle(),
      description: faker.lorem.sentence(),
      ...role,
    });
  }

  async save(role: Partial<RoleEntity> = {}): Promise<RoleEntity> {
    return await this.create({
      data: this.build(role),
    });
  }

  async createMany(roles: Partial<RoleEntity>[]) {
    return Promise.all([roles.map((role) => this.save(role))]);
  }
}
