import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const contentCreateSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  slug: z
    .string()
    .min(1)
    .max(500)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens"),
  description: z.string().max(500).optional(),
  longDescription: z.string().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "published"]),
  featured: z.boolean().default(false),
  thumbnailUrl: z.string().url().optional().nullable(),
  sortOrder: z.number().int().default(0),
  metadata: z.record(z.unknown()).optional(),
  imageUrls: z.array(z.object({
    url: z.string().min(1),
    alt: z.string().min(1),
    sortOrder: z.number().int().default(0),
  })).optional(),
});

export const contentUpdateSchema = contentCreateSchema.partial();

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const settingUpdateSchema = z.object({
  key: z.string().min(1),
  value: z.string(),
});
