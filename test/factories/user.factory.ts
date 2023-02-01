import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { UserEntity } from 'src/auth/entity/user.entity';
import { UserStatusEnum } from 'src/auth/user-status.enum';
import { BaseRepository } from 'src/common/repository/base.repository';
import { DeepPartial } from 'src/common/repository/type.repository';
import { RoleEntity } from 'src/role/entities/role.entity';

import { prisma } from './ prisma-utils';

export class UserFactory extends BaseRepository<UserEntity> {
  constructor() {
    super('user', prisma);
  }

  private role: RoleEntity;

  static new() {
    return new UserFactory();
  }

  withRole(role: RoleEntity) {
    this.role = role;

    return this;
  }

  async build(user: DeepPartial<UserEntity> = {}): Promise<UserEntity> {
    const salt = await bcrypt.genSalt();

    const password = await this.hashPassword(
      user.password || faker.internet.password(),
      salt,
    );

    return new UserEntity({
      username: faker.internet.userName().toLowerCase(),
      email: faker.internet.email().toLowerCase(),
      name: `${faker.name.firstName()} ${faker.name.lastName()}`,
      address: faker.address.streetAddress(),
      contact: faker.phone.number(),
      avatar: faker.image.avatar(),
      salt,
      token: faker.datatype.uuid(),
      status: UserStatusEnum.ACTIVE,
      isTwoFAEnabled: false,
      ...user,
      password,
    });
  }

  async save(user: DeepPartial<UserEntity> = {}): Promise<UserEntity> {
    const payload = await this.build(user);

    if (this.role) payload.role = this.role;

    const userSaved = await this.create({
      data: payload,
      cls: UserEntity,
    });

    return await this.findById({
      id: userSaved.id,
    });
  }

  async createMany(users: DeepPartial<UserEntity>[]) {
    return Promise.all([users.map((user) => this.save(user))]);
  }

  private hashPassword(password, salt) {
    return bcrypt.hash(password, salt);
  }
}
