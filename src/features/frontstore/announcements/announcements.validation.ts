import { getFrontstoreAnnouncementsQuerySchema } from "./announcements.schema";
import type { GetFrontstoreAnnouncementsQuery } from "./announcements.schema";

export class FrontstoreAnnouncementValidation {
  static safeValidateQuery(query: GetFrontstoreAnnouncementsQuery): GetFrontstoreAnnouncementsQuery {
    try {
      return getFrontstoreAnnouncementsQuerySchema.parse(query);
    } catch (_error) {
      return {} as GetFrontstoreAnnouncementsQuery;
    }
  }
}
