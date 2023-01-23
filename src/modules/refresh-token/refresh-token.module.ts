import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { RefreshTokenService } from 'src/modules/refresh-token/refresh-token.service';

import { RefreshTokenRepository } from './refresh-token.repository';

@Module({
  imports: [forwardRef(() => AuthModule)],
  providers: [RefreshTokenService, RefreshTokenRepository],
  exports: [RefreshTokenService],
  controllers: [],
})
export class RefreshTokenModule {}
