import "dotenv/config";
import { PrismaClient as PublicPrismaClient } from "../prisma/generated/public";

const USER_ID = "cmpoxmx8c0000ca0ktlcact3e";

async function main() {
  const publicDbUrl = process.env.DATABASE_URL_PUBLIC;

  if (!publicDbUrl) {
    console.error("Missing DATABASE_URL_PUBLIC in .env");
    process.exit(1);
  }

  const publicPrisma = new PublicPrismaClient({
    datasources: { db: { url: publicDbUrl } },
  });

  let stores: Array<{ id: string; name: string; slug: string }> = [];

  try {
    stores = await publicPrisma.store.findMany({
      select: { id: true, name: true, slug: true },
    });
  } catch (e: any) {
    console.error("Failed to query stores:", e.message);
    process.exit(1);
  }

  if (stores.length === 0) {
    console.log("No stores found in public schema. Nothing to restore.");
    await publicPrisma.$disconnect();
    return;
  }

  console.log(`Found ${stores.length} store(s):`);
  stores.forEach((s) => console.log(`  - ${s.name} (${s.slug}) [${s.id}]`));

  let inserted = 0;
  let skipped = 0;

  for (const store of stores) {
    try {
      const existing = await publicPrisma.storeMembership.findFirst({
        where: { userId: USER_ID, storeId: store.id },
      });

      if (existing) {
        console.log(`  SKIP ${store.name}: membership already exists (role: ${existing.role})`);
        skipped++;
        continue;
      }

      await publicPrisma.storeMembership.create({
        data: {
          userId: USER_ID,
          storeId: store.id,
          role: "OWNER",
        },
      });

      console.log(`  INSERT ${store.name} -> role: OWNER`);
      inserted++;
    } catch (e: any) {
      if (e?.code === "P2002") {
        console.log(`  SKIP ${store.name}: unique constraint violation (already exists)`);
        skipped++;
      } else {
        console.error(`  ERROR ${store.name}: ${e.message}`);
      }
    }
  }

  console.log(`\nDone. Inserted: ${inserted}, Skipped: ${skipped}, Total stores: ${stores.length}`);
  await publicPrisma.$disconnect();
}

main().catch((e) => {
  console.error("Restore failed:", (e as Error).message);
  process.exit(1);
});
