import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().min(10, 'Phone number is required').regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerProfileSchema = z.object({
  uid: z.string().min(1, 'UID is required'),
  name: z.string().min(1, 'Name is required'),
  surname: z.string().min(1, 'Surname is required'),
  phone: z
    .string({
      required_error: 'Phone number is required',
      invalid_type_error: 'Phone number must be a string',
    })
    .min(10, 'Phone number must be at least 10 characters')
    .refine(
      (val) => {
        if (!val || typeof val !== 'string') return false;

        const cleaned = val.replace(/[\s\-\(\)]/g, '');

        return (
          /^\+?90[1-9]\d{9}$/.test(cleaned) ||
          /^0[1-9]\d{9}$/.test(cleaned) ||
          /^\+?[1-9]\d{1,14}$/.test(cleaned)
        );
      },
      {
        message: 'Invalid phone number format. Use: +905551234567, 905551234567, 05551234567, or international format',
      }
    ),
  email: z.string().email('Invalid email format'),
});

export type RegisterProfileInput = z.infer<typeof registerProfileSchema>;
