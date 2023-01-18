import { Injectable, UnprocessableEntityException } from '@nestjs/common';


import { CommonServiceInterface } from 'src/common/interfaces/common-service.interface';
import {
    PermissionConfiguration,
    RoutePayloadInterface
} from 'src/config/permission-config';
import { CreatePermissionDto } from 'src/modules/permission/dto/create-permission.dto';
import { PermissionFilterDto } from 'src/modules/permission/dto/permission-filter.dto';
import { UpdatePermissionDto } from 'src/modules/permission/dto/update-permission.dto';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';
import { LoadPermissionMisc } from 'src/modules/permission/misc/load-permission.misc';
import { PermissionSerializer } from 'src/modules/permission/serializer/permission.serializer';
import { Pagination } from 'src/modules/paginate';
import { basicFieldGroupsForSerializing } from 'src/modules/role/serializer/role.serializer';
import { IPermissionRepository } from './i-permission.repository';
import { instanceToPlain, plainToInstance } from 'class-transformer';

@Injectable()
export class PermissionsService
  extends LoadPermissionMisc
  /*implements CommonServiceInterface<Permission>*/
{
  constructor(    
    private permissionRepository: IPermissionRepository
  ) {
     super();
  }

  /**
   * Create new Permission
   * @param createPermissionDto
   */
  async create(createPermissionDto: CreatePermissionDto): Promise<PermissionSerializer> {
    const perEntity = new PermissionEntity(createPermissionDto)
    perEntity.isDefault =  true;
    const permission = await this.permissionRepository.create(perEntity)
    return this.transform(permission);    
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
        resource
      );

      if (moduleData.hasSubmodules) {
        for (const submodule of moduleData.submodules) {
          resource = submodule.resource || resource;
          permissionsList = this.assignResourceAndConcatPermission(
            submodule,
            permissionsList,
            resource
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
        
        const entity = await this.permissionRepository.create(perEntity)
        permissionsSaved.push(entity);
      } catch (error) {
        console.log("error to sync permission")
      }
    })
    // return this.transformMany(permissionsSaved);
  }

  /**
   * Get all paginated Permission
   * @param permissionFilterDto
   */
  async findAll(
    permissionFilterDto: PermissionFilterDto
  ): Promise<PermissionSerializer[]> {
    // return this.repository.paginate(
    //   permissionFilterDto,
    //   [],
    //   ['resource', 'description', 'path', 'method'],
    //   {
    //     groups: [...basicFieldGroupsForSerializing]
    //   }
    // );
    const result = await this.permissionRepository.findAll()
    return this.transformMany(result)
  }

  /**
   * Get Permission by id
   * @param id
   */
  async findOne(id: string): Promise<PermissionSerializer> {
    // return this.repository.get(id, [], {
    //   groups: [...basicFieldGroupsForSerializing]
    // });
    const permission = await this.permissionRepository.findById(id);
    return this.transform(permission)
  }

  /**
   * Update permission by id
   * @param id
   * @param updatePermissionDto
   */
  async update(
    id: string,
    updatePermissionDto: UpdatePermissionDto
  ): Promise<PermissionSerializer> {
    const permission = await this.permissionRepository.findById(id);
        
    // if (countSameDescription > 0) {
    //   throw new UnprocessableEntityException({
    //     property: 'name',
    //     constraints: {
    //       unique: 'already taken'
    //     }
    //   });
    // }
    console.log(permission)    
    permission.update(updatePermissionDto)
    console.log(permission)
    const updatedPermission  = await this.permissionRepository.update(permission);
    return this.transform(updatedPermission)
  }

  /**
   * Remove permission by id
   * @param id
   */
  async remove(id: string): Promise<void> {    
    await this.permissionRepository.delete(id)
  }

  /**
   * Get Permission array by provided array of id
   * @param ids
   */
  async whereInIds(ids: string[]): Promise<PermissionEntity[]> {
    return this.permissionRepository.findSeveralById(ids)    
  }


  /**
   * transform permission entity
   * @param model
   * @param transformOption
   */
  transform(model: PermissionEntity, transformOption = {}): PermissionSerializer {
    return plainToInstance(
      PermissionSerializer,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  
  
  /**
   * transform many permission collection
   * @param models
   * @param transformOption
   */
  transformMany(models: PermissionEntity[], transformOption = {}): PermissionSerializer[] {
    return models.map((model) => this.transform(model, transformOption));
  }
}
