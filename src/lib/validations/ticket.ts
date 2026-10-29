import { z } from "zod";
import { TICKET_PRIORITIES, TICKET_STATUSES } from "@/lib/constants";

export const objectId = z.string().regex(/^[0-9a-f]{24}$/i, "Invalid id");

export const TICKET_VIEWS = ["inbox", "mine", "unassigned", "urgent", "resolved", "all"] as const;

// Only https or our own /uploads/ paths. This blocks javascript: URLs from ever being stored.
const attachmentSchema = z.object({
  name: z.string().trim().min(1).max(200),
  url: z
    .string()
    .max(2000)
    .refine((u) => u.startsWith("https://") || u.startsWith("/uploads/"), "Attachment URL must be https or /uploads/"),
  size: z.number().int().nonnegative().max(25 * 1024 * 1024),
  mimeType: z.string().max(100),
});

export const listQuerySchema = z.object({
  view: z.enum(TICKET_VIEWS).default("inbox"),
  q: z.string().trim().max(100).optional(),
  status: z.enum(TICKET_STATUSES).optional(),
  priority: z.enum(TICKET_PRIORITIES).optional(),
  category: z.string().trim().max(60).optional(), // category slug
  sort: z.enum(["activity", "newest", "oldest"]).default("activity"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});
export type ListQuery = z.infer<typeof listQuerySchema>;

export const createTicketSchema = z.object({
  subject: z.string().trim().min(3, "Subject must be at least 3 characters").max(200),
  body: z.string().trim().min(1, "Describe the issue").max(10000),
  priority: z.enum(TICKET_PRIORITIES).default("low"), // ignored for customers
  categoryId: objectId.nullish(),
  assigneeId: objectId.nullish(), // ignored for customers
  requester: z // required for staff, ignored for customers
    .object({
      email: z.string().trim().email(),
      name: z.string().trim().min(1).max(100).optional(),
    })
    .optional(),
  attachments: z.array(attachmentSchema).max(10).default([]),
});
export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export const updateTicketSchema = z
  .object({
    subject: z.string().trim().min(3).max(200).optional(),
    status: z.enum(TICKET_STATUSES).optional(),
    priority: z.enum(TICKET_PRIORITIES).optional(),
    assigneeId: objectId.nullable().optional(), // null = unassign
    categoryId: objectId.nullable().optional(), // null = clear
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });
export type UpdateTicketInput = z.infer<typeof updateTicketSchema>;

export const createMessageSchema = z.object({
  body: z.string().trim().min(1, "Write a reply").max(10000),
  isInternal: z.boolean().default(false), // ignored for customers
  attachments: z.array(attachmentSchema).max(10).default([]),
});
export type CreateMessageInput = z.infer<typeof createMessageSchema>;