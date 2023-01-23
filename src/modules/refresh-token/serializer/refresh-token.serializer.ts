import { ApiProperty } from '@nestjs/swagger';
import { ModelSerializer } from 'src/common/serializer/model.serializer';

export class RefreshTokenSerializer extends ModelSerializer {
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  ip: string;

  @ApiProperty()
  userAgent: string;

  @ApiProperty()
  browser: string;

  @ApiProperty()
  os: string;

  @ApiProperty()
  isRevoked: boolean;

  @ApiProperty()
  expires: Date;
}
