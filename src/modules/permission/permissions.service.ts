import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import QueryBuilder from 'src/common/repository/filter-prisma';
import {
  PermissionConfiguration,
  RoutePayloadInterface,
} from 'src/config/permission-config';
import { CreatePermissionDto } from 'src/modules/permission/dto/create-permission.dto';
import { PermissionFilterDto } from 'src/modules/permission/dto/permission-filter.dto';
import { UpdatePermissionDto } from 'src/modules/permission/dto/update-permission.dto';
import {
  GROUP_DEFAULT,
  PermissionEntity,
} from 'src/modules/permission/entities/permission.entity';
import { LoadPermissionMisc } from 'src/modules/permission/misc/load-permission.misc';

import { Pagination } from '../paginate';
import { PermissionRepository } from './permission.repository';

@Injectable()
export class PermissionsService extends LoadPermissionMisc {
  constructor(private permissionRepository: PermissionRepository) {
    super();
  }

  /**
   * Create new Permission
   * @param createPermissionDto
   */
  async create(
    createPermissionDto: CreatePermissionDto,
  ): Promise<PermissionEntity> {
    const perEntity = new PermissionEntity(createPermissionDto);
    perEntity.isDefault = true;

    const permission = await this.permissionRepository.create({
      data: perEntity,
      cls: PermissionEntity,
    });

    return permission;
  }

  /**
   * Sync Permission with config
   */
  async syncPermission() {
    const modules = PermissionConfiguration.modules;
    let permissionsList: RoutePayloadInterface[] = [];

    for (const moduleData of modules) {
      let resource = moduleData.resource;
      permissionsList = this.assignResourceAndConcatPermission(
        moduleData,
        permissionsList,
        resource,
      );

      if (moduleData.hasSubmodules) {
        for (const submodule of moduleData.submodules) {
          resource = submodule.resource || resource;
          permissionsList = this.assignResourceAndConcatPermission(
            submodule,
            permissionsList,
            resource,
          );
        }
      }
    }
    const permissionsSaved: PermissionEntity[] = [];
    permissionsList.forEach(async (permissions) => {
      const perEntity = plainToInstance(
        PermissionEntity,
        instanceToPlain(permissions),
      );
      try {
        const entity = await this.permissionRepository.create({
          data: perEntity,
          cls: PermissionEntity,
        });
        permissionsSaved.push(entity);
      } catch (error) {
        console.log('error to sync permission');
      }
    });
  }

  /**
   * Get all paginated Permission
   * @param permissionFilterDto
   */
  async findAll(
    permissionFilterDto: PermissionFilterDto,
  ): Promise<Pagination<PermissionEntity>> {
    // return this.repository.paginate(
    //   permissionFilterDto,
    //   [],
    //   ['resource', 'description', 'path', 'method'],
    //   {
    //     groups: [...basicFieldGroupsForSerializing]
    //   }
    // );
    const qr = new QueryBuilder({
      page: permissionFilterDto.page,
      perPage: permissionFilterDto.perPage,
      sort: 'resource, description, path, method',
    });
    const filterOptions = qr.filter().paginate().sort().build();

    return await this.permissionRepository.paginate({
      searchFilter: filterOptions,
      cls: PermissionEntity,
      transformOptions: {
        groups: [GROUP_DEFAULT],
      },
    });
  }

  /**
   * Get Permission by id
   * @param id
   */
  async findOne(id: string): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findOne({
      id,
      cls: PermissionEntity,
      transformOptions: {
        groups: [GROUP_DEFAULT],
      },
    });

    return permission;
  }

  /**
   * Update permission by id
   * @param id
   * @param updatePermissionDto
   */
  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto,
  ): Promise<PermissionEntity> {
    const permission = await this.permissionRepository.findOne({
      id,
      cls: PermissionEntity,
    });

    const sameName = this.permissionRepository.findBy({
      fieldName: 'description',
      value: updatePermissionDto.description,
    });

    if (sameName) {
      throw new UnprocessableEntityException({
        property: 'description',
        constraints: {
          unique: 'already taken',
        },
      });
    }

    const updatedPermission = await this.permissionRepository.update({
      id: permission.id,
      data: updatePermissionDto,
      cls: PermissionEntity,
    });

    return updatedPermission;
  }

  /**
   * Remove permission by id
   * @param id
   */
  async remove(id: string): Promise<void> {
    await this.permissionRepository.delete(id);
  }

  /**
   * Get Permission array by provided array of id
   * @param ids
   */
  async whereInIds(ids: string[]): Promise<PermissionEntity[]> {
    const permission: PermissionEntity[] = [];
    ids.forEach(async (id) => {
      const result = await this.permissionRepository.findOne({
        id,
      });

      if (result) {
        permission.push(result);
      }
    });

    return permission;
  }
}
