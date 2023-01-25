import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';

export const GROUP_USER = 'owner';

export class RoleEntity {
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional()
  @Expose({
    groups: [GROUP_USER],
  })
  description: string;

  @Type(() => PermissionEntity)
  permissions: PermissionEntity[];

  @ApiPropertyOptional()
  @Expose({
    groups: [GROUP_USER],
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: [GROUP_USER],
  })
  updatedAt: Date;

  constructor(data?: Partial<RoleEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
