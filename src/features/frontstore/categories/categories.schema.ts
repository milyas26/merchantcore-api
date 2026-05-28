import { z } from "zod";

export const getCategoriesQuerySchema = z.object({
  includeEmpty: z.coerce.boolean().optional().default(false),
});

export type GetCategoriesQuery = z.infer<typeof getCategoriesQuerySchema>;
