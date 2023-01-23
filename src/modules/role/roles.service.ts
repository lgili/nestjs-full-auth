import { Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { NotFoundException } from 'src/exception/not-found.exception';
// import { Pagination } from 'src/modules/paginate';
import { PermissionsService } from 'src/modules/permission/permissions.service';
import { CreateRoleDto } from 'src/modules/role/dto/create-role.dto';
import { RoleFilterDto } from 'src/modules/role/dto/role-filter.dto';
import { UpdateRoleDto } from 'src/modules/role/dto/update-role.dto';
import { RoleSerializer } from 'src/modules/role/serializer/role.serializer';

import { RoleEntity } from './entities/role.entity';
import { RoleRepository } from './role.repository';

@Injectable()
export class RolesService /*implements CommonServiceInterface<RoleSerializer>*/ {
  constructor(
    private roleRepository: RoleRepository,
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
    return await this.roleRepository.findBy('name', name);
  }

  /**
   * create new role
   * @param createRoleDto
   */
  async create(createRoleDto: CreateRoleDto): Promise<RoleSerializer> {
    const { permissions } = createRoleDto;
    const permission = await this.getPermissionByIds(permissions);
    const role = new RoleEntity(createRoleDto);
    role.permissions = permission;
    const roleSaved = await this.roleRepository.create(role);

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
    const role = await this.roleRepository.findOne(id);

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
    const role = await this.roleRepository.findOne(id);

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
    const roleUpdated = await this.roleRepository.update(role.id, role);

    return this.transform(roleUpdated);
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
   * transform entity
   * @param model
   * @param transformOptions
   */
  transform(model: RoleEntity, transformOptions = {}): RoleSerializer {
    return plainToInstance(RoleSerializer, model, transformOptions);
  }

  /**
   * transform array of entity
   * @param models
   * @param transformOptions
   */
  transformMany(models: RoleEntity[], transformOptions = {}): RoleSerializer[] {
    return models.map((model) => this.transform(model, transformOptions));
  }
}
