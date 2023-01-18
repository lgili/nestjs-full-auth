import { IRefreshTokenRepository } from '../../i-refresh-token.repository';
import { RefreshTokenInMemoryRepository } from './refresh-token.repository';

export default [
  // Repository
  {
    provide: IRefreshTokenRepository,
    useClass: RefreshTokenInMemoryRepository,
  },
];
