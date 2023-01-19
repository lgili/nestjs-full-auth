import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';
import { EmailTemplateEntity } from '../../entities/email-template.entity';
import { IEmailTemplateRepository } from '../../i-email-template.repository';
import { EmailTemplateSerializer } from '../../serializer/email-template.serializer';

@Injectable()
export class EmailTemplateInMemoryRepository
  implements IEmailTemplateRepository
{
  private emailTemplates: EmailTemplateEntity[] = [];

  async findById(id: string): Promise<EmailTemplateEntity> {
    const emailIndex = this.emailTemplates.findIndex((userItem) => {
      return userItem.id === id;
    });

    return this.emailTemplates[emailIndex];
  }

  async findBySlug(slug: string): Promise<EmailTemplateEntity> {
    const emailIndex = this.emailTemplates.findIndex((emailItem) => {
      return emailItem.slug === slug;
    });

    return this.emailTemplates[emailIndex];
  }

  async findAll(): Promise<EmailTemplateEntity[]> {
    return this.emailTemplates;
  }

  async create(email: EmailTemplateEntity): Promise<EmailTemplateEntity> {
    this.emailTemplates.push(email);

    return email;
  }

  async update(email: EmailTemplateEntity): Promise<EmailTemplateEntity> {
    const emailIndex = this.emailTemplates.findIndex((emailItem) => {
      return emailItem.id === email.id;
    });

    this.emailTemplates[emailIndex] = email;
    return email;
  }

  async delete(id: string): Promise<void> {
    const emailIndex = this.emailTemplates.findIndex((emailItem) => {
      return emailItem.id === id;
    });

    this.emailTemplates.splice(emailIndex, 1);
  }
}
