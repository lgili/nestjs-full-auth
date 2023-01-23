import { Injectable } from '@nestjs/common';
import { User as PersistenceUser } from '@prisma/client';
import {
  classToPlain,
  instanceToPlain,
  plainToClass,
  plainToInstance,
} from 'class-transformer';
import { BaseRepository } from 'src/common/repository/base.repository';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { EmailTemplateEntity } from './entities/email-template.entity';
import { EmailTemplateSerializer } from './serializer/email-template.serializer';


@Injectable()
export class EmailTemplateRepository extends BaseRepository<EmailTemplateEntity, EmailTemplateSerializer> {
  constructor(private prisma: PrismaService) {
    super('emailTemplate', prisma);
  }
}
