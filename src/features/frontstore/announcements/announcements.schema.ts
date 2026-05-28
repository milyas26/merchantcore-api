import { z } from "zod";

export const getFrontstoreAnnouncementsQuerySchema = z.object({
  type: z.enum(["INFO", "WARNING", "PROMO", "MAINTENANCE"]).optional(),
});

export type GetFrontstoreAnnouncementsQuery = z.infer<typeof getFrontstoreAnnouncementsQuerySchema>;
