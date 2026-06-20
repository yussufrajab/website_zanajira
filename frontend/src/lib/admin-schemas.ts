// Shared zod schemas + helpers for admin mutation routes.
import { z } from "zod";

export const newsSchema = z
  .object({
    status: z.enum(["draft", "published", "archived"]).default("draft"),
    titleSw: z.string().min(1, "Swahili title required"),
    titleEn: z.string().min(1, "English title required"),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, hyphens/numbers only"),
    excerptSw: z.string().optional().default(""),
    excerptEn: z.string().optional().default(""),
    bodySw: z.string().optional().default(""),
    bodyEn: z.string().optional().default(""),
    categoryId: z.number().int().positive().optional().nullable(),
    datePublished: z.string().optional().nullable(),
    featuredImage: z.string().optional().nullable(),
    pdfDocument: z.string().optional().nullable(),
  })
  .refine(
    (data) => data.status !== "published" || !!data.pdfDocument,
    {
      message: "A PDF document is required to publish",
      path: ["pdfDocument"],
    },
  );

export const vacancySchema = z
  .object({
    status: z.enum(["draft", "published", "closed"]).default("draft"),
    titleSw: z.string().min(1, "Swahili title required"),
    titleEn: z.string().min(1, "English title required"),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, hyphens/numbers only"),
    institutionSw: z.string().optional().default(""),
    institutionEn: z.string().optional().default(""),
    descriptionSw: z.string().optional().default(""),
    descriptionEn: z.string().optional().default(""),
    datePosted: z.string().optional().nullable(),
    deadlineDate: z.string().optional().nullable(),
    pdfDocument: z.string().optional().nullable(),
  })
  .refine(
    (data) => data.status !== "published" || !!data.pdfDocument,
    {
      message: "A PDF document is required to publish",
      path: ["pdfDocument"],
    },
  );

export const interviewSchema = z
  .object({
    status: z.enum(["draft", "published"]).default("draft"),
    titleSw: z.string().min(1, "Swahili title required"),
    titleEn: z.string().min(1, "English title required"),
    slug: z
      .string()
      .min(1)
      .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, hyphens/numbers only"),
    interviewType: z.enum([
      "written",
      "face_to_face",
      "practical",
      "screening",
    ]),
    institutionSw: z.string().optional().default(""),
    institutionEn: z.string().optional().default(""),
    descriptionSw: z.string().optional().default(""),
    descriptionEn: z.string().optional().default(""),
    datePosted: z.string().optional().nullable(),
    pdfDocument: z.string().optional().nullable(),
  })
  .refine(
    (data) => data.status !== "published" || !!data.pdfDocument,
    {
      message: "A PDF document is required to publish",
      path: ["pdfDocument"],
    },
  );

export type NewsInput = z.infer<typeof newsSchema>;
export type VacancyInput = z.infer<typeof vacancySchema>;
export type InterviewInput = z.infer<typeof interviewSchema>;

/** Parse a possibly-empty date string into a Date (or null). */
export function parseDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}