import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

import { UserStatusEnum } from 'src/modules/auth/user-status.enum';
import { RoleEntity } from 'src/modules/role/entities/role.entity';

/**
 * Same as Partial<T> but goes deeper and makes Partial<T> all its properties and sub-properties.
 */
export declare type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

/**
 * User Entity
 */
export class UserEntity {
  id?: string;

  name: string;
  username: string;

  email: string;

  password: string;

  address: string;

  contact: string;

  avatar: string;

  status: UserStatusEnum;

  @Exclude({
    toPlainOnly: true,
  })
  token: string;

  tokenValidityDate: Date;

  @Exclude({
    toPlainOnly: true,
  })
  salt: string;

  @Exclude({
    toPlainOnly: true,
  })
  twoFASecret?: string;

  @Exclude({
    toPlainOnly: true,
  })
  twoFAThrottleTime?: Date;

  isTwoFAEnabled: boolean;

  @Exclude({
    toPlainOnly: true,
  })
  skipHashPassword = false;

  role: RoleEntity;

  roleId: string;

  constructor(data?: DeepPartial<UserEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  async update(data?: Partial<UserEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  async hashPasswordBeforeInsert() {
    if (this.password && !this.skipHashPassword) {
      await this.hashPassword();
    }
  }

  async hashPasswordBeforeUpdate() {
    if (this.password && !this.skipHashPassword) {
      await this.hashPassword();
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    const hash = await bcrypt.hash(password, this.salt);
    return hash === this.password;
  }

  async hashPassword() {
    this.salt = await bcrypt.genSalt();
    this.password = await bcrypt.hash(this.password, this.salt);
  }
}
