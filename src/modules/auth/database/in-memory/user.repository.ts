import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { IUserRepository } from 'src/modules/auth/i-user.repository';
import { UserEntity } from 'src/modules/auth/entity/user.entity';
import { UserSerializer } from '../../serializer/user.serializer';

@Injectable()
export class UserInMemoryRepository implements IUserRepository {
  private users: UserEntity[] = [];

  async findById(id: string): Promise<UserEntity> {
    const userIndex = this.users.findIndex((userItem) => {
      return userItem.id === id;
    });

    return this.users[userIndex];
  }

  async findByToken(token: string): Promise<UserEntity[]> {
    const usersLocal: UserEntity[] = []
    const userIndex = this.users.findIndex((userItem) => {
      return userItem.token === token;
    });

    // this return empty array always FIXME
    return usersLocal;
  }

  async findByEmail(email: string): Promise<UserEntity> {
    const userIndex = this.users.findIndex((userItem) => {
      return userItem.email === email;
    });

    return this.users[userIndex];
  }

  async findAll(): Promise<UserEntity[]> {
    return this.users;
  }

  async create(user: UserEntity): Promise<UserEntity> {
    this.users.push(user);

    return user;
  }

  async update(user: UserEntity): Promise<UserEntity> {
    const userIndex = this.users.findIndex((userItem) => {
      return userItem.id === user.id;
    });

    this.users[userIndex] = user;
    return user;
  }

  async delete(id: string): Promise<void> {
    const userIndex = this.users.findIndex((userItem) => {
      return userItem.id === id;
    });

    this.users.splice(userIndex, 1);
  }
  
}
