import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { CommonServiceInterface } from 'src/common/interfaces/common-service.interface';
import {
  PermissionConfiguration,
  RoutePayloadInterface,
} from 'src/config/permission-config';
import { Pagination } from 'src/modules/paginate';
import { CreatePermissionDto } from 'src/modules/permission/dto/create-permission.dto';
import { PermissionFilterDto } from 'src/modules/permission/dto/permission-filter.dto';
import { UpdatePermissionDto } from 'src/modules/permission/dto/update-permission.dto';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';
import { LoadPermissionMisc } from 'src/modules/permission/misc/load-permission.misc';
import { PermissionSerializer } from 'src/modules/permission/serializer/permission.serializer';
import { basicFieldGroupsForSerializing } from 'src/modules/role/serializer/role.serializer';

import { PermissionRepository } from './permission.repository';

@Injectable()
/*implements CommonServiceInterface<Permission>*/
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
  ): Promise<PermissionSerializer> {
    const perEntity = new PermissionEntity(createPermissionDto);
    perEntity.isDefault = true;
    const permission = await this.permissionRepository.create(perEntity);

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
    const permissionsSaved: PermissionSerializer[] = [];
    permissionsList.forEach(async (permissions) => {
      const perEntity = plainToInstance(
        PermissionEntity,
        instanceToPlain(permissions),
      );
      try {
        const entity = await this.permissionRepository.create(perEntity);
        permissionsSaved.push(entity);
      } catch (error) {
        console.log('error to sync permission');
      }
    });
    // return this.transformMany(permissionsSaved);
  }

  /**
   * Get all paginated Permission
   * @param permissionFilterDto
   */
  async findAll(
    permissionFilterDto: PermissionFilterDto,
  ): Promise<PermissionSerializer[]> {
    // return this.repository.paginate(
    //   permissionFilterDto,
    //   [],
    //   ['resource', 'description', 'path', 'method'],
    //   {
    //     groups: [...basicFieldGroupsForSerializing]
    //   }
    // );
    const result = await this.permissionRepository.findAll();

    return result;
  }

  /**
   * Get Permission by id
   * @param id
   */
  async findOne(id: string): Promise<PermissionSerializer> {
    // return this.repository.get(id, [], {
    //   groups: [...basicFieldGroupsForSerializing]
    // });
    const permission = await this.permissionRepository.findOne(id);

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
  ): Promise<PermissionSerializer> {
    const permission = await this.permissionRepository.findOne(id);

    // if (countSameDescription > 0) {
    //   throw new UnprocessableEntityException({
    //     property: 'name',
    //     constraints: {
    //       unique: 'already taken'
    //     }
    //   });
    // }
    // console.log(permission);
    permission.update(updatePermissionDto);
    // console.log(permission);

    const updatedPermission = await this.permissionRepository.update(
      permission.id,
      permission,
    );

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
    const permission:PermissionEntity[] = []
    ids.forEach(async (id) => {
      const result = await this.permissionRepository.findOne(id)
      if(result){
        const toSave = plainToInstance(
          PermissionEntity,
          instanceToPlain(result)         
        );
        permission.push(toSave)
      }
    })
    return permission;
  }

  

  
}
