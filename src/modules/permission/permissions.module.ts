import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
// import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { PermissionsController } from 'src/modules/permission/permissions.controller';
import { PermissionsService } from 'src/modules/permission/permissions.service';

import { PermissionRepository } from './permission.repository';

@Module({
  imports: [forwardRef(() => AuthModule)],
  exports: [PermissionsService],
  controllers: [PermissionsController],
  providers: [
    PermissionsService,
    PermissionRepository /*, UniqueValidatorPipe*/,
  ],
})
export class PermissionsModule {}
