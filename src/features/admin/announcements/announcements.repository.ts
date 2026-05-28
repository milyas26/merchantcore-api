import type { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";
import type {
  GetAnnouncementsQuery,
  CreateAnnouncementRequest,
  UpdateAnnouncementRequest,
} from "./announcements.schema";

export class AnnouncementRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findMany(query: GetAnnouncementsQuery) {
    const {
      page = 1, limit = 20, q, type, active,
      sortBy = "createdAt", sortOrder = "desc",
    } = query;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }
    if (type) where.type = type;
    if (active !== undefined) where.isActive = active;

    const sortFieldMap: Record<string, string> = {
      title: "title",
      type: "type",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    };

    const total = await this.prisma.announcement.count({ where });

    const announcements = await this.prisma.announcement.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortFieldMap[sortBy] || "createdAt"]: sortOrder },
    });

    return {
      data: announcements,
      pagination: {
        page, limit, total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findById(id: string) {
    return this.prisma.announcement.findUnique({ where: { id } });
  }

  async create(data: CreateAnnouncementRequest, createdBy: string) {
    return this.prisma.announcement.create({
      data: {
        title: data.title,
        description: data.description || null,
        link: data.link || null,
        type: data.type || "INFO",
        createdBy,
        isActive: data.isActive ?? true,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
      },
    });
  }

  async update(id: string, data: UpdateAnnouncementRequest) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.link !== undefined) updateData.link = data.link;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.startsAt !== undefined) updateData.startsAt = data.startsAt ? new Date(data.startsAt) : null;
    if (data.endsAt !== undefined) updateData.endsAt = data.endsAt ? new Date(data.endsAt) : null;

    return this.prisma.announcement.update({ where: { id }, data: updateData });
  }

  async delete(id: string) {
    await this.prisma.announcement.delete({ where: { id } });
  }
}
