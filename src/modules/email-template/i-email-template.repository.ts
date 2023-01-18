import { PermissionEntity } from "../permission/entities/permission.entity";
import { EmailTemplateEntity } from "./entities/email-template.entity";


export abstract class IEmailTemplateRepository {
  abstract findById: (id: string) => Promise<EmailTemplateEntity>;
  abstract findBySlug: (slug: string) => Promise<EmailTemplateEntity>;
  abstract findAll: () => Promise<EmailTemplateEntity[]>;
  abstract create: (user: EmailTemplateEntity) => Promise<EmailTemplateEntity>;
  abstract update: (user: EmailTemplateEntity) => Promise<EmailTemplateEntity>;
  abstract delete: (id: string) => Promise<void>;
}
