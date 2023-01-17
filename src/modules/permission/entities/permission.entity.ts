
import { RoleEntity } from 'src/modules/role/entities/role.entity';


export class PermissionEntity  {
  id: string;
  
  resource: string;
  
  description: string;
  
  path: string;
  
  method: string;
  
  isDefault: boolean;
  
  role: RoleEntity[];

  constructor(data?: Partial<PermissionEntity>) {    
    if (data) {
      Object.assign(this, data);
    }
  }

  update(data?: Partial<PermissionEntity>) {
    // for (const key in data) {
    //   console.log(key, data[key]);
    //   RoleEntity[key] = data[key]!;
    // }
    if (data) {
      Object.assign(this, data);
    }
  }
}
