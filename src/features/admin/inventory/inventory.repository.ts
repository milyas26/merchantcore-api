
import { StorePrismaClient } from "packages/libs/db/getPrismaForSchema";
import { type GetInventoriesQuery, type InventoryItem, type InventoryStatus } from "./inventory.interface";

export class InventoryRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findMany(query: GetInventoriesQuery) {
    const { page = 1, limit = 10, q, category, status, sortBy = "updatedAt", sortOrder = "desc" } = query;

    const where: any = {};
    if (q) {
      where.OR = [
        { variant: { sku: { contains: q, mode: "insensitive" } } },
        { variant: { title: { contains: q, mode: "insensitive" } } },
        { variant: { product: { name: { contains: q, mode: "insensitive" } } } },
      ];
    }
    if (category) {
      where.variant = { product: { category: { slug: category } } };
    }

    const inventories = await this.prisma.inventory.findMany({
      where,
      include: {
        variant: {
          select: {
            id: true,
            productId: true,
            title: true,
            sku: true,
            updatedAt: true,
            product: {
              select: {
                id: true,
                slug: true,
                name: true,
                category: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    });

    const mapped: InventoryItem[] = inventories.map((inv) => {
      const p = inv.variant.product;
      const name = inv.variant.title ? `${p.name} - ${inv.variant.title}` : p.name;
      const available = inv.quantity - inv.reserved;
      let st: InventoryStatus = "normal";
      if (available <= 0) st = "out";
      else if (inv.lowStockThreshold != null && available <= inv.lowStockThreshold) st = "low";
      return {
        id: inv.id,
        productId: inv.variant.productId,
        productSlug: inv.variant.product.slug,
        name,
        sku: inv.variant.sku,
        categoryId: p.category?.id,
        categoryName: p.category?.name,
        quantity: inv.quantity,
        reserved: inv.reserved,
        lowStockThreshold: inv.lowStockThreshold ?? null,
        status: st,
        updatedAt: inv.updatedAt,
      };
    });

    const filtered = status ? mapped.filter((m) => m.status === status) : mapped;

    const sorted = filtered.sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name) * dir;
        case "sku":
          return a.sku.localeCompare(b.sku) * dir;
        case "quantity":
          return (a.quantity - b.quantity) * dir;
        case "reserved":
          return (a.reserved - b.reserved) * dir;
        case "updatedAt":
        default:
          return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * dir;
      }
    });

    const total = sorted.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paged = sorted.slice(start, start + limit);

    return {
      data: paged,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async update(id: string, data: { quantity: number; reserved: number }) {
    const updated = await this.prisma.inventory.update({
      where: { id },
      data: {
        quantity: data.quantity,
        reserved: data.reserved,
      },
    });
    return updated;
  }
}