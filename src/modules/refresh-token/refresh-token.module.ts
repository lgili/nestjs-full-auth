import { forwardRef, Module } from '@nestjs/common';


import { RefreshTokenService } from 'src/modules/refresh-token/refresh-token.service';
import { AuthModule } from 'src/modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    DatabaseModule.register(process.env.REPOSITORY_TYPE),
  ],
  providers: [RefreshTokenService],
  exports: [RefreshTokenService],
  controllers: []
})
export class RefreshTokenModule {}
