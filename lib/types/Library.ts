import { z } from "zod";

export const Library = z.object({
    id: z.string(),
    name: z.string(),
    root: z.string(),
});