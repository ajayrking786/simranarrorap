// ─────────────────────────────────────────────
//  Simran Arrora – Utility Helpers
//  Target: src/lib/utils.ts
// ─────────────────────────────────────────────

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// ── Tailwind class merging ────────────────────────────────────────────────────

/**
 * Merge Tailwind CSS classes with clsx + tailwind-merge.
 * Resolves class conflicts correctly (e.g. p-2 + p-4 → p-4).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ── Date / Time Formatting ────────────────────────────────────────────────────

/**
 * Format an ISO date string or Date to a human-readable date.
 * e.g. "15 September 2026"
 */
export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

/**
 * Format an ISO datetime string or Date to a full date-time string.
 * e.g. "15 September 2026, 2:30 PM"
 */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

/**
 * Format a time string (HH:MM) or Date to a human-readable time.
 * e.g. "2:30 PM"
 */
export function formatTime(value: string | Date): string {
  if (typeof value === 'string' && /^\d{2}:\d{2}$/.test(value)) {
    // Plain HH:MM — parse as today's time
    const [hours, minutes] = value.split(':').map(Number)
    const d = new Date()
    d.setHours(hours, minutes, 0, 0)
    return d.toLocaleTimeString('en-IN', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  }
  const date = typeof value === 'string' ? new Date(value) : value
  return date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// ── Currency Formatting ───────────────────────────────────────────────────────

/**
 * Format a numeric amount as a currency string.
 * Defaults to INR / Indian locale.
 * e.g. formatCurrency(1500) → "₹1,500.00"
 */
export function formatCurrency(
  amount: number,
  currency: string = 'INR',
  locale: string = 'en-IN',
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

// ── Booking Reference ─────────────────────────────────────────────────────────

/**
 * Generate a short, URL-safe booking reference code.
 * Format: SA-YYYYMMDD-XXXX  (X = random uppercase alphanumeric)
 */
export function generateBookingRef(): string {
  const today = new Date()
  const yyyymmdd = today.toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).toUpperCase().slice(2, 6).padEnd(4, '0')
  return `SA-${yyyymmdd}-${rand}`
}

// ── String Helpers ────────────────────────────────────────────────────────────

/**
 * Truncate a string to `maxLength` characters, appending `suffix` if needed.
 */
export function truncate(str: string, maxLength: number, suffix: string = '…'): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Convert a string to a URL-safe slug.
 * e.g. "Hello World!" → "hello-world"
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ── Validation Helpers ────────────────────────────────────────────────────────

/**
 * Returns true if the string is a syntactically valid e-mail address.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

/**
 * Returns true if the string looks like a valid phone number.
 * Accepts optional leading +, country code, spaces, dashes, and parentheses.
 * Minimum 7 digits, maximum 15 digits (E.164 spec).
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 7 && digits.length <= 15
}

// ── Error Handling ────────────────────────────────────────────────────────────

/**
 * Safely extract a human-readable error message from any thrown value.
 * Never leaks stack traces.
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error
  if (error instanceof Error) return error.message
  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  ) {
    return (error as Record<string, unknown>).message as string
  }
  return 'An unexpected error occurred.'
}
