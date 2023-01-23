import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { CreateEmailTemplateDto } from 'src/modules/email-template/dto/create-email-template.dto';
import { EmailTemplatesSearchFilterDto } from 'src/modules/email-template/dto/email-templates-search-filter.dto';
import { UpdateEmailTemplateDto } from 'src/modules/email-template/dto/update-email-template.dto';
import { EmailTemplateSerializer } from 'src/modules/email-template/serializer/email-template.serializer';
import { Pagination } from 'src/modules/paginate';
import { EmailTemplateRepository } from './email-template.repository';

import { EmailTemplateEntity } from './entities/email-template.entity';


@Injectable()
/*implements CommonServiceInterface<EmailTemplate>*/
export class EmailTemplateService {
  constructor(
    private readonly emailTemplateRepository: EmailTemplateRepository,
  ) {}

  /**
   * convert string to slug
   * @param text
   */
  slugify(text: string) {
    return text
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  /**
   * Find Email Template By Slug
   * @param slug
   */
  async findBySlug(slug) {
    // return await this.repository.findOne({
    //   select: ['body'],
    //   where: {
    //     slug
    //   }
    // });
    return await this.emailTemplateRepository.findBy(
      'slug',
      slug);
  }

  /**
   * Create new Email Template
   * @param createEmailTemplateDto
   */
  async create(
    createEmailTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplateSerializer> {
    /*return this.repository.createEntity({
      ...createEmailTemplateDto,
      slug: this.slugify(createEmailTemplateDto.title)
    });*/
    const emailTemplate = new EmailTemplateEntity(createEmailTemplateDto);
    emailTemplate.slug = this.slugify(createEmailTemplateDto.title);

    const emailTemplateSaved = await this.emailTemplateRepository.create(
      emailTemplate,
    );

    return this.transform(emailTemplateSaved);
  }

  /**
   * Get all email templates paginated list
   * @param filter
   */
  async findAll(
    filter: EmailTemplatesSearchFilterDto,
  ): Promise<EmailTemplateSerializer[]> {
    /*return this.repository.paginate(
      filter,
      [],
      ['title', 'subject', 'body', 'sender']
    );*/
    const emails = await this.emailTemplateRepository.findAll();

    return this.transformMany(emails);
  }

  /**
   * Find Email Template By Id
   * @param id
   */
  async findOne(id: string): Promise<EmailTemplateSerializer> {
    const template  =  await this.emailTemplateRepository.findOne(id)
    return this.transform(template);
  }

  /**
   * Update Email Template by id
   * @param id
   * @param updateEmailTemplateDto
   */
  async update(
    id: string,
    updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplateSerializer> {
    const template = await this.emailTemplateRepository.findOne(id);

    // if (countSameDescription > 0) {
    //   throw new UnprocessableEntityException({
    //     property: 'title',
    //     constraints: {
    //       unique: 'already taken'
    //     }
    //   });
    // }

    // return this.repository.updateEntity(template, {
    //   ...updateEmailTemplateDto,
    //   slug: this.slugify(updateEmailTemplateDto.title)
    // });
    template.update(updateEmailTemplateDto); // Check if is updating TODO
    template.slug = this.slugify(updateEmailTemplateDto.title);
    const emailSaved = await this.emailTemplateRepository.update(template.id, template);

    return this.transform(emailSaved);
  }

  /**
   * Remove Email Template By id
   * @param id
   */
  async remove(id: string): Promise<void> {
    const template = await this.emailTemplateRepository.findOne(id);

    if (template.isDefault) {
      throw new ForbiddenException(
        ExceptionTitleList.DeleteDefaultError,
        StatusCodesList.DeleteDefaultError,
      );
    }
    await this.emailTemplateRepository.delete(id);
  }

  
  /**
   * transform entity
   * @param model
   * @param transformOptions
   */
  transform(model: EmailTemplateEntity, transformOptions = {}): EmailTemplateSerializer { 
    return plainToInstance(EmailTemplateSerializer, model, transformOptions) ;
  }

  /**
   * transform array of entity
   * @param models
   * @param transformOptions
   */
  transformMany(models: EmailTemplateEntity[], transformOptions = {}): EmailTemplateSerializer[] {
    return models.map((model) => this.transform(model, transformOptions));
  }
  
}
