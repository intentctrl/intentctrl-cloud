import z from "zod";

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    status: z.number(),
    success: z.boolean(),
    data: dataSchema,
    message: z.string(),
  });

export type ApiResponse<T = unknown> = {
  status: number;
  success: boolean;
  data: T;
  message: string;
};

export const SortItemSchema = z.object({
  id: z.string(),
  desc: z.boolean(),
});

export type SortItem = z.infer<typeof SortItemSchema>;

const ParsedSortingSchema = z.array(SortItemSchema);

export const SortingParamSchema = z
  .string()
  .default("[]")
  .transform((str) => {
    try {
      return ParsedSortingSchema.parse(JSON.parse(str));
    } catch {
      return [] as SortItem[];
    }
  });

export const FilterItemSchema = z.object({
  id: z.string(),
  value: z.unknown(),
});

export type FilterItem = z.infer<typeof FilterItemSchema>;

const ParsedColumnFiltersSchema = z.array(FilterItemSchema);

export const ColumnFiltersParamSchema = z
  .string()
  .default("[]")
  .transform((str) => {
    try {
      return ParsedColumnFiltersSchema.parse(JSON.parse(str));
    } catch {
      return [] as FilterItem[];
    }
  });

export const PaginationQuerySchema = z.object({
  pageIndex: z.coerce.number().int().min(0).default(0),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sorting: SortingParamSchema,
  columnFilters: ColumnFiltersParamSchema,
});

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>;

export function createPaginatedResponseSchema<T extends z.ZodTypeAny>(itemSchema: T) {
  return z.object({
    items: z.array(itemSchema),
    rowCount: z.number().int().nonnegative(),
    pageCount: z.number().int().nonnegative(),
    pageIndex: z.number().int().min(0),
    pageSize: z.number().int().min(1),
  });
}
