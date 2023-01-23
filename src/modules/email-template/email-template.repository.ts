import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/base.repository';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';

import { EmailTemplateEntity } from './entities/email-template.entity';

@Injectable()
export class EmailTemplateRepository extends BaseRepository<EmailTemplateEntity> {
  constructor(private prisma: PrismaService) {
    super('emailTemplate', prisma);
  }
}
