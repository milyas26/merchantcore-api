import "dotenv/config";
import { PrismaClient as StorePrismaClient } from "../prisma/generated/store";
import { PrismaClient as PublicPrismaClient } from "../prisma/generated/public";

async function main() {
  const publicDbUrl = process.env.DATABASE_URL_PUBLIC;
  const baseDbUrl = process.env.DATABASE_URL_BASE;

  if (!publicDbUrl || !baseDbUrl) {
    console.error("Missing DATABASE_URL_PUBLIC or DATABASE_URL_BASE in .env");
    process.exit(1);
  }

  const publicPrisma = new PublicPrismaClient({
    datasources: { db: { url: publicDbUrl } },
  });

  let stores: Array<{ id: string; name: string; slug: string }> = [];

  try {
    stores = await publicPrisma.store.findMany({
      select: { id: true, name: true, slug: true },
      where: { isActive: true },
    });
  } catch (e: any) {
    console.error("Failed to query public schema:", e.message);
  } finally {
    await publicPrisma.$disconnect();
  }

  if (stores.length === 0) {
    console.error("No stores found in public schema. Create a store first.");
    process.exit(1);
  }

  console.log("Available stores:");
  stores.forEach((s, i) => console.log(`  ${i + 1}. ${s.name} (${s.slug})`));

  const targetSlug = process.argv[2] || stores[0].slug;
  const store = stores.find((s) => s.slug === targetSlug);
  if (!store) {
    console.error(`Store with slug "${targetSlug}" not found.`);
    process.exit(1);
  }

  const storePrisma = new StorePrismaClient({
    datasources: { db: { url: `${baseDbUrl}?schema=${targetSlug}` } },
  });

  console.log(`\nSeeding store: ${store.name} (${targetSlug})`);

  const existingProducts = await storePrisma.product.count();
  if (existingProducts > 0) {
    console.log(`  ${existingProducts} products already exist. Skipping.`);
    await storePrisma.$disconnect();
    return;
  }

  const pick = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)];

  let categoryIds: string[] = [];
  const existingCategories = await storePrisma.category.count();

  if (existingCategories === 0) {
    const cats = await Promise.all([
      storePrisma.category.create({
        data: { name: "Pakaian", slug: "pakaian", sortOrder: 1 },
      }),
      storePrisma.category.create({
        data: { name: "Sepatu", slug: "sepatu", sortOrder: 2 },
      }),
      storePrisma.category.create({
        data: { name: "Aksesoris", slug: "aksesoris", sortOrder: 3 },
      }),
    ]);
    categoryIds = cats.map((c) => c.id);
    console.log(`  Created ${cats.length} categories`);
  } else {
    const cats = await storePrisma.category.findMany({
      select: { id: true },
    });
    categoryIds = cats.map((c) => c.id);
    console.log(`  Using ${cats.length} existing categories`);
  }

  const products = [
    {
      name: "Kaos Polos Katun Premium",
      sku: "KP-001",
      basePrice: 89000,
      cost: 45000,
      weight: 0.2,
      description:
        "Kaos polos berbahan katun combed 30s premium. Nyaman dipakai sehari-hari, tersedia dalam berbagai ukuran.",
      isFeatured: true,
      isMulti: true,
    },
    {
      name: "Kemeja Oxford Slim Fit",
      sku: "KOF-001",
      basePrice: 249000,
      cost: 140000,
      weight: 0.35,
      description:
        "Kemeja oxford slim fit premium dengan bahan breathable. Cocok untuk casual formal look.",
      isFeatured: true,
      isMulti: true,
    },
    {
      name: "Celana Jeans Stretch Skinny",
      sku: "CJ-002",
      basePrice: 329000,
      cost: 180000,
      weight: 0.5,
      compareAtPrice: 399000,
      description:
        "Celana jeans skinny fit dengan bahan stretch denim berkualitas. Nyaman dan stylish.",
      isMulti: true,
    },
    {
      name: "Jaket Bomber Nylon Water Repellent",
      sku: "JB-003",
      basePrice: 549000,
      cost: 320000,
      weight: 0.7,
      compareAtPrice: 699000,
      description:
        "Jaket bomber dengan material nylon water repellent. Ringan, tahan air, dan stylish.",
      isFeatured: true,
      isMulti: false,
    },
    {
      name: "Sneakers Canvas Vintage",
      sku: "SN-CV-01",
      basePrice: 179000,
      cost: 95000,
      weight: 0.6,
      description:
        "Sneakers canvas gaya vintage dengan sol karet nyaman. Tersedia berbagai ukuran.",
      isMulti: true,
    },
    {
      name: "Sepatu Running Lightweight Pro",
      sku: "SR-LP-02",
      basePrice: 459000,
      cost: 280000,
      weight: 0.45,
      compareAtPrice: 599000,
      description:
        "Sepatu lari ringan dengan teknologi cushioning terbaru. Didesain untuk performa maksimal.",
      isMulti: false,
    },
    {
      name: "Tas Ransel 25L Anti Air",
      sku: "TR-25-AA",
      basePrice: 259000,
      cost: 150000,
      weight: 0.8,
      description:
        "Tas ransel kapasitas 25L dengan material anti air. Multifungsi untuk kantor dan traveling.",
      isMulti: false,
    },
    {
      name: "Dompet Kulit Minimalis RFID",
      sku: "DK-RFID",
      basePrice: 149000,
      cost: 80000,
      weight: 0.08,
      description:
        "Dompet kulit genuine dengan teknologi RFID blocking. Desain minimalis dan praktis.",
      isMulti: false,
    },
    {
      name: "Topi Baseball Embroidered Logo",
      sku: "TB-EL-01",
      basePrice: 99000,
      cost: 45000,
      weight: 0.1,
      description:
        "Topi baseball dengan bordir logo premium. Adjustable strap, one size fits all.",
      isMulti: false,
    },
    {
      name: "Kaus Kaki Olahraga 3-Pack",
      sku: "KKO-3P",
      basePrice: 49000,
      cost: 22000,
      weight: 0.15,
      description:
        "Paket 3 pasang kaus kaki olahraga berbahan katun. Nyaman, tidak licin, anti bau.",
      isMulti: false,
    },
    {
      name: "Jam Tangan Chronograph Leather",
      sku: "JT-CH-L",
      basePrice: 449000,
      cost: 250000,
      weight: 0.12,
      compareAtPrice: 549000,
      description:
        "Jam tangan chronograph dengan tali kulit genuine. Water resistant 5ATM.",
      isMulti: false,
    },
    {
      name: "Kaos Graphic Limited Edition",
      sku: "KG-LE-07",
      basePrice: 149000,
      cost: 70000,
      weight: 0.2,
      description:
        "Kaos graphic edisi terbatas dengan desain exclusive. Dicetak dengan teknik DTG premium.",
      isFeatured: true,
      isMulti: true,
    },
  ];

  const materialOptions = [
    "Katun Combed 30s",
    "Polyester",
    "Denim",
    "Kulit Genuine",
    "Nylon",
    "Canvas",
    "Katun",
  ];

  let created = 0;

  for (const p of products) {
    const slugBase = p.sku.toLowerCase().replace(/\s+/g, "-");
    const slug = `${slugBase}-${Date.now().toString(36)}`;
    const material = pick(materialOptions);

    if (p.isMulti) {
      const variantDefs = [
        { title: "S", priceMult: 0.95, qty: 25 },
        { title: "M", priceMult: 1.0, qty: 40 },
        { title: "L", priceMult: 1.0, qty: 35 },
        { title: "XL", priceMult: 1.05, qty: 15 },
      ];

      const variants = variantDefs.map((v, i) => ({
        title: v.title,
        sku: `${p.sku}-${v.title}`,
        price: Math.round(p.basePrice * v.priceMult / 100) * 100,
        compareAtPrice: p.compareAtPrice
          ? Math.round(p.compareAtPrice * v.priceMult / 100) * 100
          : null,
        cost: p.cost
          ? Math.round(p.cost * v.priceMult / 100) * 100
          : null,
        weight: p.weight,
        barcode: `899${String(Date.now()).slice(-5)}${String(i).padStart(4, "0")}`,
        position: i,
        qty: v.qty + Math.floor(Math.random() * 20),
      }));

      const result = await storePrisma.product.create({
        data: {
          name: p.name,
          slug,
          description: p.description,
          categoryId: pick(categoryIds),
          sku: p.sku,
          basePrice: p.basePrice,
          compareAtPrice: p.compareAtPrice || null,
          cost: p.cost || null,
          weight: p.weight,
          isActive: true,
          isFeatured: p.isFeatured ?? false,
          trackInventory: true,
          isVariant: true,
          seoTitle: p.name,
          seoDescription: p.description.slice(0, 160),
          variants: {
            create: variants.map((v) => ({
              title: v.title,
              sku: v.sku,
              price: v.price,
              compareAtPrice: v.compareAtPrice,
              cost: v.cost,
              weight: v.weight,
              barcode: v.barcode,
              position: v.position,
              isActive: true,
              inventory: {
                create: {
                  quantity: v.qty,
                  reserved: 0,
                  lowStockThreshold: 10,
                },
              },
            })),
          },
          images: {
            create: [
              {
                url: `https://picsum.photos/seed/${slug}/600/600`,
                alt: `${p.name} - Tampak Depan`,
                position: 0,
              },
              {
                url: `https://picsum.photos/seed/${slug}-2/600/600`,
                alt: `${p.name} - Tampak Belakang`,
                position: 1,
              },
            ],
          },
          attributes: {
            create: [
              { name: "Material", value: material, position: 0 },
              { name: "Brand", value: "MerchantCore", position: 1 },
            ],
          },
        },
      });
      console.log(
        `  ✓ ${p.name} (${variants.length} varian) — ${result.id}`
      );
    } else {
      const result = await storePrisma.product.create({
        data: {
          name: p.name,
          slug,
          description: p.description,
          categoryId: pick(categoryIds),
          sku: p.sku,
          basePrice: p.basePrice,
          compareAtPrice: p.compareAtPrice || null,
          cost: p.cost || null,
          weight: p.weight,
          isActive: true,
          isFeatured: p.isFeatured ?? false,
          trackInventory: true,
          isVariant: false,
          seoTitle: p.name,
          seoDescription: p.description.slice(0, 160),
          variants: {
            create: [
              {
                title: "Default",
                sku: `${p.sku}-DEFAULT`,
                price: p.basePrice,
                compareAtPrice: p.compareAtPrice || null,
                cost: p.cost || null,
                weight: p.weight,
                barcode: `899${String(Date.now()).slice(-5)}0001`,
                position: 0,
                isActive: true,
                inventory: {
                  create: {
                    quantity: 50 + Math.floor(Math.random() * 100),
                    reserved: 0,
                    lowStockThreshold: 10,
                  },
                },
              },
            ],
          },
          images: {
            create: [
              {
                url: `https://picsum.photos/seed/${slug}/600/600`,
                alt: p.name,
                position: 0,
              },
            ],
          },
          attributes: {
            create: [
              { name: "Material", value: material, position: 0 },
              { name: "Brand", value: "MerchantCore", position: 1 },
            ],
          },
        },
      });
      console.log(`  ✓ ${p.name} (1 varian) — ${result.id}`);
    }

    created++;
  }

  console.log(`\nDone! ${created} products seeded into "${targetSlug}".`);
  await storePrisma.$disconnect();
}

main().catch((e) => {
  console.error("Seed failed:", (e as Error).message);
  process.exit(1);
});
