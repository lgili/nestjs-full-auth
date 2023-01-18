import { PrismaClient, Prisma } from '@prisma/client'

import * as templates from 'src/config/email-template';


export default class CreateEmailTemplateSeed {
  public async run(): Promise<any> {
    const prisma = new PrismaClient()
    templates.forEach( async template => {
        await prisma.emailTemplate.create({
            data: template
        })
    })
}

}
