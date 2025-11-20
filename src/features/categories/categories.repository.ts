/* eslint-disable @typescript-eslint/no-explicit-any */
import { StorePrismaClient } from "../../../packages/libs/db/getPrismaForSchema";
import { GetCategoriesQuery } from "./categories.interface";

export class CategoryRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findMany(query: GetCategoriesQuery) {
    const {
      page = 1,
      limit = 20,
      q,
      parentId,
      isActive,
      sortBy = "sortOrder",
      sortOrder = "asc",
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    if (parentId !== undefined) {
      where.parentId = parentId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const total = await this.prisma.category.count({ where });

    const categories = await this.prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: sortOrder },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            isActive: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { sortOrder: "asc" },
        },
        _count: { select: { products: true } },
      },
    });

    return {
      data: categories,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findParents(query: GetCategoriesQuery) {
    const {
      page = 1,
      limit = 20,
      q,
      isActive,
      sortOrder = "asc",
    } = query;

    const whereAll: any = {};
    if (q) {
      whereAll.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    if (isActive !== undefined) {
      whereAll.isActive = isActive;
    }

    const all = await this.prisma.category.findMany({
      where: whereAll,
      orderBy: { sortOrder },
    });

    const map = new Map<string, any>();
    all.forEach((c) => {
      map.set(c.id, { ...c, children: [] as any[] });
    });
    const roots: any[] = [];
    all.forEach((c) => {
      const node = map.get(c.id);
      if (c.parentId) {
        const parent = map.get(c.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    const sortDeep = (nodes: any[]) => {
      nodes.sort((a, b) => a.sortOrder - b.sortOrder);
      nodes.forEach((n) => n.children.length && sortDeep(n.children));
    };
    sortDeep(roots);

    const totalRoots = roots.length;
    const start = (page - 1) * limit;
    const pagedRoots = roots.slice(start, start + limit);

    return {
      data: pagedRoots,
      pagination: {
        page,
        limit,
        total: totalRoots,
        totalPages: Math.ceil(totalRoots / limit),
        hasNext: page < Math.ceil(totalRoots / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string) {
    return await this.prisma.category.findUnique({
      where: { id },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            isActive: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async findBySlug(slug: string) {
    return await this.prisma.category.findUnique({
      where: { slug },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            isActive: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });
  }

  async createCategory(data: {
    name: string;
    slug: string;
    description: string | null;
    image: string | null;
    parentId: string | null;
    isActive: boolean;
    sortOrder: number;
  }) {
    return await this.prisma.category.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description,
        image: data.image,
        parentId: data.parentId,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            isActive: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: {
            sortOrder: "asc",
          },
        },
      },
    });
  }

  async updateCategory(
    id: string,
    data: {
      name?: string;
      slug?: string;
      description?: string | null;
      image?: string | null;
      parentId?: string | null;
      isActive?: boolean;
      sortOrder?: number;
    }
  ) {
    return await this.prisma.category.update({
      where: { id },
      data,
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            isActive: true,
            sortOrder: true,
            createdAt: true,
            updatedAt: true,
          },
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  async deleteCategory(id: string) {
    return await this.prisma.category.delete({ where: { id } });
  }

  async moveCategory(id: string, parentId: string | null, sortOrder?: number) {
    return await this.prisma.category.update({
      where: { id },
      data: {
        parentId,
        ...(typeof sortOrder === "number" ? { sortOrder } : {}),
      },
    });
  }
}