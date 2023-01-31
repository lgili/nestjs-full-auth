// import { UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QueryPrisma } from 'src/common/repository/query-buider-frontend/interfaces/Query';
import { MethodList } from 'src/config/permission-config';
// import { NotFoundException } from 'src/exception/not-found.exception';
// import { CreatePermissionDto } from 'src/permission/dto/create-permission.dto';
import { PermissionEntity } from 'src/permission/entities/permission.entity';
import { PermissionsService } from 'src/permission/permissions.service';
import { CreateRoleDto } from 'src/role/dto/create-role.dto';
// import { UpdateRoleDto } from 'src/role/dto/update-role.dto';
import { RoleRepository } from 'src/role/role.repository';
import { RolesService } from 'src/role/roles.service';

const roleRepositoryMock = () => ({
  findAll: jest.fn(),
  paginate: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

const permissionServiceMock = () => ({
  findAll: jest.fn(),
  whereInIds: jest.fn(),
});

const mockPerimissionDto: PermissionEntity = {
  id: '1',
  description: 'example test description',
  path: '/tests',
  method: MethodList.POST,
  resource: 'test',
  updatedAt: new Date(),
  createdAt: new Date(),
  isDefault: true,
  roles: [],
};

const mockPermission = {
  isDefault: true,
  ...mockPerimissionDto,
};

const mockRole: CreateRoleDto = {
  description: 'test description',
  permissions: [mockPermission],
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
      // keywords: 'example',
      limit: 10,
      page: 1,
    };
    roleRepository.paginate.mockResolvedValue('result');
    const result = await service.findAll(roleFilterDto);
    expect(roleRepository.paginate).toHaveBeenCalledTimes(1);
    expect(result).toEqual('result');
  });

  // it('create', async () => {
  //   const createRoleDto: CreateRoleDto = mockRole;
  //   permissionService.whereInIds.mockResolvedValue([mockPermission]);
  //   service.getPermissionByIds = jest.fn().mockResolvedValue([mockPermission]);
  //   const result = await service.create(createRoleDto);
  //   expect(service.getPermissionByIds).toHaveBeenCalledWith([1]);
  //   expect(roleRepository.create).toHaveBeenCalledWith({
  //     data: createRoleDto,
  //   });
  //   expect(roleRepository.createEntity).not.toThrow();
  //   expect(result).toBe(undefined);
  // });

  // describe('findOne', () => {
  //   it('role find success', async () => {
  //     roleRepository.get.mockResolvedValue(mockRole);
  //     const result = await service.findOne(1);
  //     expect(roleRepository.get).toHaveBeenCalledTimes(1);
  //     expect(roleRepository.get).not.toThrow();
  //     expect(result).toBe(mockRole);
  //   });
  //   it('find fail', async () => {
  //     roleRepository.get.mockImplementation(() => {
  //       throw new NotFoundException();
  //     });
  //     await expect(service.findOne(1)).rejects.toThrowError(NotFoundException);
  //   });
  // });

  // describe('update', () => {
  //   it('try to update using duplicate role name', async () => {
  //     roleRepository.findOne.mockResolvedValue(mockRole);
  //     roleRepository.countEntityByCondition.mockResolvedValue(1);
  //     const updateRoleDto: UpdateRoleDto = mockRole;
  //     await expect(service.update(1, updateRoleDto)).rejects.toThrowError(
  //       UnprocessableEntityException,
  //     );
  //     expect(roleRepository.countEntityByCondition).toHaveBeenCalledTimes(1);
  //   });
  //   it('update item that exists in database', async () => {
  //     roleRepository.updateEntity.mockResolvedValue(mockRole);
  //     roleRepository.findOne.mockResolvedValue(mockRole);
  //     roleRepository.countEntityByCondition.mockResolvedValue(0);
  //     roleRepository.get.mockResolvedValue(mockRole);
  //     service.getPermissionByIds = jest
  //       .fn()
  //       .mockResolvedValue([mockPermission]);
  //     const updateRoleDto: UpdateRoleDto = mockRole;
  //     await service.update(1, updateRoleDto);
  //     expect(roleRepository.countEntityByCondition).toHaveBeenCalled();
  //     expect(service.getPermissionByIds).toHaveBeenCalledWith([1]);
  //     expect(roleRepository.updateItem).toHaveBeenCalledWith(
  //       mockRole,
  //       updateRoleDto,
  //       [mockPermission],
  //     );
  //   });

  //   it('trying to update item that does not exists in database', async () => {
  //     service.getPermissionByIds = jest
  //       .fn()
  //       .mockResolvedValue([mockPermission]);
  //     roleRepository.countEntityByCondition.mockResolvedValue(0);
  //     roleRepository.findOne.mockResolvedValue(null);
  //     const updateRoleDto: UpdateRoleDto = mockRole;
  //     await expect(service.update(1, updateRoleDto)).rejects.toThrowError(
  //       NotFoundException,
  //     );
  //   });
  // });

  // describe('remove', () => {
  //   beforeEach(() => {
  //     service.findOne = jest.fn().mockResolvedValue(mockRole);
  //     roleRepository.delete = jest.fn().mockResolvedValue('');
  //   });
  //   it('trying to delete existing role', async () => {
  //     await service.remove(2);
  //     expect(service.findOne).toHaveBeenCalledTimes(1);
  //     expect(service.findOne).toHaveBeenCalledWith(2);
  //     // expect(service.findOne).not.toThrow();
  //     expect(roleRepository.delete).toHaveBeenCalledTimes(1);
  //   });

  //   it('trying to delete no existing role', async () => {
  //     service.findOne = jest.fn().mockImplementation(() => {
  //       throw NotFoundException;
  //     });
  //     await expect(service.remove(1)).rejects.toThrow();
  //     expect(service.findOne).toHaveBeenCalledTimes(1);
  //   });
  // });
});
