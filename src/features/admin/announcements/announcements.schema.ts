import { z } from "zod";

export const getAnnouncementsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  q: z.string().trim().optional(),
  type: z.enum(["INFO", "WARNING", "PROMO", "MAINTENANCE"]).optional(),
  active: z.coerce.boolean().optional(),
  sortBy: z.enum(["title", "type", "createdAt", "updatedAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export const createAnnouncementSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  link: z.string().url().optional().or(z.literal("")),
  type: z.enum(["INFO", "WARNING", "PROMO", "MAINTENANCE"]).optional().default("INFO"),
  isActive: z.boolean().optional().default(true),
  startsAt: z.string().datetime().optional().nullable(),
  endsAt: z.string().datetime().optional().nullable(),
});

export const updateAnnouncementSchema = createAnnouncementSchema.partial();

export type GetAnnouncementsQuery = z.infer<typeof getAnnouncementsQuerySchema>;
export type CreateAnnouncementRequest = z.infer<typeof createAnnouncementSchema>;
export type UpdateAnnouncementRequest = z.infer<typeof updateAnnouncementSchema>;
