import React from 'react'
import BookingWizard from '@/components/BookingWizard'
import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Service, PriceOption } from '@/types'

export const revalidate = 0 // always fresh booking options

export const metadata = {
  title: 'Book an Appointment | Simran Arrora ♡',
  description: 'Select your preferred service, date, and time to reserve a session with Simran Arrora.',
}

// Fallback initial services if none in database yet
const initialDemoServices: (Service & { price_options: PriceOption[] })[] = [
  {
    id: 'svc-1',
    name: 'Brand Collaboration',
    description: 'Commercial campaigns, sponsored digital reels, lookbook shoots, and brand promotion.',
    image_url: null,
    duration_minutes: 180,
    enabled: true,
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price_options: [
      {
        id: 'opt-1-single',
        service_id: 'svc-1',
        name: 'Single Campaign Shoot',
        description: 'Half-day studio session with dedicated styling and 3 edited reels.',
        amount: 25000,
        currency: 'INR',
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'opt-1-multi',
        service_id: 'svc-1',
        name: 'Full Campaign Package',
        description: 'Full-day multi-look campaign with photo + video deliverables.',
        amount: 45000,
        currency: 'INR',
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'svc-2',
    name: 'Creator Consultation',
    description: '1-on-1 virtual strategy session covering personal branding, styling, and visual aesthetics.',
    image_url: null,
    duration_minutes: 60,
    enabled: true,
    display_order: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price_options: [
      {
        id: 'opt-2-standard',
        service_id: 'svc-2',
        name: '60-Minute Deep Dive',
        description: 'Comprehensive 1-on-1 session with portfolio review and action plan.',
        amount: 5000,
        currency: 'INR',
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'svc-3',
    name: 'Photography Session',
    description: 'Professional high-concept portraiture and editorial styling session in studio.',
    image_url: null,
    duration_minutes: 120,
    enabled: true,
    display_order: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price_options: [
      {
        id: 'opt-3-portrait',
        service_id: 'svc-3',
        name: 'Editorial Portrait Session',
        description: '2 hour session, 2 styled outfits, 10 retouched master images.',
        amount: 15000,
        currency: 'INR',
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
  {
    id: 'svc-4',
    name: 'Event Appearance',
    description: 'Verified creator guest appearance at curated brand launches and fashion showcases.',
    image_url: null,
    duration_minutes: 240,
    enabled: true,
    display_order: 4,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    price_options: [
      {
        id: 'opt-4-halfday',
        service_id: 'svc-4',
        name: 'VIP Showcase Appearance',
        description: 'Event presence, red carpet media walk, and social coverage story.',
        amount: 35000,
        currency: 'INR',
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
  },
]

async function getServices() {
  try {
    const { data: services, error } = await supabaseAdmin
      .from('services')
      .select('*, price_options(*)')
      .eq('enabled', true)
      .order('display_order', { ascending: true })

    if (error || !services || services.length === 0) {
      return initialDemoServices
    }

    return services as (Service & { price_options: PriceOption[] })[]
  } catch {
    return initialDemoServices
  }
}

export default async function BookingPage() {
  const services = await getServices()
  const razorpayKeyId = process.env.RAZORPAY_KEY_ID || ''

  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="text-xs uppercase tracking-[0.3em] text-[#e91e8c] font-semibold">
          Reservation &amp; Scheduling
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
          Book an Appointment <span className="text-[#e91e8c]">♡</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
          Reserve your preferred creator service, session date, and time. Pricing is resolved securely on our backend, followed by immediate admin review.
        </p>
      </div>

      <BookingWizard services={services} razorpayKeyId={razorpayKeyId} />
    </div>
  )
}
