import React from 'react'

export const metadata = {
  title: 'Shipping & Delivery Policy | Simran Arrora ♡',
  description: 'Shipping and delivery policy regarding digital services and professional bookings.',
}

export default function ShippingPage() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10 text-gray-300">
      <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-6">
        <span className="text-xs uppercase tracking-[0.3em] text-[#e91e8c] font-semibold">
          Fulfillment
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Shipping &amp; Delivery Policy
        </h1>
        <p className="text-xs text-gray-500">Effective Date: September 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            1. Digital &amp; Professional Services Only
          </h2>
          <p>
            Simran Arrora does not sell physical merchandise or tangible goods through this website. All offerings listed—including Brand Collaborations, Online Strategy Sessions, Creator Consultations, Photography Sessions, and Event Appearances—are intangible digital services or in-person professional sessions.
          </p>
          <p className="text-white font-medium">
            Consequently, traditional shipping, postal delivery, and physical courier fulfillment do not apply to transactions conducted on this website.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            2. Confirmation &amp; Scheduling Delivery
          </h2>
          <p>
            Upon submitting a booking request and completing payment verification, delivery of service scheduling is fulfilled electronically via email within 24–48 hours. You will receive an appointment confirmation containing the scheduled date, time, virtual conference link (for online sessions), or studio location details (for verified in-person sessions).
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            3. Digital Deliverables Delivery
          </h2>
          <p>
            For collaborative campaigns requiring visual deliverables (e.g. edited photography lookbooks, campaign reels, or promotional media), assets are delivered securely via cloud download link within the contractual timeline agreed upon in your booking confirmation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            4. Contact
          </h2>
          <p>
            If you have not received your digital confirmation or asset links within the designated timeframe, please reach out directly at <strong className="text-white">fulfillment@simranarrora.com</strong> with your Booking ID.
          </p>
        </section>
      </div>
    </div>
  )
}
