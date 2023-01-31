import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EmailTemplateEntity {
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

  constructor(data?: Partial<EmailTemplateEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }
}
