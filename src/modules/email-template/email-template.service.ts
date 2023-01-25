import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ExceptionTitleList } from 'src/common/constants/exception-title-list.constants';
import { StatusCodesList } from 'src/common/constants/status-codes-list.constants';
import QueryBuilder from 'src/common/repository/filter-prisma';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { CreateEmailTemplateDto } from 'src/modules/email-template/dto/create-email-template.dto';
import { EmailTemplatesSearchFilterDto } from 'src/modules/email-template/dto/email-templates-search-filter.dto';
import { UpdateEmailTemplateDto } from 'src/modules/email-template/dto/update-email-template.dto';

import { Pagination } from '../paginate';
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
    return await this.emailTemplateRepository.findBy({
      fieldName: 'slug',
      value: slug,
    });
  }

  /**
   * Create new Email Template
   * @param createEmailTemplateDto
   */
  async create(
    createEmailTemplateDto: CreateEmailTemplateDto,
  ): Promise<EmailTemplateEntity> {
    const emailTemplate = new EmailTemplateEntity(createEmailTemplateDto);
    emailTemplate.slug = this.slugify(createEmailTemplateDto.title);

    const emailTemplateSaved = await this.emailTemplateRepository.create({
      data: emailTemplate,
      cls: EmailTemplateEntity,
    });

    return emailTemplateSaved;
  }

  /**
   * Get all email templates paginated list
   * @param filter
   */
  async findAll(
    filter: EmailTemplatesSearchFilterDto,
  ): Promise<Pagination<EmailTemplateEntity>> {
    /*return this.repository.paginate(
      filter,
      [],
      ['title', 'subject', 'body', 'sender']
    );*/
    const qr = new QueryBuilder({
      page: filter.page,
      perPage: filter.perPage,
      sort: 'title, subject, body, sender',
    });
    const filterOptions = qr.filter().paginate().sort().build();

    return await this.emailTemplateRepository.paginate({
      searchFilter: filterOptions,
      cls: EmailTemplateEntity,
    });
  }

  /**
   * Find Email Template By Id
   * @param id
   */
  async findOne(id: string): Promise<EmailTemplateEntity> {
    const template = await this.emailTemplateRepository.findOne({
      id,
      cls: EmailTemplateEntity,
    });

    return template;
  }

  /**
   * Update Email Template by id
   * @param id
   * @param updateEmailTemplateDto
   */
  async update(
    id: string,
    updateEmailTemplateDto: UpdateEmailTemplateDto,
  ): Promise<EmailTemplateEntity> {
    const template = await this.emailTemplateRepository.findOne({
      id,
      cls: EmailTemplateEntity,
    });

    const hasTitle = await this.emailTemplateRepository.findBy({
      fieldName: 'title',
      value: updateEmailTemplateDto.title,
    });

    if (hasTitle) {
      throw new UnprocessableEntityException({
        property: 'title',
        constraints: {
          unique: 'already taken',
        },
      });
    }

    const emailTemplate = new EmailTemplateEntity(updateEmailTemplateDto);
    emailTemplate.slug = this.slugify(updateEmailTemplateDto.title);

    const emailSaved = await this.emailTemplateRepository.update({
      id: template.id,
      data: emailTemplate,
      cls: EmailTemplateEntity,
    });

    return emailSaved;
  }

  /**
   * Remove Email Template By id
   * @param id
   */
  async remove(id: string): Promise<void> {
    const template = await this.emailTemplateRepository.findOne({
      id,
    });

    if (template.isDefault) {
      throw new ForbiddenException(
        ExceptionTitleList.DeleteDefaultError,
        StatusCodesList.DeleteDefaultError,
      );
    }
    await this.emailTemplateRepository.delete(id);
  }
}
