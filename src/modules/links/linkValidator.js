import z from "zod";

export const shortenSchmea = z.object({
  longUrl: z.url({
    message: "Invalid URL ",
  }),
});

export const querySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).optional(),
  sort: z.enum(["asc", "desc"]).default("desc"),
  search: z.string().optional(),
});
