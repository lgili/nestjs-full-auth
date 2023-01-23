import { forwardRef, Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { EmailTemplateController } from 'src/modules/email-template/email-template.controller';
import { EmailTemplateService } from 'src/modules/email-template/email-template.service';

import { EmailTemplateRepository } from './email-template.repository';
// import { UniqueValidatorPipe } from 'src/common/pipes/unique-validator.pipe';

@Module({
  imports: [forwardRef(() => AuthModule)],
  exports: [EmailTemplateService],
  controllers: [EmailTemplateController],
  providers: [EmailTemplateService, EmailTemplateRepository],
})
export class EmailTemplateModule {}
