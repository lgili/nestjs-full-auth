import { Injectable } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { RefreshTokenEntity } from 'src/modules/refresh-token/entities/refresh-token.entity';
import { RoleEntity } from 'src/modules/role/entities/role.entity';
import { IRefreshTokenRepository } from '../../i-refresh-token.repository';
import { RefreshTokenSerializer } from '../../serializer/refresh-token.serializer';

@Injectable()
export class RefreshTokenInMemoryRepository implements IRefreshTokenRepository {
  private refreshTokens: RefreshTokenEntity[] = [];

  async findById(id: string): Promise<RefreshTokenEntity> {
    const userIndex = this.refreshTokens.findIndex((userItem) => {
      return userItem.id === id;
    });

    return this.refreshTokens[userIndex];
  }

  async findByUser(userId: string): Promise<RefreshTokenEntity[]> {
    const userIndex = this.refreshTokens.findIndex((userItem) => {
      return userItem.userId === userId;
    });

    return [this.refreshTokens[userIndex]];
  }

  async findAll(): Promise<RefreshTokenEntity[]> {
    return this.refreshTokens;
  }

  async create(token: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    this.refreshTokens.push(token);

    return token;
  }

  async update(token: RefreshTokenEntity): Promise<RefreshTokenEntity> {
    const tokenIndex = this.refreshTokens.findIndex((tokenItem) => {
      return tokenItem.id === token.id;
    });

    this.refreshTokens[tokenIndex] = token;
    return token;
  }

  async delete(id: string): Promise<void> {
    const tokenIndex = this.refreshTokens.findIndex((tokenItem) => {
      return tokenItem.id === id;
    });

    this.refreshTokens.splice(tokenIndex, 1);
  }
}
