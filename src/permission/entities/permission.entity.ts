import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { RoleEntity } from 'src/role/entities/role.entity';

export const GROUP_DEFAULT = 'basic';
export class PermissionEntity {
  @Expose({
    groups: [GROUP_DEFAULT],
  })
  id: string;

  @ApiProperty()
  resource: string;

  @ApiProperty()
  @Expose({
    groups: [GROUP_DEFAULT],
  })
  description: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  @Expose({
    groups: [GROUP_DEFAULT],
  })
  isDefault: boolean;

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

  @Exclude()
  roles: RoleEntity[];

  constructor(data?: Partial<PermissionEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
