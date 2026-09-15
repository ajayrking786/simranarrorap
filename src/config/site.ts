// ─────────────────────────────────────────────
//  Simran Arrora – Site-wide Configuration
//  Target: src/config/site.ts
// ─────────────────────────────────────────────

import type { BookingStatus } from '@/types'

// ── Navigation ────────────────────────────────────────────────────────────────

export interface NavLink {
  label: string
  href: string
}

// ── Social Platform ───────────────────────────────────────────────────────────

export interface SocialPlatformConfig {
  name: string
  platform: string
  /** Lucide icon name (string) */
  icon: string
}

// ── Site Config ───────────────────────────────────────────────────────────────

export const SITE_CONFIG = {
  /** Page <title> prefix */
  name: 'Simran Arrora',
  /** Brand name with decorative character */
  brand: 'Simran Arrora ♡',
  /** Short tagline displayed under hero heading */
  tagline: 'Creator • Collaborator • Professional',
  /** Meta description */
  description:
    'Official website of Simran Arrora — creator, collaborator, and professional.',

  // ── Navigation links ─────────────────────────────────────────────────────

  nav: [
    { label: 'Home', href: '/' },
    { label: 'About Me', href: '/about' },
    { label: 'Gallery', href: '/gallery' },
    { label: 'Videos', href: '/videos' },
    { label: 'Join', href: '/join' },
    { label: 'Contact', href: '/contact' },
  ] satisfies NavLink[],

  // ── Social platforms (populated from DB; these are the config defaults) ───

  social: [
    { name: 'Instagram', platform: 'instagram', icon: 'Instagram' },
    { name: 'X', platform: 'twitter', icon: 'Twitter' },
    { name: 'Telegram', platform: 'telegram', icon: 'Send' },
    { name: 'Reddit', platform: 'reddit', icon: 'MessageCircle' },
    { name: 'YouTube', platform: 'youtube', icon: 'Youtube' },
    { name: 'Bluesky', platform: 'bluesky', icon: 'Cloud' },
  ] satisfies SocialPlatformConfig[],

  // ── Service names (used as labels in forms and admin UI) ─────────────────

  services: [
    'Brand Collaboration',
    'Content Creation',
    'Photography Session',
    'Creator Consultation',
    'Online Professional Session',
    'Event Appearance',
    'Community/Event Access',
  ] as const,

  // ── Human-readable booking status messages ────────────────────────────────

  bookingStatusMessages: {
    PENDING: 'Your booking request is waiting for approval.',
    APPROVED: 'Your appointment has been confirmed.',
    REJECTED:
      'Your selected date and time is not available. Please try another available date or time.',
    RESCHEDULED: 'Your appointment has been rescheduled.',
    CANCELLED: 'Your appointment has been cancelled.',
    COMPLETED: 'Your appointment has been completed.',
  } satisfies Record<BookingStatus, string>,
} as const
