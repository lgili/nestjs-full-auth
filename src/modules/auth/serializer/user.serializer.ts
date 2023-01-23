import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Exclude, Expose, Transform, Type } from 'class-transformer';
import { DeepPartial } from 'src/common/repository/type.repository';
import { ModelSerializer } from 'src/common/serializer/model.serializer';
import { UserStatusEnum } from 'src/modules/auth/user-status.enum';
import { RoleSerializer } from 'src/modules/role/serializer/role.serializer';


export const GROUP_USER = 'owner';
export const GROUP_ALL_USERS = 'all_users';
export const GROUP_ADMIN = 'admin';
export const GROUP_DEFAULT = 'timestamps';

/**
 * user serializer
 */
export class UserSerializer extends ModelSerializer {
  @Expose({ groups: [GROUP_USER, GROUP_ADMIN] })
  id: string;

  @Exclude()
  password: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  address: string;

  @ApiProperty()
  @Expose({
    groups: [GROUP_USER],
  })
  isTwoFAEnabled: boolean;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  contact: string;

  @ApiProperty()
  @Transform(({ value }) => (value !== 'null' ? value : ''))
  avatar: string;

  @ApiPropertyOptional()
  @Expose({
    groups: [GROUP_ADMIN],
  })
  status: UserStatusEnum;

  @ApiHideProperty()
  @Expose({
    groups: [GROUP_USER],
  })
  @Type(() => RoleSerializer)  
  role: RoleSerializer;

  @Exclude({
    toClassOnly: true,
  })
  roleId: string;

  @Exclude({
    toClassOnly: true,
  })
  tokenValidityDate: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: [GROUP_DEFAULT],
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: [GROUP_DEFAULT],
  })
  updatedAt: Date;

  async update(data?: DeepPartial<UserSerializer>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
