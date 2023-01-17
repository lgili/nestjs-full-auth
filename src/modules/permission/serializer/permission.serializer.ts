import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

import { ModelSerializer } from 'src/common/serializer/model.serializer';

export const basicFieldGroupsForSerializing: string[] = ['basic'];

export class PermissionSerializer extends ModelSerializer {
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  id: string;

  @ApiProperty()
  resource: string;

  @ApiProperty()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  description: string;

  @ApiProperty()
  path: string;

  @ApiProperty()
  method: string;

  @ApiProperty()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  isDefault: boolean;

  @ApiPropertyOptional()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  createdAt: Date;

  @ApiPropertyOptional()
  @Expose({
    groups: basicFieldGroupsForSerializing
  })
  updatedAt: Date;
}
