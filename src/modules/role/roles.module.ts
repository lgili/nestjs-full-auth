import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
// import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { PermissionsModule } from 'src/modules/permission/permissions.module';

import { RoleRepository } from './role.repository';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [forwardRef(() => AuthModule), PermissionsModule],
  exports: [RolesService],
  controllers: [RolesController],
  providers: [RolesService, RoleRepository /*, UniqueValidatorPipe*/],
})
export class RolesModule {}
