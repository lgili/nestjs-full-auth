import { PrismaClient } from '@prisma/client';
import {
  ModulesPayloadInterface,
  PermissionConfiguration,
  PermissionPayload,
  RoutePayloadInterface,
  SubModulePayloadInterface,
} from 'src/config/permission-config';

export default class CreatePermissionSeed {
  permissions: RoutePayloadInterface[] = [];

  public async run(): Promise<any> {
    const prisma = new PrismaClient();
    const modules = PermissionConfiguration.modules;
    for (const moduleData of modules) {
      let resource = moduleData.resource;
      this.assignResourceAndConcatPermission(moduleData, resource);

      if (moduleData.hasSubmodules) {
        for (const submodule of moduleData.submodules) {
          resource = submodule.resource || resource;
          this.assignResourceAndConcatPermission(submodule, resource);
        }
      }
    }

    if (this.permissions && this.permissions.length > 0) {
      // console.log(this.permissions);

      this.permissions.forEach(async (permission) => {
        const toSave = this.topersistense(permission);
        await prisma.permission.create({
          data: toSave,
        });
      });
    }
  }

  assignResourceAndConcatPermission(
    modules: ModulesPayloadInterface | SubModulePayloadInterface,
    resource: string,
    isDefault?: false,
  ) {
    if (modules.permissions) {
      for (const permission of modules.permissions) {
        this.concatPermissions(permission, resource, isDefault);
      }
    }
  }

  concatPermissions(
    permission: PermissionPayload,
    resource: string,
    isDefault: boolean,
  ) {
    const description = permission.name;
    for (const data of permission.route) {
      data.resource = data.resource || resource;
      data.description = data.description || description;
      data.isDefault = isDefault;
    }
    this.permissions = this.permissions.concat(permission.route);
  }

  topersistense(permission: RoutePayloadInterface) {
    return {
      path: permission.path,
      method: permission.method,
      resource: permission.resource,
      description: permission.description,
      isDefault: permission.isDefault,
    };
  }
}
