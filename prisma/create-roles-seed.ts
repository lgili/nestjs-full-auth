import { PrismaClient, Prisma, prisma } from '@prisma/client'

import { RoleEntity } from 'src/role/entities/role.entity';
import { PermissionConfiguration } from 'src/config/permission-config';
import { PermissionEntity } from 'src/permission/entities/permission.entity';


export default class CreateRoleSeed {
  public async run(): Promise<any> {
    const prisma = new PrismaClient()
    const roles = PermissionConfiguration.roles;
    console.log(roles)
    roles.forEach( async role => {    

        if(role.name === 'superuser'){
          const permissions = await prisma.permission.findMany()          
          
          await prisma.role.create({
            data: {
              name: role.name,
              description: role.description, 
              permissions: {
                connect: permissions.map((permission) => ({ id: permission.id })),                
              }                 
            },
            include: {
              permissions: true,
            }
          })
        }
        else {
          await prisma.role.create({
            data: {
              name: role.name,
              description: role.description,                  
            }
          })
        }
        
    })

    console.log("creating super user") 
    const some = await prisma.role.findMany({
      where: {
        name: 'superuser'
      },
      include: {permissions: true}
    })
    console.log(JSON.stringify(some))
    
  }

  
}
