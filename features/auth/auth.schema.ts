import { z } from "zod";

export const createSessionSchema = z.object({
  idToken: z
    .string()
    .trim()
    .min(1, "ID token wajib tersedia.")
    .max(5000, "ID token tidak valid."),
});
