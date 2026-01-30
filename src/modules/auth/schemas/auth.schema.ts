import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const confirmSchema = z.object({
  email: z.string().email('Invalid email format'),
  code: z.string().min(1, 'Confirmation code is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterDTO = z.infer<typeof registerSchema>;
export type ConfirmDTO = z.infer<typeof confirmSchema>;
export type LoginDTO = z.infer<typeof loginSchema>;
