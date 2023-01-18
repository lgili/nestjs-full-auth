import { IEmailTemplateRepository } from '../../i-email-template.repository';
import { EmailTemplateInMemoryRepository } from './email-template.repository';

export default [
  // Repository
  {
    provide: IEmailTemplateRepository,
    useClass: EmailTemplateInMemoryRepository,
  },
];
