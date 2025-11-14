import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function assertValidSchema(schema: string) {
  if (!/^[a-z0-9_-]+$/.test(schema)) throw new Error("Invalid schema");
}

export async function runInSchema<T>(
  schema: string,
  cb: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  assertValidSchema(schema);

  return prisma.$transaction(async (tx) => {
    await (tx as PrismaClient).$executeRawUnsafe(`SET LOCAL search_path TO "${schema}";`);
    return cb(tx as PrismaClient);
  });
}

export { prisma };
