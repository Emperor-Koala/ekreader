import { z } from "zod";

export function paginatedResponse<T extends z.ZodTypeAny>(schema: T) {
    return z.object({
        content: z.array(schema),
        empty: z.boolean(),
        first: z.boolean(),
        last: z.boolean(),
        number: z.number().int(),
        numberOfElements: z.number().int(),
        pageable: z.object({
            offset: z.number().int(),
            pageNumber: z.number().int(),
            pageSize: z.number().int(),
            paged: z.boolean(),
            sort: z.object({
                empty: z.boolean(),
                sorted: z.boolean(),
                unsorted: z.boolean(),
            }),
            unpaged: z.boolean(),
        }),
        size: z.number().int(),
        sort: z.object({
            empty: z.boolean(),
            sorted: z.boolean(),
            unsorted: z.boolean(),
        }),
        totalElements: z.number().int(),
        totalPages: z.number().int(),
    });
}