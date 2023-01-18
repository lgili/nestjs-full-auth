import { Module } from '@nestjs/common';

import { AuthModule } from 'src/modules/auth/auth.module';
// import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';
import { PermissionsModule } from 'src/modules/permission/permissions.module';
import { EmailTemplateController } from 'src/modules/email-template/email-template.controller';
import { EmailTemplateService } from 'src/modules/email-template/email-template.service';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    DatabaseModule.register(process.env.REPOSITORY_TYPE),
    AuthModule,
    PermissionsModule
  ],
  exports: [],
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService/*, UniqueValidatorPipe*/]
})
export class EmailTemplatesModule {}
