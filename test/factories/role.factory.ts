// import { getRepository } from 'typeorm';
// import { faker } from '@faker-js/faker';
import { BaseRepository } from 'src/common/repository/base.repository';
import { RoleEntity } from 'src/modules/role/entities/role.entity';

import { prisma } from '../factories/ prisma-utils';

export class RoleFactory extends BaseRepository<RoleEntity> {
  constructor() {
    super('role', prisma);
  }

  static new() {
    return new RoleFactory();
  }

  // async createRole(role: Partial<RoleEntity> = {}) {
  //   // const roleRepository = getRepository(RoleEntity);

  //   return await prisma.role.create({
  //     data: {
  //       name: faker.name.jobTitle(),
  //       description: faker.lorem.sentence(),
  //       ...role,
  //     },
  //   });
  //   // return roleRepository.save({
  //   //   name: faker.name.jobTitle(),
  //   //   description: faker.lorem.sentence(),
  //   //   ...role
  //   // });
  // }

  // async createMany(roles: Partial<RoleEntity>[]) {
  //   return Promise.all([roles.map((role) => this.create(role))]);
  // }
}
