import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryPrisma } from 'src/common/repository/query-buider-frontend/interfaces/Query';
import { CreateEmailTemplateDto } from 'src/email-template/dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from 'src/email-template/dto/update-email-template.dto';
import { EmailTemplateRepository } from 'src/email-template/email-template.repository';
import { EmailTemplateService } from 'src/email-template/email-template.service';
import { EmailTemplateEntity } from 'src/email-template/entities/email-template.entity';
import { ForbiddenException } from 'src/exception/forbidden.exception';
import { NotFoundException } from 'src/exception/not-found.exception';

const emailTemplateRepositoryMock = () => ({
  getAll: jest.fn(),
  findOne: jest.fn(),
  countEntityByCondition: jest.fn(),
  update: jest.fn(),
  findById: jest.fn(),
  findBy: jest.fn(),
  create: jest.fn(),
  paginate: jest.fn(),
});

const mockTemplate = {
  title: 'string',
  slug: 'string',
  sender: 'string',
  subject: 'string',
  body: 'string',
  isDefault: false,
};

describe('EmailTemplateService', () => {
  let service: EmailTemplateService, repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailTemplateService,
        {
          provide: EmailTemplateRepository,
          useFactory: emailTemplateRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<EmailTemplateService>(EmailTemplateService);
    repository = module.get<EmailTemplateRepository>(EmailTemplateRepository);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('test slugify', () => {
    const result = service.slugify('Test Email');
    expect(result).toEqual('test-email');
  });

  it('get all email-templates', async () => {
    const filter: QueryPrisma = {
      limit: 10,
      page: 1,
    };
    repository.paginate.mockResolvedValue('result');
    const results = await service.findAll(filter);
    expect(repository.paginate).toHaveBeenCalledTimes(1);
    expect(results).toEqual('result');
  });

  it('create email template', async () => {
    const createEmailTemplateDto: CreateEmailTemplateDto = mockTemplate;
    await service.create(createEmailTemplateDto);
    const emailTemplate = new EmailTemplateEntity(createEmailTemplateDto);
    emailTemplate.slug = service.slugify(createEmailTemplateDto.title);
    expect(repository.create).toHaveBeenCalledTimes(1);
    expect(repository.create).not.toThrow();
  });

  describe('find email template by id', () => {
    it('role find success', async () => {
      repository.findById.mockResolvedValue(mockTemplate);
      const result = await service.findOne('1');
      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(repository.findById).not.toThrow();
      expect(result).toBe(mockTemplate);
    });
    it('find fail', async () => {
      repository.findById.mockRejectedValue(new NotFoundException());
      await expect(service.findOne('1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('update email template by id', () => {
    let updateEmailTemplateDto: UpdateEmailTemplateDto;
    beforeEach(() => {
      updateEmailTemplateDto = mockTemplate;
    });
    it('try to update using duplicate title', async () => {
      repository.findById.mockResolvedValue(mockTemplate);
      repository.findBy.mockResolvedValue(mockTemplate);
      await expect(
        service.update('1', updateEmailTemplateDto),
      ).rejects.toThrowError(UnprocessableEntityException);
      expect(repository.findBy).toHaveBeenCalledTimes(1);
    });

    it('update email template that exists in database', async () => {
      repository.findBy.mockResolvedValue(null);
      repository.update.mockResolvedValue({ ...mockTemplate, id: '1' });
      repository.findById.mockResolvedValue({ ...mockTemplate, id: '1' });
      const role = await service.update('1', updateEmailTemplateDto);
      expect(repository.findById).toHaveBeenCalledWith({
        id: '1',
      });

      expect(repository.update).toHaveBeenCalledTimes(1);
      expect(role).toEqual({ ...mockTemplate, id: '1' });
    });

    it('trying to update email template that does not exists in database', async () => {
      repository.update.mockRejectedValue(new NotFoundException());
      repository.findById.mockResolvedValue(null);
      await expect(
        service.update('1', updateEmailTemplateDto),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('remove email template by id', () => {
    it('trying to delete existing item', async () => {
      mockTemplate.isDefault = false;
      repository.findById.mockResolvedValue(mockTemplate);
      service.findOne = jest.fn().mockResolvedValue(mockTemplate);
      repository.delete = jest.fn().mockResolvedValue('');
      const result = await service.remove('1');
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith('1');
      expect(service.findOne).not.toThrow();
      expect(repository.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual(undefined);
    });

    it('trying to delete no existing item', async () => {
      service.findOne = jest.fn().mockImplementation(() => {
        throw NotFoundException;
      });
      await expect(service.remove('1')).rejects.toThrow();
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });

    it('delete default template test if throws error', async () => {
      service.findOne = jest.fn().mockResolvedValue({
        ...mockTemplate,
        isDefault: true,
      });
      await expect(service.remove('1')).rejects.toThrowError(
        ForbiddenException,
      );
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
