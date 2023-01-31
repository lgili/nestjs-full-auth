// import { UnprocessableEntityException } from '@nestjs/common';
import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryPrisma } from 'src/common/repository/query-buider-frontend/interfaces/Query';
import { MethodList } from 'src/config/permission-config';
import { NotFoundException } from 'src/exception/not-found.exception';
import { PermissionsService } from 'src/permission/permissions.service';
import { CreateRoleDto } from 'src/role/dto/create-role.dto';
import { RoleRepository } from 'src/role/roles.repository';
import { RolesService } from 'src/role/roles.service';

import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleEntity } from './entities/role.entity';

const roleRepositoryMock = () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findBy: jest.fn(),
  paginate: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const permissionServiceMock = () => ({
  findAll: jest.fn(),
  whereInIds: jest.fn(),
});

const mockPerimissionDto1 = {
  id: '1',
  description: 'example test description',
  path: '/tests',
  method: MethodList.POST,
};

const mockPerimissionEntity1 = {
  ...mockPerimissionDto1,
  resource: 'test',
  updatedAt: new Date(),
  createdAt: new Date(),
  isDefault: true,
  roles: [],
};

const mockPerimissionDto2 = {
  id: '2',
  description: 'example test description',
  path: '/tests',
  method: MethodList.POST,
};

const mockPerimissionEntity2 = {
  ...mockPerimissionDto2,
  resource: 'test',
  updatedAt: new Date(),
  createdAt: new Date(),
  isDefault: true,
  roles: [],
};

const mockPermission1 = {
  isDefault: true,
  ...mockPerimissionEntity1,
};

const mockPermission2 = {
  isDefault: true,
  ...mockPerimissionEntity2,
};

const mockRole: CreateRoleDto = {
  description: 'test description',
  permissions: [mockPermission1, mockPermission2],
  name: 'test',
};

describe('RolesService', () => {
  let service: RolesService, roleRepository, permissionService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesService,
        {
          provide: RoleRepository,
          useFactory: roleRepositoryMock,
        },
        {
          provide: PermissionsService,
          useFactory: permissionServiceMock,
        },
      ],
    }).compile();

    service = module.get<RolesService>(RolesService);
    permissionService = module.get<PermissionsService>(PermissionsService);
    roleRepository = module.get<RoleRepository>(RoleRepository);
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('getPermissionByIds', () => {
    it('should return an empty array if ids is empty', async () => {
      const ids = [];
      const result = await service.getPermissionByIds(ids);
      expect(result).toEqual([]);
    });
    it('should return an array of permissions if ids is not empty', async () => {
      permissionService.whereInIds.mockResolvedValue([
        { id: '1' },
        { id: '2' },
        { id: '3' },
      ]);
      const ids = ['1', '2', '3'];
      const result = await service.getPermissionByIds(ids);
      expect(result).toEqual([{ id: '1' }, { id: '2' }, { id: '3' }]);
    });
  });

  it('findAll', async () => {
    const roleFilterDto: QueryPrisma = {
      limit: 10,
      page: 1,
    };
    roleRepository.paginate.mockResolvedValue('result');
    const result = await service.findAll(roleFilterDto);
    expect(roleRepository.paginate).toHaveBeenCalledTimes(1);
    expect(result).toEqual('result');
  });

  it('create', async () => {
    const createRoleDto: CreateRoleDto = mockRole;
    permissionService.whereInIds.mockResolvedValue([
      mockPermission1,
      mockPermission2,
    ]);
    service.getPermissionByIds = jest
      .fn()
      .mockResolvedValue([mockPermission1, mockPermission2]);
    const result = await service.create(createRoleDto);
    expect(service.getPermissionByIds).toHaveBeenCalledWith(['1', '2']);

    const role = new RoleEntity(createRoleDto);
    role.permissions = [mockPermission1, mockPermission2];
    expect(roleRepository.create).toHaveBeenCalledWith({
      data: role,
    });
    expect(roleRepository.create).not.toThrow();
    expect(result).toBe(undefined);
  });

  describe('findOne', () => {
    it('role find success', async () => {
      roleRepository.findById.mockResolvedValue(mockRole);
      const result = await service.findOne('1');
      expect(roleRepository.findById).toHaveBeenCalledTimes(1);
      expect(roleRepository.findById).not.toThrow();
      expect(result).toBe(mockRole);
    });
    it('find fail', async () => {
      roleRepository.findById.mockImplementation(() => {
        throw new NotFoundException();
      });
      await expect(service.findOne('1')).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('try to update using duplicate role name', async () => {
      roleRepository.findById.mockResolvedValue(mockRole);
      roleRepository.findBy.mockResolvedValue(mockRole);
      const updateRoleDto: UpdateRoleDto = mockRole;
      await expect(service.update('1', updateRoleDto)).rejects.toThrowError(
        UnprocessableEntityException,
      );
      expect(roleRepository.findBy).toHaveBeenCalledTimes(1);
    });

    it('update item that exists in database', async () => {
      roleRepository.update.mockResolvedValue({ ...mockRole, id: '1' });
      roleRepository.findById.mockResolvedValue({ ...mockRole, id: '1' });
      roleRepository.findBy.mockResolvedValue(null);

      service.getPermissionByIds = jest
        .fn()
        .mockResolvedValue([mockPermission1, mockPermission2]);
      const updateRoleDto: UpdateRoleDto = mockRole;
      await service.update('1', updateRoleDto);
      expect(roleRepository.findBy).toHaveBeenCalled();
      expect(service.getPermissionByIds).toHaveBeenCalledWith(['1', '2']);

      const updateRole = new RoleEntity(updateRoleDto);
      updateRole.permissions = [mockPermission1, mockPermission2];
      expect(roleRepository.update).toHaveBeenCalledWith({
        id: '1',
        data: updateRole,
      });
    });

    it('trying to update item that does not exists in database', async () => {
      service.getPermissionByIds = jest
        .fn()
        .mockResolvedValue([mockPermission1, mockPermission2]);
      roleRepository.findBy.mockResolvedValue(null);
      roleRepository.findById.mockResolvedValue(null);
      const updateRoleDto: UpdateRoleDto = mockRole;
      await expect(service.update('1', updateRoleDto)).rejects.toThrowError(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      service.findOne = jest.fn().mockResolvedValue(mockRole);
      roleRepository.delete = jest.fn().mockResolvedValue('');
    });
    it('trying to delete existing role', async () => {
      await service.remove('2');
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(service.findOne).toHaveBeenCalledWith('2');
      expect(service.findOne).not.toThrow();
      expect(roleRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('trying to delete no existing role', async () => {
      service.findOne = jest.fn().mockImplementation(() => {
        throw NotFoundException;
      });
      await expect(service.remove('1')).rejects.toThrow();
      expect(service.findOne).toHaveBeenCalledTimes(1);
    });
  });
});
