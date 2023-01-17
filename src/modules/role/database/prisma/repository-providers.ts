import { IRoleRepository } from '../../i-role.repository';
import { RolePrismaRepository } from './role.repository';


export default [
  // Repository
  {
    provide: IRoleRepository,
    useClass: RolePrismaRepository,
  },
  // You can add or switch to 'in-memory repository' if needed for a certain data store.
];
