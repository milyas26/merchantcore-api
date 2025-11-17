import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function assertValidSchema(schema: string) {
  if (!/^[a-z0-9_-]+$/.test(schema)) throw new Error("Invalid schema");
}

function quoteIdent(identifier: string): string {
  return '"' + identifier.replace(/"/g, '""') + '"';
}

export async function runInSchema<T>(
  schema: string,
  cb: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  if (!schema) {
    throw new Error("Schema name is required and cannot be empty");
  }

  assertValidSchema(schema);

  return prisma.$transaction(async (tx) => {
    const target = quoteIdent(schema);
    await (tx as PrismaClient).$executeRawUnsafe(`SET search_path TO ${target}, public;`);
    return cb(tx as PrismaClient);
  });
}

export { prisma };
