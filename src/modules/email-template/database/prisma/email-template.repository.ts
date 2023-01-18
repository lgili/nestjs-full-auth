import { Injectable, Logger } from '@nestjs/common';
import { EmailTemplate as PersistenceEmailTemplate } from '@prisma/client';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';
import { EmailTemplateEntity } from '../../entities/email-template.entity';

import { IEmailTemplateRepository } from '../../i-email-template.repository';


@Injectable()
export class EmailTemplatePrismaRepository implements IEmailTemplateRepository {
  private readonly logger = new Logger(EmailTemplatePrismaRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<EmailTemplateEntity> {
    const email = await this.prismaService.emailTemplate.findUnique({
      where: {
        id,
      },
    });

    if (!email) {
      return null;
    }

    return this.toDomain(email);
  }

  async findBySlug(slug: string): Promise<EmailTemplateEntity> {
    const email = await this.prismaService.emailTemplate.findUnique({
      where: {
        slug          
      },      
    });

    if (!email) {
      return null;
    }

    return this.toDomain(email);
  }

  async findAll(): Promise<EmailTemplateEntity[]> {
    const emails = await this.prismaService.emailTemplate.findMany();

    if (!emails) {
      return [];
    }

    return this.transformMany(emails);
  }

  async create(email: EmailTemplateEntity): Promise<EmailTemplateEntity> {
    try {
      const data = this.toPersistence(email);
      
      const emailSaved = await this.prismaService.emailTemplate.create(
        {
           data
        });
      return this.toDomain(emailSaved);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async update(email: EmailTemplateEntity): Promise<EmailTemplateEntity> {
    const data = this.toPersistence(email);
    delete data.id;
    const emailUpdated = await this.prismaService.emailTemplate.update({
      where: {
        id: email.id,
      },
      data,
    });

    return this.toDomain(emailUpdated);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.emailTemplate.delete({ where: { id } });
  }

  /**
   * toDomain user
   * @param model
   * @param transformOption
   */
  toDomain(model: PersistenceEmailTemplate, transformOption = {}): EmailTemplateEntity {
    return plainToInstance(
      EmailTemplateEntity,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  
  /**
   * toDomain users collection
   * @param models
   * @param transformOption
   */
  transformMany(models: PersistenceEmailTemplate[], transformOption = {}): EmailTemplateEntity[] {
    return models.map((model) => this.toDomain(model, transformOption));
  }


  toPersistence(email: EmailTemplateEntity) {  
        
    return {
      id: email.id,
      title: email.title, 
      slug: email.slug, 
      sender: email.sender,  
      subject: email.subject,  
      body: email.body,     
      isDefault: email.isDefault       
    };
  }
}
