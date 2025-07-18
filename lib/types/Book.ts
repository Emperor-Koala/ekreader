import { DateTime } from 'luxon';
import { z } from 'zod';

export const Book = z.object({
  created: z.string().datetime({ offset: true }).transform((val) => DateTime.fromISO(val)),
  deleted: z.boolean(),
  fileHash: z.string(),
  fileLastModified: z.string().datetime({ offset: true }).transform((val) => DateTime.fromISO(val)),
  id: z.string(),
  lastModified: z.string().datetime({ offset: true }).transform((val) => DateTime.fromISO(val)),
  libraryId: z.string(),
  media: z.object({
    comment: z.string(),
    epubDivinaCompatible: z.boolean(),
    epubIsKepub: z.boolean(),
    mediaProfile: z.string(),
    mediaType: z.string(),
    pagesCount: z.number().int(),
    status: z.string(),
  }),
  metadata: z.object({
    authors: z.array(
      z.object({
        name: z.string(),
        role: z.string(),
      }),
    ),
    created: z.string().datetime({ offset: true }).transform((val) => DateTime.fromISO(val)),
    isbn: z.string(),
    lastModified: z.string().datetime({ offset: true }).transform((val) => DateTime.fromISO(val)),
    links: z.array(
      z.object({
        label: z.string(),
        url: z.string().url(),
      }),
    ),
    number: z.string(),
    numberSort: z.number().int(),
    releaseDate: z.union([ z.string().date(), z.string().datetime({ offset: true }) ]).nullable().transform((val) => val ? DateTime.fromISO(val) : null),
    summary: z.string(),
    tags: z.array(z.string()),
    title: z.string(),
  }),
  name: z.string(),
  number: z.number().int(),
  oneshot: z.boolean(),
  readProgress: z.object({
    completed: z.boolean(),
    created: z.string().datetime({ offset: true }).transform((val) => DateTime.fromISO(val)),
    deviceId: z.string(),
    deviceName: z.string(),
    lastModified: z.string().datetime({ offset: true }).transform((val) => DateTime.fromISO(val)),
    page: z.number().int(),
    readDate: z.string().datetime({ offset: true }).transform((val) => DateTime.fromISO(val)),
  }).nullable(),
  seriesId: z.string(),
  seriesTitle: z.string(),
  size: z.string(),
  sizeBytes: z.number().int(),
  url: z.string(),
});
