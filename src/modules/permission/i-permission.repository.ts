import { PermissionEntity } from './entities/permission.entity';

export abstract class IPermissionRepository {
  abstract findById: (id: string) => Promise<PermissionEntity>;
  abstract findByName: (name: string) => Promise<PermissionEntity>;
  abstract findAll: () => Promise<PermissionEntity[]>;
  abstract findSeveralById: (ids: string[]) => Promise<PermissionEntity[]>;
  abstract create: (user: PermissionEntity) => Promise<PermissionEntity>;
  abstract update: (user: PermissionEntity) => Promise<PermissionEntity>;
  abstract delete: (id: string) => Promise<void>;
}
