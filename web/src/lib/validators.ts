import { z } from "zod";

const email = z.string().trim().email("Please enter a valid email address.");
const password = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be at most 128 characters.");

export const registerSchema = z.object({
  fullName: z.string().trim().min(3, "Full name must be at least 3 characters.").max(120),
  email,
  password,
  departmentId: z.string().min(1, "Please select a department."),
  motivation: z.string().trim().min(10, "Please tell us why you want to join (at least 10 characters).").max(2000),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required."),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(120),
  email,
  subject: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters.").max(5000),
});

export const projectSchema = z.object({
  name: z.string().trim().min(2).max(120),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and dashes."),
  tag: z.string().trim().min(2).max(60),
  problem: z.string().trim().min(5).max(3000),
  solution: z.string().trim().min(5).max(3000),
  impact: z.string().trim().min(5).max(3000),
  image: z.string().trim().url("Must be a valid URL or /images/... path.").optional().nullable().or(z.literal("")),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  order: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(true),
  departmentId: z.string().trim().optional().nullable(),
});

export const departmentSchema = z.object({
  name: z.string().trim().min(2).max(80),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(80)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and dashes."),
  description: z.string().trim().max(1000).optional().nullable(),
  icon: z.string().trim().max(60).optional().nullable(),
});

export const eventSchema = z.object({
  title: z.string().trim().min(2).max(150),
  description: z.string().trim().max(2000).optional().nullable(),
  date: z.string().min(1, "Event date is required."),
  location: z.string().trim().max(200).optional().nullable(),
  published: z.coerce.boolean().default(true),
});

export const teamMemberSchema = z.object({
  name: z.string().trim().min(2).max(120),
  role: z.string().trim().min(2).max(120),
  image: z.string().trim().url().optional().nullable().or(z.literal("")),
  facebook: z.string().trim().url().optional().nullable().or(z.literal("")),
  instagram: z.string().trim().url().optional().nullable().or(z.literal("")),
  email: z.string().trim().email().optional().nullable().or(z.literal("")),
  isLeadership: z.coerce.boolean().default(false),
  order: z.coerce.number().int().min(0).default(0),
  published: z.coerce.boolean().default(true),
});

export const newsSchema = z.object({
  title: z.string().trim().min(2).max(200),
  description: z.string().trim().min(3).max(3000),
  published: z.coerce.boolean().default(true),
});

export const missionSchema = z.object({
  userId: z.string().min(1, "Please select a member."),
  text: z.string().trim().min(3).max(2000),
  points: z.coerce.number().int().min(1).max(500).default(50),
});

export const missionWorkSchema = z.object({
  workLink: z.string().trim().url("Please paste a valid URL starting with https://"),
});

export const missionReviewSchema = z.object({
  status: z.enum(["APPROVED", "LIVE"], {
    errorMap: () => ({ message: "Invalid review status." }),
  }),
});

export const statusUpdateSchema = z.object({
  userId: z.string().min(1, "userId is required."),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"]).optional(),
  role: z.enum(["ADMIN", "MEMBER"]).optional(),
  points: z.coerce.number().int().min(0).max(100000).optional(),
  departmentId: z.string().optional().nullable(),
});

export const forgotPasswordSchema = z.object({
  email,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required.").max(512),
  password,
});

export const adminSetPasswordSchema = z.object({
  newPassword: password,
});

export const settingsSchema = z.object({
  siteName: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().max(40).optional(),
  address: z.string().trim().max(300).optional(),
  facebook: z.string().trim().url().optional(),
  instagram: z.string().trim().url().optional(),
  tiktok: z.string().trim().url().optional(),
  youtube: z.string().trim().url().optional(),
});

export const profileUpdateSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  profilePic: z
    .string()
    .trim()
    .max(1000)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  phone: z
    .string()
    .trim()
    .max(40)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
  bio: z
    .string()
    .trim()
    .max(500)
    .optional()
    .nullable()
    .transform((v) => (v ? v : null)),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;