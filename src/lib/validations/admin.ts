import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(40, "Name is too long"),
  description: z
    .string()
    .trim()
    .max(200, "Keep the description under 200 characters")
    .default(""),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const inviteSchema = z.object({
  name: z.string().trim().min(2, "Enter a name").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  role: z.enum(["admin", "agent"]),
});
export type InviteInput = z.infer<typeof inviteSchema>;

export const memberPatchSchema = z
  .object({
    role: z.enum(["admin", "agent"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((v) => Object.keys(v).length > 0, { message: "Nothing to update" });
export type MemberPatch = z.infer<typeof memberPatchSchema>;

export const settingsSchema = z.object({
  firstResponseTargetMinutes: z
    .number()
    .int()
    .min(5, "Minimum is 5 minutes")
    .max(7 * 24 * 60, "Maximum is 7 days"),
});
