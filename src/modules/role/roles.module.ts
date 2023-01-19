import { forwardRef, Module } from '@nestjs/common';

import { AuthModule } from 'src/modules/auth/auth.module';
// import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { PermissionsModule } from 'src/modules/permission/permissions.module';
import { DatabaseModule } from './database/database.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';

@Module({
  imports: [
    DatabaseModule.register(process.env.REPOSITORY_TYPE),
    forwardRef(() => AuthModule),
    PermissionsModule,
  ],
  exports: [RolesService],
  controllers: [RolesController],
  providers: [RolesService /*, UniqueValidatorPipe*/],
})
export class RolesModule {}
