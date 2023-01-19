import { PermissionEntity } from 'src/modules/permission/entities/permission.entity';

export class RoleEntity {
  id: string;
  name: string;
  description: string;
  permissions: PermissionEntity[];

  constructor(data?: Partial<RoleEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  update(data?: Partial<RoleEntity>) {
    // for (const key in data) {
    //   console.log(key, data[key]);
    //   RoleEntity[key] = data[key]!;
    // }
    if (data) {
      Object.assign(this, data);
    }
  }
}
