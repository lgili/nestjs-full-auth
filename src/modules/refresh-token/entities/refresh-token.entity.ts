export class RefreshTokenEntity {
  id: string;
  userId: string;
  ip: string;
  userAgent: string;
  browser?: string;
  os?: string;
  isRevoked: boolean;
  expires: Date;

  constructor(data?: Partial<RefreshTokenEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  update(data?: Partial<RefreshTokenEntity>) {
    // for (const key in data) {
    //   console.log(key, data[key]);
    //   RoleEntity[key] = data[key]!;
    // }
    if (data) {
      Object.assign(this, data);
    }
  }
}
