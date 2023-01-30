import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryPrisma } from 'src/common/repository/query-buider-frontend/interfaces/Query';
import { MethodList } from 'src/config/permission-config';
import { NotFoundException } from 'src/exception/not-found.exception';
import { CreatePermissionDto } from 'src/modules/permission/dto/create-permission.dto';
import { UpdatePermissionDto } from 'src/modules/permission/dto/update-permission.dto';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';
import { PermissionRepository } from 'src/modules/permission/permission.repository';
import { PermissionsService } from 'src/modules/permission/permissions.service';

const permissionRepositoryMock = () => ({
  findAll: jest.fn(),
  paginate: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  findBy: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const mockPerimissionDto: CreatePermissionDto = {
  description: 'example test description',
  path: '/tests',
  method: MethodList.POST,
  resource: 'test',
};

const mockPermission = {
  isDefault: true,
  ...mockPerimissionDto,
};

const mockCreatePermission = {
  data: mockPermission,
  cls: PermissionEntity,
};

describe('PermissionsService', () => {
  let service: PermissionsService, repository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PermissionsService,
        {
          provide: PermissionRepository,
          useFactory: permissionRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<PermissionsService>(PermissionsService);
    repository = module.get<PermissionRepository>(PermissionRepository);
  });

  it('findAll', async () => {
    const permissionFilterDto: QueryPrisma = {
      // filter: [{'test description'}],
      limit: 10,
      page: 1,
    };
    repository.paginate.mockResolvedValue('result');
    const result = await service.findAll(permissionFilterDto);
    expect(repository.paginate).toHaveBeenCalledTimes(1);
    expect(result).toEqual('result');
  });

  it('create', async () => {
    const createPermissionDto: CreatePermissionDto = mockPerimissionDto;
    const result = await service.create(createPermissionDto);
    expect(repository.create).toHaveBeenCalledWith(mockCreatePermission);
    expect(repository.create).not.toThrow();
    expect(result).toBe(undefined);
  });

  it('sync permission', async () => {
    repository.create.mockResolvedValue(null);
    await service.syncPermission();
    expect(repository.create).toHaveBeenCalledTimes(20); // sync 20 permissions
  });

  describe('findOne', () => {
    it('find success', async () => {
      repository.findById.mockResolvedValue(mockPermission);
      const result = await service.findOne('1');
      expect(repository.findById).toHaveBeenCalledTimes(1);
      expect(repository.findById).not.toThrow();
      expect(result).toBe(mockPermission);
    });
    it('find fail', async () => {
      repository.findById.mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(service.findOne('1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    let updatePermissionDto: UpdatePermissionDto;
    beforeEach(() => {
      updatePermissionDto = mockPermission;
    });
    it('try to update using duplicate description', async () => {
      // repository.findOne.mockResolvedValue(mockPermission);
      repository.findBy.mockResolvedValue(1);
      await expect(
        service.update('1', updatePermissionDto),
      ).rejects.toThrowError(UnprocessableEntityException);
      expect(repository.findBy).toHaveBeenCalledTimes(1);
    });

    it('update item that exists in database', async () => {
      repository.findById.mockResolvedValue(0);
      repository.update.mockResolvedValue(mockPermission);
      repository.findById.mockResolvedValue(mockPermission);
      const role = await service.update('1', updatePermissionDto);
      expect(repository.findById).toHaveBeenCalledWith({
        cls: PermissionEntity,
        id: '1',
      });
      expect(repository.findBy).toHaveBeenCalledWith({
        fieldName: 'description',
        value: updatePermissionDto.description,
      });
      expect(repository.update).toHaveBeenCalledWith({
        id: '1',
        data: updatePermissionDto,
        cls: PermissionEntity,
      });
      expect(role).toEqual(mockPermission);
    });

    it('trying to update item that does not exists in database', async () => {
      repository.update.mockRejectedValue(new NotFoundException());
      const updatePermissionDto: UpdatePermissionDto = mockPerimissionDto;
      repository.findById.mockResolvedValue(null);
      await expect(
        service.update('1', updatePermissionDto),
      ).rejects.toThrowError(NotFoundException);
    });
  });

  describe('remove', () => {
    it('trying to delete existing item', async () => {
      service.findOne = jest.fn().mockResolvedValue(mockPermission);
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
  });
});
