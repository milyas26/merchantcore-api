import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { getPrismaPublic, getPrismaForSchema } from '../../packages/libs/db/getPrismaForSchema';

function validateSlug(slug: string) {
  if (!/^[a-z0-9_-]+$/.test(slug)) {
    throw new Error(`Invalid slug format: "${slug}"`);
  }
}

async function ensureSchemaExists(slug: string) {
  const prisma = getPrismaPublic();
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${slug}"`);
}

function runDeploy(schemaUrl: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const cwd = join(process.cwd(), 'prisma/store');
    const child = spawn('npx', ['prisma', 'migrate', 'deploy'], {
      cwd,
      env: { ...process.env, DATABASE_URL_STORE: schemaUrl },
    });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => (stdout += d.toString()));
    child.stderr.on('data', (d) => (stderr += d.toString()));
    child.on('close', (code) => {
      resolve({ stdout, stderr, code: code ?? 0 });
    });
  });
}

export async function setupStoreSchema(slug: string): Promise<void> {
  validateSlug(slug);
  await ensureSchemaExists(slug);

  const base = process.env.DATABASE_URL_BASE;
  if (!base) throw new Error('DATABASE_URL_BASE is missing');

  const schemaUrl = `${base}?schema=${slug}`;
  const result = await runDeploy(schemaUrl);

  if (result.code !== 0) {
    const errMsg = result.stderr || result.stdout || 'Unknown migration error';
    throw new Error(`Migration failed for schema "${slug}": ${errMsg}`);
  }

  const prisma = getPrismaForSchema(slug);
  await prisma.$connect();
  await prisma.$disconnect();

  console.log(`✅ Schema "${slug}" migrated successfully`);
}
