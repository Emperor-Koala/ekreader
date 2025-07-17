import { DateTime } from "luxon";
import { z } from "zod";

export const Series = z.object({
    booksCount: z.number().int(),
    booksInProgressCount: z.number().int(),
    booksMetadata: z.object({
        authors: z.array(
            z.object({
                name: z.string(),
                role: z.string(),
            }),
        ),
        created: z.string().datetime().transform((val) => DateTime.fromISO(val)),
        lastModified: z.string().datetime().transform((val) => DateTime.fromISO(val)),
        releaseDate: z.string().date().transform((val) => DateTime.fromISO(val)),
        summary: z.string(),
        summaryNumber: z.string(),
        tags: z.array(z.string()),
    }),
    booksReadCount: z.number().int(),
    booksUnreadCount: z.number().int(),
    created: z.string().datetime().transform((val) => DateTime.fromISO(val)),
    deleted: z.boolean(),
    fileLastModified: z.string().datetime().transform((val) => DateTime.fromISO(val)),
    id: z.string(),
    lastModified: z.string().datetime().transform((val) => DateTime.fromISO(val)),
    libraryId: z.string(),
    metadata: z.object({
        ageRating: z.nullable(z.number().int()),
        alternateTitles: z.array(
            z.object({
                label: z.string(),
                title: z.string(),
            }),
        ),
        created: z.string().datetime().transform((val) => DateTime.fromISO(val)),
        genres: z.array(z.string()),
        language: z.string(),
        lastModified: z.string().datetime().transform((val) => DateTime.fromISO(val)),
        links: z.array(
            z.object({
                label: z.string(),
                url: z.string().url(),
            }),
        ),
        publisher: z.string(),
        readingDirection: z.string(),
        sharingLabels: z.array(z.string()),
        status: z.string(),
        summary: z.string(),
        tags: z.array(z.string()),
        title: z.string(),
        titleSort: z.string(),
        totalBookCount: z.nullable(z.number().int()),
    }),
    name: z.string(),
    oneshot: z.boolean(),
    url: z.string(),
});