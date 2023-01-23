import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModelSerializer } from 'src/common/serializer/model.serializer';

export class EmailTemplateSerializer extends ModelSerializer {
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  sender: string;

  @ApiProperty()
  subject: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  isDefault: boolean;

  @ApiPropertyOptional()
  createdAt: Date;

  @ApiPropertyOptional()
  updatedAt: Date;
}
