import { Module } from '@nestjs/common';

import { AuthModule } from 'src/modules/auth/auth.module';
// import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { PermissionsModule } from 'src/modules/permission/permissions.module';
import { RolesController } from 'src/modules/role/roles.controller';
import { RolesService } from 'src/modules/role/roles.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    DatabaseModule.register(process.env.REPOSITORY_TYPE),
    AuthModule,
    PermissionsModule
  ],
  exports: [],
  controllers: [RolesController],
  providers: [RolesService/*, UniqueValidatorPipe*/]
})
export class RolesModule {}
