import { Injectable, UnprocessableEntityException } from '@nestjs/common';


import { CreateEmailTemplateDto } from 'src/modules/email-template/dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from 'src/modules/email-template/dto/update-email-template.dto';
// import { EmailTemplateRepository } from 'src/email-template/email-template.repository';
import { CommonServiceInterface } from 'src/common/interfaces/common-service.interface';
import { EmailTemplateSerializer } from 'src/modules/email-template/serializer/email-template.serializer';
import { EmailTemplatesSearchFilterDto } from 'src/modules/email-template/dto/email-templates-search-filter.dto';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { Pagination } from 'src/modules/paginate';
import { EmailTemplateEntity } from './entities/email-template.entity';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { IEmailTemplateRepository } from './i-email-template.repository';

@Injectable()
export class EmailTemplateService
  /*implements CommonServiceInterface<EmailTemplate>*/
{
  constructor(
    
    private readonly emailTemplateRepository: IEmailTemplateRepository
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
    return await this.emailTemplateRepository.findBySlug(slug);
  }

  /**
   * Create new Email Template
   * @param createEmailTemplateDto
   */
  async create(
    createEmailTemplateDto: CreateEmailTemplateDto
  ): Promise<EmailTemplateSerializer> {
    /*return this.repository.createEntity({
      ...createEmailTemplateDto,
      slug: this.slugify(createEmailTemplateDto.title)
    });*/
    const emailTemplate = new EmailTemplateEntity(createEmailTemplateDto)
    emailTemplate.slug = this.slugify(createEmailTemplateDto.title)
    const emailTemplateSaved = await this.emailTemplateRepository.create(emailTemplate)
    return this.transform(emailTemplateSaved)
  }

  /**
   * Get all email templates paginated list
   * @param filter
   */
  async findAll(
    filter: EmailTemplatesSearchFilterDto
  ): Promise<EmailTemplateSerializer[]> {
    /*return this.repository.paginate(
      filter,
      [],
      ['title', 'subject', 'body', 'sender']
    );*/
    const emails = await this.emailTemplateRepository.findAll()
    return this.transformMany(emails)
  }

  /**
   * Find Email Template By Id
   * @param id
   */
  async findOne(id: string): Promise<EmailTemplateSerializer> {
    // return this.repository.get(id);    
    return this.transform(await this.emailTemplateRepository.findById(id));
  }

  /**
   * Update Email Template by id
   * @param id
   * @param updateEmailTemplateDto
   */
  async update(
    id: string,
    updateEmailTemplateDto: UpdateEmailTemplateDto
  ): Promise<EmailTemplateSerializer> {
    const template = await this.emailTemplateRepository.findById(id); 
    
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
    template.update(updateEmailTemplateDto)
    template.slug = this.slugify(updateEmailTemplateDto.title)
    const emailSaved = await this.emailTemplateRepository.update(template)
    return this.transform(emailSaved)
  }

  /**
   * Remove Email Template By id
   * @param id
   */
  async remove(id: string): Promise<void> {    
    const template = await this.emailTemplateRepository.findById(id);
    if (template.isDefault) {
      throw new ForbiddenException(
        ExceptionTitleList.DeleteDefaultError,
        StatusCodesList.DeleteDefaultError
      );
    }
    await this.emailTemplateRepository.delete(id);
  }

  /**
   * transform role entity
   * @param model
   * @param transformOption
   */
  transform(model: EmailTemplateEntity, transformOption = {}): EmailTemplateSerializer {
    return plainToInstance(
      EmailTemplateSerializer,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  
  
  /**
   * transform many roles collection
   * @param models
   * @param transformOption
   */
  transformMany(models: EmailTemplateEntity[], transformOption = {}): EmailTemplateSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
