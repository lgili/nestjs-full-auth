import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/auth/auth.module';
// import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { PermissionsModule } from 'src/permission/permissions.module';

import { RolesController } from './roles.controller';
import { RoleRepository } from './roles.repository';
import { RolesService } from './roles.service';

@Module({
  imports: [forwardRef(() => AuthModule), PermissionsModule],
  exports: [RolesService],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository /*, UniqueValidatorPipe*/],
})
export class RolesModule {}
