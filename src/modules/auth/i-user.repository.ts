import { UserEntity } from "./entity/user.entity";



export abstract class IUserRepository {
  abstract findById: (id: string) => Promise<UserEntity>;
  abstract findByEmail: (email: string) => Promise<UserEntity>;
  abstract findByToken: (token: string) => Promise<UserEntity[]>;
  abstract findAll: () => Promise<UserEntity[]>;
  abstract update: (user: UserEntity) => Promise<UserEntity>;
  abstract create: (user: UserEntity) => Promise<UserEntity>;
  abstract delete: (id: string) => Promise<void>;
}
