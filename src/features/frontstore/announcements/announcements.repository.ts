import type { GetFrontstoreAnnouncementsQuery } from "./announcements.schema";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreAnnouncementRepository {
  constructor(private prisma: StorePrismaClient) {}

  async findActive(query: GetFrontstoreAnnouncementsQuery) {
    const now = new Date();
    const where: any = {
      isActive: true,
      OR: [
        { startsAt: null },
        { startsAt: { lte: now } },
      ],
      AND: [
        {
          OR: [
            { endsAt: null },
            { endsAt: { gte: now } },
          ],
        },
      ],
    };

    if (query.type) {
      where.type = query.type;
    }

    const announcements = await this.prisma.announcement.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return {
      data: announcements,
    };
  }
}
