import { FrontstoreAnnouncementRepository } from "./announcements.repository";
import { FrontstoreAnnouncementValidation } from "./announcements.validation";
import type { GetFrontstoreAnnouncementsQuery } from "./announcements.schema";
import { StorePrismaClient } from "../../../../packages/libs/db/getPrismaForSchema";

export class FrontstoreAnnouncementService {
  private repository: FrontstoreAnnouncementRepository;

  constructor(prisma: StorePrismaClient) {
    this.repository = new FrontstoreAnnouncementRepository(prisma);
  }

  async getActiveAnnouncements(query: GetFrontstoreAnnouncementsQuery) {
    const validated = FrontstoreAnnouncementValidation.safeValidateQuery(query);
    return this.repository.findActive(validated);
  }
}
