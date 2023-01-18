import { IEmailTemplateRepository } from '../../i-email-template.repository';
import { EmailTemplatePrismaRepository } from './email-template.repository';


export default [
  // Repository
  {
    provide: IEmailTemplateRepository,
    useClass: EmailTemplatePrismaRepository,
  },
  // You can add or switch to 'in-memory repository' if needed for a certain data store.
];
