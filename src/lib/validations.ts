// ─────────────────────────────────────────────
//  Simran Arrora – Zod Validation Schemas
//  Target: src/lib/validations.ts
// ─────────────────────────────────────────────

import { z } from 'zod'

// ── Booking ───────────────────────────────────────────────────────────────────

export const bookingSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or fewer'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .min(7, 'Phone number is too short')
    .max(20, 'Phone number is too long')
    .regex(/^[+\d\s\-().]+$/, 'Please enter a valid phone number'),
  serviceId: z.string().uuid('Invalid service selected'),
  priceOptionId: z.string().uuid('Invalid price option selected'),
  /** YYYY-MM-DD */
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
    .refine((d) => !isNaN(Date.parse(d)), 'Please enter a valid date'),
  /** HH:MM (24-hour) */
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  notes: z.string().max(1000, 'Notes must be 1000 characters or fewer').optional(),
  location: z.string().max(200, 'Location must be 200 characters or fewer').optional(),
})

export type BookingInput = z.infer<typeof bookingSchema>

// ── Contact ───────────────────────────────────────────────────────────────────

export const contactSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be 100 characters or fewer'),
  email: z.string().email('Please enter a valid email address'),
  phone: z
    .string()
    .max(20, 'Phone number is too long')
    .regex(/^[+\d\s\-().]*$/, 'Please enter a valid phone number')
    .optional(),
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(150, 'Subject must be 150 characters or fewer'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(2000, 'Message must be 2000 characters or fewer'),
})

export type ContactInput = z.infer<typeof contactSchema>

// ── Auth – Login ──────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

// ── Auth – Signup ─────────────────────────────────────────────────────────────

export const signupSchema = z
  .object({
    fullName: z
      .string()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be 100 characters or fewer'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .max(20, 'Phone number is too long')
      .regex(/^[+\d\s\-().]*$/, 'Please enter a valid phone number')
      .optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(72, 'Password must be 72 characters or fewer'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

export type SignupInput = z.infer<typeof signupSchema>

// ── Auth – Admin Login ────────────────────────────────────────────────────────

export const adminLoginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type AdminLoginInput = z.infer<typeof adminLoginSchema>

// ── Gallery Item ──────────────────────────────────────────────────────────────

export const galleryItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(150, 'Title must be 150 characters or fewer'),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
  imageUrl: z.string().url('Please enter a valid image URL'),
  category: z.string().max(80, 'Category must be 80 characters or fewer').optional(),
  altText: z.string().max(200, 'Alt text must be 200 characters or fewer').optional(),
  published: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
})

export type GalleryItemInput = z.infer<typeof galleryItemSchema>

// ── Video ─────────────────────────────────────────────────────────────────────

export const videoSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(150, 'Title must be 150 characters or fewer'),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
  thumbnailUrl: z.string().url('Please enter a valid thumbnail URL').optional(),
  videoUrl: z.string().url('Please enter a valid video URL'),
  /** e.g. 'youtube' | 'instagram' | 'custom' */
  platform: z.string().max(50).optional(),
  buttonLabel: z.string().max(60, 'Button label must be 60 characters or fewer').optional(),
  published: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
})

export type VideoInput = z.infer<typeof videoSchema>

// ── Service ───────────────────────────────────────────────────────────────────

export const serviceSchema = z.object({
  name: z
    .string()
    .min(1, 'Service name is required')
    .max(150, 'Service name must be 150 characters or fewer'),
  description: z.string().max(1000, 'Description must be 1000 characters or fewer').optional(),
  imageUrl: z.string().url('Please enter a valid image URL').optional(),
  durationMinutes: z.number().int().min(1).max(1440).optional(),
  enabled: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
})

export type ServiceInput = z.infer<typeof serviceSchema>

// ── Price Option ──────────────────────────────────────────────────────────────

export const priceOptionSchema = z.object({
  serviceId: z.string().uuid('Invalid service ID'),
  name: z
    .string()
    .min(1, 'Option name is required')
    .max(150, 'Option name must be 150 characters or fewer'),
  description: z.string().max(500, 'Description must be 500 characters or fewer').optional(),
  amount: z.number().min(0, 'Amount cannot be negative'),
  currency: z.string().length(3, 'Currency must be a 3-letter ISO code').optional(),
  enabled: z.boolean().optional(),
})

export type PriceOptionInput = z.infer<typeof priceOptionSchema>

// ── Social Link ───────────────────────────────────────────────────────────────

export const socialLinkSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(80, 'Name must be 80 characters or fewer'),
  url: z.string().url('Please enter a valid URL').optional(),
  icon: z.string().max(80).optional(),
  platform: z.string().max(80).optional(),
  enabled: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
})

export type SocialLinkInput = z.infer<typeof socialLinkSchema>

// ── Live Settings ─────────────────────────────────────────────────────────────

export const liveSettingsSchema = z.object({
  title: z.string().max(200, 'Title must be 200 characters or fewer').optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or fewer').optional(),
  publicUrl: z.string().url('Please enter a valid URL').optional(),
  thumbnailUrl: z.string().url('Please enter a valid thumbnail URL').optional(),
  /** ISO datetime string */
  startDatetime: z
    .string()
    .refine((v) => !v || !isNaN(Date.parse(v)), 'Invalid start datetime')
    .optional(),
  /** ISO datetime string */
  endDatetime: z
    .string()
    .refine((v) => !v || !isNaN(Date.parse(v)), 'Invalid end datetime')
    .optional(),
  enabled: z.boolean().optional(),
})

export type LiveSettingsInput = z.infer<typeof liveSettingsSchema>

// ── Contact Message (admin form — mirrors contactSchema) ──────────────────────

export const contactMessageSchema = contactSchema

export type ContactMessageInput = z.infer<typeof contactMessageSchema>
