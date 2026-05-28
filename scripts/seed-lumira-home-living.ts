import "dotenv/config";
import { PrismaClient as StorePrismaClient } from "../prisma/generated/store";
import { PrismaClient as PublicPrismaClient } from "../prisma/generated/public";

async function cleanup(storePrisma: StorePrismaClient) {
  console.log("\nCleaning up existing data...");

  const tables = [
    "cart_items",
    "order_items",
    "order_events",
    "payment_transactions",
    "fulfillments",
    "orders",
    "carts",
    "inventory",
    "product_variants",
    "product_images",
    "product_attributes",
    "product_reviews",
    "promotion_products",
    "promotion_redemptions",
    "promotions",
    "products",
    "categories",
  ];

  for (const table of tables) {
    await storePrisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE`);
  }

  console.log("  All data cleaned up.");
}

async function seed(storePrisma: StorePrismaClient) {
  console.log("\nSeeding Home Living data...");

  const categories = [
    {
      name: "Living Room Furniture",
      slug: "living-room-furniture",
      description: "Stylish sofas, coffee tables, TV stands for your living room.",
      sortOrder: 1,
    },
    {
      name: "Bedroom Furniture",
      slug: "bedroom-furniture",
      description: "Comfortable beds, wardrobes, nightstands for a cozy bedroom.",
      sortOrder: 2,
    },
    {
      name: "Kitchen & Dining",
      slug: "kitchen-dining",
      description: "Dining tables, chairs, kitchen tools and cookware.",
      sortOrder: 3,
    },
    {
      name: "Home Decor",
      slug: "home-decor",
      description: "Wall art, mirrors, vases, candles and decorative accents.",
      sortOrder: 4,
    },
    {
      name: "Lighting",
      slug: "lighting",
      description: "Pendant lights, floor lamps, table lamps and chandeliers.",
      sortOrder: 5,
    },
    {
      name: "Bathroom",
      slug: "bathroom",
      description: "Bath mats, shower curtains, towel sets and organizers.",
      sortOrder: 6,
    },
    {
      name: "Home Office",
      slug: "home-office",
      description: "Desks, office chairs, bookshelves and desk accessories.",
      sortOrder: 7,
    },
    {
      name: "Storage & Organization",
      slug: "storage-organization",
      description: "Shelving, baskets, bins and closet organizers.",
      sortOrder: 8,
    },
    {
      name: "Garden & Outdoor",
      slug: "garden-outdoor",
      description: "Outdoor furniture, planters, garden tools and cushions.",
      sortOrder: 9,
    },
    {
      name: "Textiles & Rugs",
      slug: "textiles-rugs",
      description: "Rugs, curtains, cushions, throws and bedding.",
      sortOrder: 10,
    },
  ];

  const createdCategories = await Promise.all(
    categories.map((cat) => storePrisma.category.create({ data: cat }))
  );

  const catIds = createdCategories.map((c) => c.id);
  const catMap: Record<string, string> = {};
  createdCategories.forEach((c) => (catMap[c.slug] = c.id));

  console.log(`  Created ${createdCategories.length} categories`);

  const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

  interface ProductDef {
    name: string;
    sku: string;
    basePrice: number;
    cost: number;
    weight: number;
    description: string;
    categorySlug: string;
    isMulti: boolean;
    isFeatured?: boolean;
    compareAtPrice?: number;
    attributes?: Array<{ name: string; value: string }>;
  }

  const products: ProductDef[] = [
    // Living Room Furniture (2)
    {
      name: "Modern 3-Seater Sofa Velvet",
      sku: "HL-LR-001",
      basePrice: 4999000,
      cost: 3200000,
      weight: 35,
      description:
        "Elegant 3-seater sofa with premium velvet upholstery. Solid wood frame with high-density foam cushions. Perfect centerpiece for any living room.",
      categorySlug: "living-room-furniture",
      isMulti: true,
      isFeatured: true,
      compareAtPrice: 6499000,
      attributes: [
        { name: "Material", value: "Velvet" },
        { name: "Frame", value: "Solid Wood" },
        { name: "Color", value: "Emerald Green / Charcoal / Beige" },
      ],
    },
    {
      name: "Scandinavian Coffee Table Oak",
      sku: "HL-LR-002",
      basePrice: 1899000,
      cost: 1100000,
      weight: 12,
      description:
        "Minimalist Scandinavian coffee table crafted from solid oak. Features a lower shelf for magazines and storage, rounded edges for safety.",
      categorySlug: "living-room-furniture",
      isMulti: false,
      attributes: [
        { name: "Material", value: "Solid Oak" },
        { name: "Finish", value: "Natural" },
      ],
    },

    // Bedroom Furniture (2)
    {
      name: "Queen Size Platform Bed Frame",
      sku: "HL-BR-001",
      basePrice: 3899000,
      cost: 2400000,
      weight: 45,
      description:
        "Sturdy queen-size platform bed frame with upholstered headboard. No box spring needed. Includes wooden slats for mattress support.",
      categorySlug: "bedroom-furniture",
      isMulti: true,
      isFeatured: true,
      compareAtPrice: 4799000,
      attributes: [
        { name: "Size", value: "Queen (160x200cm)" },
        { name: "Material", value: "Engineered Wood + Fabric" },
        { name: "Headboard", value: "Upholstered" },
      ],
    },
    {
      name: "Minimalist 3-Door Wardrobe",
      sku: "HL-BR-002",
      basePrice: 5599000,
      cost: 3600000,
      weight: 68,
      description:
        "Spacious 3-door wardrobe with hanging rail, drawers, and shelves. Minimalist design with soft-close hinges and matte finish.",
      categorySlug: "bedroom-furniture",
      isMulti: false,
      attributes: [
        { name: "Material", value: "MDF with Melamine" },
        { name: "Doors", value: "3" },
        { name: "Color", value: "White / Walnut" },
      ],
    },

    // Kitchen & Dining (2)
    {
      name: "6-Piece Stainless Steel Cookware Set",
      sku: "HL-KD-001",
      basePrice: 1499000,
      cost: 850000,
      weight: 8.5,
      description:
        "Professional-grade stainless steel cookware set. Includes 20cm & 24cm fry pans, 16cm & 18cm saucepans with lids. Induction-compatible.",
      categorySlug: "kitchen-dining",
      isMulti: false,
      isFeatured: true,
      compareAtPrice: 1999000,
      attributes: [
        { name: "Material", value: "Stainless Steel 18/10" },
        { name: "Pieces", value: "6" },
        { name: "Compatibility", value: "All Stovetops incl. Induction" },
      ],
    },
    {
      name: "Round Marble Dining Table 4-Seater",
      sku: "HL-KD-002",
      basePrice: 4299000,
      cost: 2700000,
      weight: 55,
      description:
        "Elegant round dining table with genuine marble top and solid wood pedestal base. Seats 4 comfortably. Sealed for stain resistance.",
      categorySlug: "kitchen-dining",
      isMulti: false,
      attributes: [
        { name: "Material", value: "Marble + Solid Wood" },
        { name: "Diameter", value: "110 cm" },
        { name: "Seating", value: "4 Persons" },
      ],
    },

    // Home Decor (2)
    {
      name: "Abstract Canvas Wall Art Set of 3",
      sku: "HL-HD-001",
      basePrice: 649000,
      cost: 320000,
      weight: 2.8,
      description:
        "Set of 3 abstract canvas paintings. Gallery-wrapped with wooden frame. Modern geometric design in earth tones. Ready to hang.",
      categorySlug: "home-decor",
      isMulti: true,
      isFeatured: true,
      compareAtPrice: 849000,
      attributes: [
        { name: "Type", value: "Canvas Wall Art" },
        { name: "Style", value: "Abstract" },
        { name: "Sizes", value: "40x60cm / 50x70cm / 60x90cm" },
      ],
    },
    {
      name: "Handmade Ceramic Decorative Vase",
      sku: "HL-HD-002",
      basePrice: 389000,
      cost: 180000,
      weight: 1.2,
      description:
        "Artisanal ceramic vase with reactive glaze finish. Each piece is unique with organic texture. Suitable for fresh or dried flowers.",
      categorySlug: "home-decor",
      isMulti: true,
      attributes: [
        { name: "Material", value: "Stoneware Ceramic" },
        { name: "Height", value: "Small / Medium / Large" },
        { name: "Color", value: "Matte White / Terracotta / Sage" },
      ],
    },

    // Lighting (2)
    {
      name: "Industrial Pendant Light Fixture",
      sku: "HL-LT-001",
      basePrice: 459000,
      cost: 240000,
      weight: 1.8,
      description:
        "Vintage industrial pendant light with adjustable cord. Black metal shade with brass interior. E27 socket, compatible with LED bulbs.",
      categorySlug: "lighting",
      isMulti: false,
      isFeatured: true,
      compareAtPrice: 599000,
      attributes: [
        { name: "Style", value: "Industrial" },
        { name: "Material", value: "Metal + Brass" },
        { name: "Socket", value: "E27" },
      ],
    },
    {
      name: "Nordic Floor Lamp Tripod",
      sku: "HL-LT-002",
      basePrice: 899000,
      cost: 480000,
      weight: 4.2,
      description:
        "Minimalist tripod floor lamp with fabric shade. Solid wood legs in walnut finish. Ideal for reading nook or corner lighting.",
      categorySlug: "lighting",
      isMulti: false,
      attributes: [
        { name: "Material", value: "Wood + Fabric" },
        { name: "Height", value: "160 cm" },
        { name: "Style", value: "Nordic Minimalist" },
      ],
    },

    // Bathroom (2)
    {
      name: "Premium Egyptian Cotton Towel Set",
      sku: "HL-BT-001",
      basePrice: 379000,
      cost: 190000,
      weight: 1.4,
      description:
        "Luxury 6-piece towel set: 2 bath towels, 2 hand towels, 2 face cloths. 700 GSM Egyptian cotton, ultra-absorbent and quick-drying.",
      categorySlug: "bathroom",
      isMulti: true,
      isFeatured: true,
      compareAtPrice: 499000,
      attributes: [
        { name: "Material", value: "Egyptian Cotton" },
        { name: "GSM", value: "700" },
        { name: "Colors", value: "White / Grey / Navy / Sage" },
      ],
    },
    {
      name: "Bamboo Over-the-Toilet Storage Shelf",
      sku: "HL-BT-002",
      basePrice: 549000,
      cost: 290000,
      weight: 4.5,
      description:
        "Space-saving bamboo shelf that fits over standard toilets. 3-tier storage with natural finish. Water-resistant coating. No drilling required.",
      categorySlug: "bathroom",
      isMulti: false,
      attributes: [
        { name: "Material", value: "Bamboo" },
        { name: "Tiers", value: "3" },
        { name: "Installation", value: "Freestanding" },
      ],
    },

    // Home Office (2)
    {
      name: "Adjustable Standing Desk Electric",
      sku: "HL-HO-001",
      basePrice: 4299000,
      cost: 2700000,
      weight: 32,
      description:
        "Electric height-adjustable standing desk with memory controller. 140x70cm desktop. Smooth dual-motor lift. Cable management tray included.",
      categorySlug: "home-office",
      isMulti: true,
      isFeatured: true,
      compareAtPrice: 5499000,
      attributes: [
        { name: "Desktop Size", value: "140x70 cm" },
        { name: "Height Range", value: "72-120 cm" },
        { name: "Top Material", value: "Bamboo / Walnut / White" },
      ],
    },
    {
      name: "Ergonomic Mesh Office Chair",
      sku: "HL-HO-002",
      basePrice: 2899000,
      cost: 1700000,
      weight: 18,
      description:
        "Full mesh ergonomic office chair with lumbar support, adjustable headrest, 3D armrests, and tilt-lock mechanism. Supports up to 130kg.",
      categorySlug: "home-office",
      isMulti: false,
      attributes: [
        { name: "Material", value: "Mesh + Steel Frame" },
        { name: "Weight Capacity", value: "130 kg" },
        { name: "Warranty", value: "3 Years" },
      ],
    },

    // Storage & Organization (2)
    {
      name: "Modular Cube Storage System 8-Cube",
      sku: "HL-SO-001",
      basePrice: 989000,
      cost: 540000,
      weight: 22,
      description:
        "Versatile 8-cube modular storage system. Can be arranged vertically or horizontally. Includes wall anchor kit. Fits standard storage cubes.",
      categorySlug: "storage-organization",
      isMulti: false,
      compareAtPrice: 1299000,
      attributes: [
        { name: "Material", value: "MDF" },
        { name: "Cubes", value: "8" },
        { name: "Color", value: "White / Oak / Black" },
      ],
    },
    {
      name: "Woven Seagrass Storage Basket Set",
      sku: "HL-SO-002",
      basePrice: 249000,
      cost: 120000,
      weight: 1.8,
      description:
        "Set of 3 natural seagrass baskets with handles. Stackable and nestable design. Perfect for organizing toys, laundry, or blanket storage.",
      categorySlug: "storage-organization",
      isMulti: true,
      attributes: [
        { name: "Material", value: "Seagrass" },
        { name: "Sizes", value: "S (25cm) / M (30cm) / L (35cm)" },
      ],
    },

    // Garden & Outdoor (2)
    {
      name: "Foldable Bistro Set 3-Piece",
      sku: "HL-GO-001",
      basePrice: 1599000,
      cost: 900000,
      weight: 16,
      description:
        "Compact 3-piece bistro set: 1 round table + 2 chairs. Powder-coated steel frame, foldable for easy storage. Weather-resistant finish.",
      categorySlug: "garden-outdoor",
      isMulti: false,
      isFeatured: true,
      compareAtPrice: 2099000,
      attributes: [
        { name: "Material", value: "Powder-Coated Steel" },
        { name: "Pieces", value: "3" },
        { name: "Care", value: "Weather Resistant" },
      ],
    },
    {
      name: "Ceramic Garden Planter Set of 4",
      sku: "HL-GO-002",
      basePrice: 349000,
      cost: 160000,
      weight: 6.5,
      description:
        "Set of 4 glazed ceramic planters with drainage holes. Frost-resistant and UV-stable glaze. Graduated sizes from 20cm to 32cm diameter.",
      categorySlug: "garden-outdoor",
      isMulti: false,
      attributes: [
        { name: "Material", value: "Glazed Ceramic" },
        { name: "Pieces", value: "4" },
        { name: "Sizes", value: "20cm - 32cm" },
      ],
    },

    // Textiles & Rugs (2)
    {
      name: "Handwoven Jute Area Rug",
      sku: "HL-TR-001",
      basePrice: 1299000,
      cost: 680000,
      weight: 9,
      description:
        "Handwoven natural jute rug with braided texture. Eco-friendly, biodegradable fibers. Durable and perfect for high-traffic areas. Non-slip backing.",
      categorySlug: "textiles-rugs",
      isMulti: true,
      isFeatured: true,
      compareAtPrice: 1699000,
      attributes: [
        { name: "Material", value: "Natural Jute" },
        { name: "Weave", value: "Hand-Braided" },
        { name: "Sizes", value: "120x180 / 160x230 / 200x300 cm" },
      ],
    },
    {
      name: "Linen Blackout Curtain Panel Pair",
      sku: "HL-TR-002",
      basePrice: 459000,
      cost: 220000,
      weight: 1.6,
      description:
        "Pair of linen-blend blackout curtains with thermal insulation. Blocks 90% of light. Grommet top for easy hanging. Machine washable.",
      categorySlug: "textiles-rugs",
      isMulti: true,
      attributes: [
        { name: "Material", value: "Linen-Polyester Blend" },
        { name: "Light Blocking", value: "90%" },
        { name: "Colors", value: "Beige / Grey / Navy" },
      ],
    },
  ];

  const brandOptions = ["LumiLiving", "HomeEssentials", "NordicNest", "EcoMod"];

  let created = 0;

  for (const p of products) {
    const categoryId = catMap[p.categorySlug];
    if (!categoryId) {
      console.log(`  ⚠ Skipping "${p.name}" — category "${p.categorySlug}" not found`);
      continue;
    }

    const slug = `${p.sku.toLowerCase().replace(/\s+/g, "-")}-${Date.now().toString(36)}`;

    if (p.isMulti) {
      const variantDefs = [
        { title: "S", priceMult: 0.95, qty: 15 },
        { title: "M", priceMult: 1.0, qty: 25 },
        { title: "L", priceMult: 1.0, qty: 20 },
        { title: "XL", priceMult: 1.05, qty: 10 },
      ];

      const variants = variantDefs.map((v, i) => ({
        title: v.title,
        sku: `${p.sku}-${v.title}`,
        price: Math.round((p.basePrice * v.priceMult) / 100) * 100,
        compareAtPrice: p.compareAtPrice
          ? Math.round((p.compareAtPrice * v.priceMult) / 100) * 100
          : null,
        cost: p.cost ? Math.round((p.cost * v.priceMult) / 100) * 100 : null,
        weight: p.weight,
        barcode: `899${String(Date.now()).slice(-5)}${String(i).padStart(4, "0")}`,
        position: i,
        qty: v.qty + Math.floor(Math.random() * 15),
      }));

      const attrs = p.attributes || [
        { name: "Material", value: "Premium" },
        { name: "Brand", value: pick(brandOptions) },
      ];

      await storePrisma.product.create({
        data: {
          name: p.name,
          slug,
          description: p.description,
          categoryId,
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
                  lowStockThreshold: 5,
                },
              },
            })),
          },
          images: {
            create: [
              {
                url: `https://picsum.photos/seed/${slug}/800/800`,
                alt: `${p.name} - Front View`,
                position: 0,
              },
              {
                url: `https://picsum.photos/seed/${slug}-2/800/800`,
                alt: `${p.name} - Detail View`,
                position: 1,
              },
              {
                url: `https://picsum.photos/seed/${slug}-3/800/800`,
                alt: `${p.name} - Lifestyle Shot`,
                position: 2,
              },
            ],
          },
          attributes: {
            create: attrs.map((a, i) => ({
              name: a.name,
              value: a.value,
              position: i,
            })),
          },
        },
      });
    } else {
      const attrs = p.attributes || [
        { name: "Material", value: "Premium" },
        { name: "Brand", value: pick(brandOptions) },
      ];

      await storePrisma.product.create({
        data: {
          name: p.name,
          slug,
          description: p.description,
          categoryId,
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
                    quantity: 30 + Math.floor(Math.random() * 70),
                    reserved: 0,
                    lowStockThreshold: 5,
                  },
                },
              },
            ],
          },
          images: {
            create: [
              {
                url: `https://picsum.photos/seed/${slug}/800/800`,
                alt: `${p.name} - Front View`,
                position: 0,
              },
              {
                url: `https://picsum.photos/seed/${slug}-2/800/800`,
                alt: `${p.name} - Detail View`,
                position: 1,
              },
            ],
          },
          attributes: {
            create: attrs.map((a, i) => ({
              name: a.name,
              value: a.value,
              position: i,
            })),
          },
        },
      });
    }

    created++;
    console.log(`  ✓ ${p.name}`);
  }

  console.log(`\nDone! ${createdCategories.length} categories + ${created} products seeded.`);
}

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

  const targetSlug = "lumira-home-home-living-mtftq";

  const store = await publicPrisma.store.findUnique({
    where: { id: "s_lumira" },
    select: { name: true, slug: true },
  });
  await publicPrisma.$disconnect();

  if (!store) {
    console.error(`Store "s_lumira" not found.`);
    process.exit(1);
  }

  console.log(`Target store: ${store.name} (${store.slug})`);

  const storePrisma = new StorePrismaClient({
    datasources: { db: { url: `${baseDbUrl}?schema=${targetSlug}` } },
  });

  await cleanup(storePrisma);
  await seed(storePrisma);

  await storePrisma.$disconnect();
}

main().catch((e) => {
  console.error("Script failed:", (e as Error).message);
  console.error((e as Error).stack);
  process.exit(1);
});
