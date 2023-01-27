import { Prisma, PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import * as util from 'util';

const execPromisify = util.promisify(exec);
export const prisma = new PrismaClient();

const tables = Prisma.dmmf.datamodel.models
  .map((model) => model.dbName)
  .filter((table) => table);

const clearMysql = async () => {
  await prisma.$transaction([
    prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`,
    ...tables.map((table) => prisma.$executeRawUnsafe(`TRUNCATE ${table};`)),
    prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`,
  ]);
};

const clearPostgres = async () => {
  await prisma.$transaction([
    ...tables.map((table) =>
      prisma.$executeRawUnsafe(`TRUNCATE ${table} CASCADE;`),
    ),
  ]);
};

const clearSQLite = async () => {
  await prisma.$transaction([
    ...tables.map((table) =>
      prisma.$executeRawUnsafe(`TRUNCATE ${table} CASCADE;`),
    ),
  ]);
};

const clearDefault = async () =>
  execPromisify('npx prisma migrate reset --force --skip-seed');

export const clear = async (provider: string) => {
  const executeClear = {
    mysql: clearMysql,
    postgres: clearPostgres,
    sqlite: clearSQLite,
  };

  const execute = executeClear[provider] || clearDefault;

  return execute();
};

export const generate = async () => execPromisify('npx prisma generate');

export const dbPush = async () => execPromisify('npx prisma db push');

export const migrate = async () => execPromisify('npx prisma migrate deploy');
