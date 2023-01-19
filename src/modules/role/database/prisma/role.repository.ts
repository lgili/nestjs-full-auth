import { Injectable, Logger } from '@nestjs/common';
import { Role as PersistenceRole } from '@prisma/client';
import { classToPlain, instanceToPlain, plainToClass, plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/infra/database/prisma/prisma.service';
import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';
import { RoleEntity } from '../../entities/role.entity';

import { IRoleRepository } from '../../i-role.repository';





@Injectable()
export class RolePrismaRepository implements IRoleRepository {
  private readonly logger = new Logger(RolePrismaRepository.name);
  constructor(private readonly prismaService: PrismaService) {}

  async findById(id: string): Promise<RoleEntity> {
    const role = await this.prismaService.role.findUnique({
      where: {
        id,
      },
      include:{
        permissions: true
      }
    });

    if (!role) {
      return null;
    }

    return this.toDomain(role);
  }

  async findByName(name: string): Promise<RoleEntity> {
    const role = await this.prismaService.role.findUnique({
      where: {
        name          
      },   
      include:{
        permissions: true
      }   
    });

    if (!role) {
      return null;
    }

    return this.toDomain(role);
  }

  async findAll(): Promise<RoleEntity[]> {
    const roles = await this.prismaService.role.findMany();

    if (!roles) {
      return [];
    }

    return this.transformMany(roles);
  }

  async create(role: RoleEntity, permissions: PermissionEntity[]): Promise<RoleEntity> {
    try {
      const data = this.toPersistence(role);
      type justId = {
        id: string
      }
      const permissionsID: justId[] = [] 
      permissions.forEach((permission) =>{
        permissionsID.push({
          id: permission.id
        })
      })
      const roleSaved = await this.prismaService.role.create(
        {
           data: {
            name: role.name,
            description: role.description,
            permissions: {
              connect: [...permissionsID]
            }
           }
        });
      return this.toDomain(roleSaved);
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  async update(role: RoleEntity): Promise<RoleEntity> {
    const data = this.toPersistence(role);
    delete data.id;
    const roleUpdated = await this.prismaService.role.update({
      where: {
        id: role.id,
      },
      data,
    });

    return this.toDomain(roleUpdated);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.role.delete({ where: { id } });
  }

  /**
   * toDomain user
   * @param model
   * @param transformOption
   */
  toDomain(model: PersistenceRole, transformOption = {}): RoleEntity {
    return plainToInstance(
      RoleEntity,
      instanceToPlain(model, transformOption),
      transformOption
    );
  }

  
  /**
   * toDomain users collection
   * @param models
   * @param transformOption
   */
  transformMany(models: PersistenceRole[], transformOption = {}): RoleEntity[] {
    return models.map((model) => this.toDomain(model, transformOption));
  }


  toPersistence(role: RoleEntity) {
    
        
    return {
      id: role.id,
      name: role.name,
      description: role.description,            
    };
  }
}
