import { RefreshTokenEntity } from "./entities/refresh-token.entity";


export abstract class IRefreshTokenRepository {
  abstract findById: (id: string) => Promise<RefreshTokenEntity>;
  abstract findByUser: (userId: string) => Promise<RefreshTokenEntity[]>;
  // abstract findAll: () => Promise<RefreshTokenEntity[]>;
  abstract create: (user: RefreshTokenEntity) => Promise<RefreshTokenEntity>;
  abstract update: (user: RefreshTokenEntity) => Promise<RefreshTokenEntity>;
  abstract delete: (id: string) => Promise<void>;
}
