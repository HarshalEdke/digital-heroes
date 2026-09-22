import { z } from "zod";

/** Display name shown in the app header and around the app. */
export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Enter your full name")
    .max(80, "Name is too long"),
});
export type ProfileValues = z.infer<typeof profileSchema>;

/** Sign-in email address for the account. */
export const emailSchema = z.object({
  email: z.email("Enter a valid email address"),
});
export type EmailValues = z.infer<typeof emailSchema>;
