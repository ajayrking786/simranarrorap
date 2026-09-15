import React from 'react'

export const metadata = {
  title: 'Cancellation & Refund Policy | Simran Arrora ♡',
  description: 'Policy regarding cancellation, rescheduling, and refund requests for appointments.',
}

export default function CancellationRefundPage() {
  return (
    <div className="pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-10 text-gray-300">
      <div className="space-y-3 text-center sm:text-left border-b border-white/10 pb-6">
        <span className="text-xs uppercase tracking-[0.3em] text-[#e91e8c] font-semibold">
          Financial Transparency
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-white">
          Cancellation &amp; Refund Policy
        </h1>
        <p className="text-xs text-gray-500">Effective Date: September 2026</p>
      </div>

      <div className="prose prose-invert max-w-none space-y-6 text-sm leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            1. Booking Rejection by Management
          </h2>
          <p>
            If a submitted booking request is declined or rejected by administration due to schedule unavailability, full payment received will be refunded automatically to the original payment source within 5 to 7 business days.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            2. Client Cancellation &amp; Rescheduling
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>More than 72 hours notice:</strong> Clients may reschedule to any open date at no extra fee, or request a full refund less standard gateway transaction fees (typically 2-3%).
            </li>
            <li>
              <strong>Between 24 and 72 hours notice:</strong> Free rescheduling is permitted. Cancellations within this window are subject to a 30% reservation retainer to account for blocked dates.
            </li>
            <li>
              <strong>Less than 24 hours notice or No-Show:</strong> Appointments cancelled with under 24 hours notice or missed entirely without notice are non-refundable, as studio time and crew preparations are finalized.
            </li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            3. Non-Refundable Situations
          </h2>
          <p>
            Consultation sessions or completed photo/video campaigns that have already taken place and delivered agreed media assets are non-refundable. Furthermore, any booking attempting to violate our permissible service terms will be immediately cancelled without refund.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white uppercase tracking-wider text-[#ff2d9c]">
            4. Refund Request Process
          </h2>
          <p>
            To initiate a cancellation or refund inquiry, submit an email with your <strong className="text-white">Booking ID</strong> and payment receipt to <strong className="text-white">refunds@simranarrora.com</strong> or use the Contact form. Approved refunds are credited directly back to the original source bank account or UPI ID.
          </p>
        </section>
      </div>
    </div>
  )
}
