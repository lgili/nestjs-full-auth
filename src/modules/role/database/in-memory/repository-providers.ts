import { IRoleRepository } from '../../i-role.repository';
import { RoleInMemoryRepository } from './role.repository';

export default [
  // Repository
  {
    provide: IRoleRepository,
    useClass: RoleInMemoryRepository,
  },
];
