import React from 'react'

export const metadata = {
  title: 'Terms of Service | Simran Arrora ♡',
  description: 'Terms and conditions for utilizing services, content, and bookings on Simran Arrora platform.',
}

export default function TermsPage() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10 text-gray-300">
      <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-6">
        <span className="text-xs uppercase tracking-[0.3em] text-[#e91e8c] font-semibold">
          Legal Agreement
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Terms &amp; Conditions
        </h1>
        <p className="text-xs text-gray-500">Effective Date: September 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using the platform at simranarrora.com, booking any creative service, or communicating with Simran Arrora and her management, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, please refrain from using this website or requesting appointments.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            2. Permitted Services &amp; Lawful Scope
          </h2>
          <p>
            All services offered through this platform (including Brand Collaborations, Creative Content Creation, Studio Photography Sessions, Creator Consultations, Online Professional Sessions, Event Appearances, and Community Access) are strictly legitimate, artistic, and professional business engagements.
          </p>
          <p>
            Any solicitation, suggestion, or request regarding escort, prostitution, sexual services, or illegal transactions is strictly prohibited, will result in immediate rejection/blacklisting without refund, and may be reported to relevant law enforcement authorities.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            3. Booking &amp; Review Workflow
          </h2>
          <p>
            Submitting a booking request does not constitute a guaranteed appointment until reviewed and approved by management. All prices are calculated and validated server-side. In the event an appointment cannot be fulfilled due to scheduling conflict, management reserves the right to decline or reschedule.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            4. Intellectual Property &amp; Media Rights
          </h2>
          <p>
            All photographs, videos, design elements, texts, and trademarks displayed on this site are the exclusive intellectual property of Simran Arrora unless otherwise stated. Commercial re-distribution, unauthorized scraping, or commercial publication of images without prior written license is strictly forbidden.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            5. Governing Law
          </h2>
          <p>
            These terms are governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in New Delhi, India.
          </p>
        </section>
      </div>
    </div>
  )
}
