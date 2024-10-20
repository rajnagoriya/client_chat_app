import { z } from 'zod';

// Create Group schema
export const createGroupSchema = z.object({
  name: z.string().min(3, { message: "Group name is required" }).trim(),
  adminId: z.string({ message: "Admin ID is required" }),
  about: z.string().max(50, { message: "About section must be less than 50 characters" }).trim().optional(),
  avatar: z.string().optional(),
  members: z.array(z.string)
  .min(2, { message: "At least 2 members are required to create a group" })
});


// export const createGroupSchema = z.object({
//     name: z.string().min(3, { message: "Group name is required" }).trim(),
//     adminId: z.string({ message: "Admin ID is required" }).trim(),
//     about: z.string().optional().max(50, { message: "About section must be less than 50 characters" }).trim(),
//     avatar: z.string().optional(),
//     .optional(),
//   });
  