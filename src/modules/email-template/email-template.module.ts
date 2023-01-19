import { forwardRef, Module } from '@nestjs/common';

import { EmailTemplateService } from 'src/modules/email-template/email-template.service';
import { EmailTemplateController } from 'src/modules/email-template/email-template.controller';
import { AuthModule } from 'src/modules/auth/auth.module';
import { DatabaseModule } from './database/database.module';
// import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';

@Module({
  imports: [
    DatabaseModule.register(process.env.REPOSITORY_TYPE),
    forwardRef(() => AuthModule),
  ],
  exports: [EmailTemplateService],
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService],
})
export class EmailTemplateModule {}
