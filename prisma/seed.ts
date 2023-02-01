import { PrismaClient } from '@prisma/client';

import CreateEmailTemplateSeed from './seeds/create-email-template-seed';
import CreatePermissionSeed from './seeds/create-permission-seed';
import CreateRoleSeed from './seeds/create-roles-seed';
import CreateUserSeed from './seeds/create-user-seed';

const prisma = new PrismaClient();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  console.log(`Start seeding ...`);
  const permissions = new CreatePermissionSeed();
  permissions.run();

  await sleep(5000); // need to wait to relations to be created
  const roles = new CreateRoleSeed();
  roles.run();

  const email = new CreateEmailTemplateSeed();
  email.run();

  await sleep(1000);
  const users = new CreateUserSeed();
  users.run();

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
