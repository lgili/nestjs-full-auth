export class EmailTemplateEntity {
  id: string;
  title: string;

  slug: string;

  sender: string;

  subject: string;

  body: string;

  isDefault: boolean;

  constructor(data?: Partial<EmailTemplateEntity>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  update(data?: Partial<EmailTemplateEntity>) {
    // for (const key in data) {
    //   console.log(key, data[key]);
    //   RoleEntity[key] = data[key]!;
    // }
    if (data) {
      Object.assign(this, data);
    }
  }
}
