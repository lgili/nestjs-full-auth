import { Injectable, UnprocessableEntityException } from '@nestjs/common';

import { CommonServiceInterface } from 'src/common/interfaces/common-service.interface';
import { NotFoundException } from 'src/exception/not-found.exception';
import { PermissionsService } from 'src/modules/permission/permissions.service';
import { Pagination } from 'src/modules/paginate';
import { CreateRoleDto } from 'src/modules/role/dto/create-role.dto';
import { RoleFilterDto } from 'src/modules/role/dto/role-filter.dto';
import { UpdateRoleDto } from 'src/modules/role/dto/update-role.dto';

import {
  adminUserGroupsForSerializing,
  basicFieldGroupsForSerializing,
  RoleSerializer,
} from 'src/modules/role/serializer/role.serializer';
import { IRoleRepository } from './i-role.repository';
import { RoleEntity } from './entities/role.entity';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@Injectable()
export class RolesService /*implements CommonServiceInterface<RoleSerializer>*/ {
  constructor(
    private roleRepository: IRoleRepository,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Get Permission Id array
   * @param ids
   */
  async getPermissionByIds(ids) {
    if (ids && ids.length > 0) {
      return await this.permissionsService.whereInIds(ids);
    }
    return [];
  }

  /**
   * Find by name
   * @param name
   */
  async findByName(name: string) {
    return await this.roleRepository.findByName(name);
  }

  /**
   * create new role
   * @param createRoleDto
   */
  async create(createRoleDto: CreateRoleDto): Promise<RoleSerializer> {
    const { permissions } = createRoleDto;
    const permission = await this.getPermissionByIds(permissions);
    const role = new RoleEntity(createRoleDto);
    const roleSaved = await this.roleRepository.create(role, permission);
    return this.transform(roleSaved);
  }

  /**
   * find and return collection of roles
   * @param roleFilterDto
   */
  async findAll(roleFilterDto: RoleFilterDto): Promise<RoleSerializer[]> {
    // return this.repository.paginate(
    //   roleFilterDto,
    //   [],
    //   ['name', 'description'],
    //   {
    //     groups: [
    //       ...adminUserGroupsForSerializing,
    //       ...basicFieldGroupsForSerializing
    //     ]
    //   }
    // );
    const roles = await this.roleRepository.findAll();
    return this.transformMany(roles);
  }

  /**
   * find role by id
   * @param id
   */
  async findOne(id: string): Promise<RoleSerializer> {
    // return this.repository.get(id, ['permission'], {
    //   groups: [
    //     ...adminUserGroupsForSerializing,
    //     ...basicFieldGroupsForSerializing
    //   ]
    // });
    const role = await this.roleRepository.findById(id);
    return this.transform(role);
  }

  /**
   * update role by id
   * @param id
   * @param updateRoleDto
   */
  async update(
    id: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<RoleSerializer> {
    const role = await this.roleRepository.findById(id);
    if (!role) {
      throw new NotFoundException();
    }

    // if (checkUniqueTitle > 0) {
    //   throw new UnprocessableEntityException({
    //     property: 'name',
    //     constraints: {
    //       unique: 'already taken'
    //     }
    //   });
    // }
    const { permissions } = updateRoleDto;
    const permission = await this.getPermissionByIds(permissions);
    role.update(updateRoleDto);
    // FIXME: need to update permissions too
    const roles = await this.roleRepository.update(role);
    return this.transform(roles);
  }

  /**
   * remove role by id
   * @param id
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.roleRepository.delete(id);
  }

  /**
   * transform role entity
   * @param model
   * @param transformOption
   */
  transform(model: RoleEntity, transformOption = {}): RoleSerializer {
    return plainToInstance(
      RoleSerializer,
      instanceToPlain(model, transformOption),
      transformOption,
    );
  }

  /**
   * transform many roles collection
   * @param models
   * @param transformOption
   */
  transformMany(models: RoleEntity[], transformOption = {}): RoleSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
