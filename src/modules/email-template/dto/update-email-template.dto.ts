import { Optional } from '@nestjs/common';
import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateEmailTemplateDto } from 'src/modules/email-template/dto/create-email-template.dto';

export class UpdateEmailTemplateDto extends PartialType(
  CreateEmailTemplateDto,
) {
  @ApiPropertyOptional()
  @Optional()
  @IsString()
  title: string;
}
