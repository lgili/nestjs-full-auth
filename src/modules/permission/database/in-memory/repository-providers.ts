import { IPermissionRepository } from '../../i-permission.repository';
import { PermissionInMemoryRepository } from './permission.repository';

export default [
  // Repository
  {
    provide: IPermissionRepository,
    useClass: PermissionInMemoryRepository,
  },
];
