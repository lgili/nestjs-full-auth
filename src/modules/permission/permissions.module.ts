import { Module } from '@nestjs/common';


import { AuthModule } from 'src/modules/auth/auth.module';
// import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { PermissionsController } from 'src/modules/permission/permissions.controller';
import { PermissionsService } from 'src/modules/permission/permissions.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    DatabaseModule.register(process.env.REPOSITORY_TYPE),
    AuthModule],
  exports: [PermissionsService],
  controllers: [PermissionsController],
  providers: [PermissionsService/*, UniqueValidatorPipe*/]
})
export class PermissionsModule {}
