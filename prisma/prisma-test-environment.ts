import type { Config } from '@jest/types';
import { PrismaClient } from '@prisma/client';
import { exec } from 'child_process';
import * as dotenv from 'dotenv';
import NodeEnvironment from 'jest-environment-node';
// import crypto from 'node:crypto';
import * as util from 'util';

dotenv.config({ path: '.env.testing' });

const execSync = util.promisify(exec);

const prismaBinary = './node_modules/.bin/prisma';

// const clearMysql = async () => {
//   await prisma.$transaction([
//     prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`,
//     ...tables.map((table) => prisma.$executeRawUnsafe(`TRUNCATE ${table};`)),
//     prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`,
//   ]);
// };

// const clearPostgres = async () => {
//   await prisma.$transaction([
//     ...tables.map((table) =>
//       prisma.$executeRawUnsafe(`TRUNCATE ${table} CASCADE;`),
//     ),
//   ]);
// };

export default class PrismaTestEnvironment extends NodeEnvironment {
  private schema: string;
  private connectionString: string;

  constructor(config, context) {
    super(config, context);

    const dbUser = process.env.DATABASE_USER;
    const dbPass = process.env.DATABASE_PASS;
    const dbHost = process.env.DATABASE_HOST;
    const dbPort = process.env.DATABASE_PORT;
    const dbName = process.env.DATABASE_NAME;

    this.connectionString = `mongodb://${dbUser}:${dbPass}@${dbHost}:${dbPort}/${dbName}?authSource=admin`;
  }

  async setup() {
    process.env.DATABASE_URL = this.connectionString;
    this.global.process.env.DATABASE_URL = this.connectionString;

    await execSync(`${prismaBinary} migrate deploy`);

    return super.setup();
  }

  async teardown() {
    // const client = new Client({
    //   connectionString: this.connectionString,
    // });
    const prisma = new PrismaClient();

    await prisma.$connect();
    // await prisma.query(`DROP SCHEMA IF EXISTS "${this.schema}" CASCADE`);
    // await prisma.$transaction([
    //   prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 0;`,
    //   ...tables.map((table) => prisma.$executeRawUnsafe(`TRUNCATE ${table};`)),
    //   prisma.$executeRaw`SET FOREIGN_KEY_CHECKS = 1;`,
    // ]);
    await prisma.$disconnect();
  }
}
