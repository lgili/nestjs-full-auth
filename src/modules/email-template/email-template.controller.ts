import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import JwtTwoFactorGuard from 'src/common/guard/jwt-two-factor.guard';
import { PermissionGuard } from 'src/common/guard/permission.guard';
import { QueryPrisma } from 'src/common/repository/query-buider-frontend/interfaces/Query';
import { CreateEmailTemplateDto } from 'src/modules/email-template/dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from 'src/modules/email-template/dto/update-email-template.dto';
import { EmailTemplateService } from 'src/modules/email-template/email-template.service';

import { Pagination } from '../paginate';
import { EmailTemplateEntity } from './entities/email-template.entity';

@ApiTags('email-templates')
@UseGuards(JwtTwoFactorGuard, PermissionGuard)
@Controller('email-templates')
export class EmailTemplateController {
  constructor(private readonly emailTemplateService: EmailTemplateService) {}

  @Post()
  create(
    @Body()
    createEmailTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplateEntity> {
    return this.emailTemplateService.create(createEmailTemplateDto);
  }

  @Get()
  findAll(
    @Query()
    filter: QueryPrisma,
  ): Promise<Pagination<EmailTemplateEntity>> {
    return this.emailTemplateService.findAll(filter);
  }

  @Get(':id')
  findOne(
    @Param('id')
    id: string,
  ): Promise<EmailTemplateEntity> {
    return this.emailTemplateService.findOne(id);
  }

  @Put(':id')
  update(
    @Param('id')
    id: string,
    @Body()
    updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplateEntity> {
    return this.emailTemplateService.update(id, updateEmailTemplateDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id')
    id: string,
  ): Promise<void> {
    return this.emailTemplateService.remove(id);
  }
}
