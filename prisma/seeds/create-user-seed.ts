import { PrismaClient } from '@prisma/client';
import { UserStatusEnum } from 'src/auth/user-status.enum';

export default class CreateUserSeed {
  public async run(): Promise<any> {
    const prisma = new PrismaClient();

    const role = await prisma.role.findFirst({
      where: {
        name: 'superuser',
      },
      include: { permissions: true },
    });

    if (!role) {
      return;
    }

    const user = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@truthy.com',
        password:
          '$2b$10$O9BWip02GuE14bDPfBomQebCjwKQyuUfkulhvBB1UoizOeKxGG8Fu', // Truthy@123
        salt: '$2b$10$O9BWip02GuE14bDPfBomQe',
        name: 'truthy',
        status: UserStatusEnum.ACTIVE,
        role: {
          connect: { id: role.id },
        },
      },
      include: {
        role: true,
      },
    });
  }
}
