import { z } from 'zod';

const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;

export const signInSchema = z.object({
    email: z
        .string()
        .trim()
        .min(1, 'Email is required')
        .email('Enter a valid email address'),
    password: z.string().min(1, 'Password is required'),
    rememberMe: z.boolean().optional()
});

export const signUpSchema = z
    .object({
        fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
        email: z
            .string()
            .trim()
            .min(1, 'Email is required')
            .email('Enter a valid email address'),
        phone: z
            .string()
            .trim()
            .min(1, 'Phone number is required')
            .regex(phoneRegex, 'Enter a valid phone number'),
        password: z.string().min(8, 'Password must be at least 8 characters'),
        confirmPassword: z.string().min(1, 'Confirm your password')
    })
    .refine((data) => data.password === data.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match'
    });
