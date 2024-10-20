import { z } from 'zod';

// Registration schema
export const registerSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters" }).trim(),
  email: z.string().email({ message: "Invalid email" }).trim(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).trim(),
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email" }).trim(),
  password: z.string().min(1, { message: "Password is required" }).trim(),
});

export const updateProfileSchema = z.object({
    username: z.string().min(3, { message: "Username must be at least 3 characters" }).trim().optional(),
    about: z.string().max(50, { message: "About section must be less than 50 characters" }).trim().optional(),
    profilePicture: z.string().optional(),
  });
