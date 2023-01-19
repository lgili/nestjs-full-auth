import { IPermissionRepository } from '../../i-permission.repository';
import { PermissionPrismaRepository } from './permission.repository';

export default [
  // Repository
  {
    provide: IPermissionRepository,
    useClass: PermissionPrismaRepository,
  },
  // You can add or switch to 'in-memory repository' if needed for a certain data store.
];
