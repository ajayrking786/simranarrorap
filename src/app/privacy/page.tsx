import React from 'react'

export const metadata = {
  title: 'Privacy Policy | Simran Arrora ♡',
  description: 'Privacy policy and data protection practices for Simran Arrora website visitors and clients.',
}

export default function PrivacyPage() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10 text-gray-300">
      <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-6">
        <span className="text-xs uppercase tracking-[0.3em] text-[#e91e8c] font-semibold">
          Data Protection
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-gray-500">Effective Date: September 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            1. Information We Collect
          </h2>
          <p>
            We collect personal information that you provide voluntarily when booking services or submitting a contact form. This includes your name, email address, telephone number, optional physical location for on-site services, and appointment notes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            2. How We Use Your Data
          </h2>
          <p>
            Your information is used strictly to process appointment reservations, communicate session details, verify payments through secure payment gateways, and respond to commercial inquiries. We do not sell, rent, or lease your personal data to third parties.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            3. Security &amp; Database Protection
          </h2>
          <p>
            All client and booking data is stored securely using industry-grade PostgreSQL encryption and Row-Level Security (RLS) via Supabase. Payment processing details are managed through PCI-DSS compliant providers (Razorpay); payment credentials such as card numbers and CVVs never touch our server infrastructure.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            4. Your Rights
          </h2>
          <p>
            You have the right to request access to the personal data we hold about you, request corrections, or ask for account and communication records to be removed. Contact us at <strong className="text-white">privacy@simranarrora.com</strong> to exercise these rights.
          </p>
        </section>
      </div>
    </div>
  )
}
