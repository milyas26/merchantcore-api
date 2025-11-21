#!/usr/bin/env tsx

import 'dotenv/config';
import { spawn } from 'node:child_process';
import { join } from 'node:path';
import { getPrismaPublic, getPrismaForSchema } from 'packages/libs/db/getPrismaForSchema';

type Result = { slug: string; success: boolean; error?: string; startedAt: number; finishedAt: number };

function validateSlug(slug: string) {
  if (!/^[a-z0-9_-]+$/.test(slug)) throw new Error('Invalid slug');
}

async function ensureSchemaExists(slug: string) {
  const prisma = getPrismaPublic();
  await prisma.$executeRawUnsafe(`CREATE SCHEMA IF NOT EXISTS "${slug}"`);
}

function runDeploy(schemaUrl: string): Promise<{ stdout: string; stderr: string; code: number }> {
  return new Promise((resolve) => {
    const cwd = join(__dirname, '../prisma/store');
    const env = { ...process.env, DATABASE_URL_STORE: schemaUrl };
    const child = spawn('npx', ['prisma', 'migrate', 'deploy'], { cwd, env });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => {
      stdout += d.toString();
      process.stdout.write(d);
    });
    child.stderr.on('data', (d) => {
      stderr += d.toString();
      process.stderr.write(d);
    });
    child.on('close', (code) => {
      resolve({ stdout, stderr, code: code ?? 0 });
    });
  });
}

async function migrateSlug(slug: string): Promise<Result> {
  const startedAt = Date.now();
  try {
    validateSlug(slug);
    await ensureSchemaExists(slug);
    const base = process.env.DATABASE_URL_BASE;
    if (!base) throw new Error('DATABASE_URL_BASE is missing');
    const schemaUrl = `${base}?schema=${slug}`;
    const deploy = await runDeploy(schemaUrl);
    if (deploy.code !== 0) {
      return { slug, success: false, error: deploy.stderr || 'Migration failed', startedAt, finishedAt: Date.now() };
    }
    const prisma = getPrismaForSchema(slug);
    await prisma.$connect();
    await prisma.$disconnect();
    return { slug, success: true, startedAt, finishedAt: Date.now() };
  } catch (e: any) {
    return { slug, success: false, error: e?.message || String(e), startedAt, finishedAt: Date.now() };
  }
}

async function main() {
  const t0 = Date.now();
  const publicPrisma = getPrismaPublic();
  const stores = await publicPrisma.store.findMany({ select: { slug: true } });
  const slugs = stores.map((s) => s.slug);
  const results: Result[] = [];
  for (const slug of slugs) {
    console.log(`➡️  Migrasi schema: ${slug}`);
    const r = await migrateSlug(slug);
    if (r.success) {
      console.log(`✅ ${slug} selesai dalam ${r.finishedAt - r.startedAt} ms`);
    } else {
      console.log(`❌ ${slug} gagal: ${r.error}`);
    }
    results.push(r);
  }
  const successCount = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success);
  const totalMs = Date.now() - t0;
  console.log('----- Laporan Migrasi -----');
  console.log(`Schema berhasil: ${successCount}`);
  if (failed.length) {
    console.log('Schema gagal:');
    failed.forEach((f) => console.log(`- ${f.slug}: ${f.error}`));
  } else {
    console.log('Tidak ada kegagalan');
  }
  console.log(`Total waktu eksekusi: ${totalMs} ms`);
}

if (require.main === module) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}