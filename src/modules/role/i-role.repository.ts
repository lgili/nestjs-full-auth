import { PermissionEntity } from "../permission/entities/permission.entity";
import { RoleEntity } from "./entities/role.entity";

export abstract class IRoleRepository {
  abstract findById: (id: string) => Promise<RoleEntity>;
  abstract findByName: (name: string) => Promise<RoleEntity>;
  abstract findAll: () => Promise<RoleEntity[]>;
  abstract create: (user: RoleEntity, permission: PermissionEntity[]) => Promise<RoleEntity>;
  abstract update: (user: RoleEntity) => Promise<RoleEntity>;
  abstract delete: (id: string) => Promise<void>;
}
