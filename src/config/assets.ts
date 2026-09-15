// ─────────────────────────────────────────────
//  Simran Arrora – Centralized Asset Paths
//  Target: src/config/assets.ts
// ─────────────────────────────────────────────

/**
 * Single source of truth for all static asset paths.
 * Swap the placeholder strings here and every component automatically updates.
 *
 * Convention:
 *   – Local paths  → served from /public
 *   – Placeholder  → picsum.photos URLs until real assets are uploaded
 */
export const ASSETS = {
  images: {
    /** Main hero image – falls back to gradient if file is missing. */
    hero: '/assets/images/hero.jpg',
    /** About section portrait. */
    about: '/assets/images/about.jpg',
    /** Feature card: Gallery. */
    featureGallery: '/assets/images/feature-gallery.jpg',
    /** Feature card: Videos. */
    featureVideos: '/assets/images/feature-videos.jpg',
    /** Feature card: Join. */
    featureJoin: '/assets/images/feature-join.jpg',
    /** Feature card: Connect. */
    featureConnect: '/assets/images/feature-connect.jpg',
    /** Feature card: Premium. */
    featurePremium: '/assets/images/feature-premium.jpg',
  },
  logos: {
    /** Primary wordmark / logo. */
    main: '/assets/logos/simran-logo.png',
    /** Browser favicon. */
    favicon: '/assets/logos/favicon.ico',
  },
  /**
   * Placeholder helpers — used during development until real assets exist.
   * Each function accepts a numeric seed so images are deterministic.
   */
  placeholder: {
    /** 800×600 gallery image by seed. */
    gallery: (seed: number) => `https://picsum.photos/seed/${seed}/800/600`,
    /** 400×300 thumbnail image by seed. */
    thumbnail: (seed: number) => `https://picsum.photos/seed/${seed}/400/300`,
    /** Full-width hero placeholder (1920×1080). */
    hero: 'https://picsum.photos/seed/simran-hero/1920/1080',
    /** Portrait about-section placeholder (800×1000). */
    about: 'https://picsum.photos/seed/simran-about/800/1000',
  },
} as const
