import { IRefreshTokenRepository } from '../../i-refresh-token.repository';
import { RefreshTokenPrismaRepository } from './refresh-token.repository';

export default [
  // Repository
  {
    provide: IRefreshTokenRepository,
    useClass: RefreshTokenPrismaRepository,
  },
  // You can add or switch to 'in-memory repository' if needed for a certain data store.
];
