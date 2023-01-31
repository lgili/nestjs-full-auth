import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { QueryPrisma } from 'src/common/repository/query-buider-frontend/interfaces/Query';
import { NotFoundException } from 'src/exception/not-found.exception';
// import { Pagination } from 'src/paginate';
import { PermissionsService } from 'src/permission/permissions.service';
import { CreateRoleDto } from 'src/role/dto/create-role.dto';
import { UpdateRoleDto } from 'src/role/dto/update-role.dto';

import { Pagination } from '../paginate';
import { GROUP_USER, RoleEntity } from './entities/role.entity';
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
    return await this.roleRepository.findBy({
      fieldName: 'name',
      value: name,
    });
  }

  /**
   * create new role
   * @param createRoleDto
   */
  async create(createRoleDto: CreateRoleDto): Promise<RoleEntity> {
    const { permissions } = createRoleDto;
    const permission = await this.getPermissionByIds(permissions);
    const role = new RoleEntity(createRoleDto);
    role.permissions = permission;

    const roleSaved = await this.roleRepository.create({
      data: role,
    });

    return roleSaved;
  }

  /**
   * find and return collection of roles
   * @param roleFilterDto
   */
  async findAll(roleFilterDto: QueryPrisma): Promise<Pagination<RoleEntity>> {
    // const qr = new QueryBuilder({
    //   page: roleFilterDto.page,
    //   perPage: roleFilterDto.perPage,
    //   sort: 'name, description',
    // });
    // const filterOptions = qr.filter().paginate().sort().build();
    // const filterOptions = await Querybuilder.query(roleFilterDto);

    const roles = await this.roleRepository.paginate({
      searchFilter: roleFilterDto,
      cls: RoleEntity,
      transformOptions: {
        groups: [GROUP_USER],
      },
    });

    return roles;
  }

  /**
   * find role by id
   * @param id
   */
  async findOne(id: string): Promise<RoleEntity> {
    const role = await this.roleRepository.findById({
      id,
      include: {
        permissions: true,
      },
      cls: RoleEntity,
      transformOptions: {
        groups: [GROUP_USER],
      },
    });

    return role;
  }

  /**
   * update role by id
   * @param id
   * @param updateRoleDto
   */
  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleEntity> {
    const role = await this.roleRepository.findById({
      id,
    });

    if (!role) {
      throw new NotFoundException();
    }

    const sameName = await this.roleRepository.findBy({
      fieldName: 'title',
      value: updateRoleDto.name,
    });

    if (sameName) {
      throw new UnprocessableEntityException({
        property: 'name',
        constraints: {
          unique: 'already taken',
        },
      });
    }
    const { permissions } = updateRoleDto;
    const permission = await this.getPermissionByIds(permissions);
    const updateRole = new RoleEntity(updateRoleDto);
    updateRole.permissions = permission;

    // FIXME: need to update permissions too
    const roleUpdated = await this.roleRepository.update({
      id: role.id,
      data: updateRole,
    });

    return roleUpdated;
  }

  /**
   * remove role by id
   * @param id
   */
  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.roleRepository.delete(id);
  }
}
