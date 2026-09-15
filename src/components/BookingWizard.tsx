'use client'

import React, { useState } from 'react'
import { 
  Calendar as CalendarIcon, Clock, CheckCircle2, 
  ArrowRight, ArrowLeft, ShieldCheck, CreditCard, AlertCircle, Sparkles 
} from 'lucide-react'
import type { Service, PriceOption } from '@/types'

interface BookingWizardProps {
  services: (Service & { price_options?: PriceOption[] })[]
  razorpayKeyId?: string
}

export default function BookingWizard({ services, razorpayKeyId }: BookingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)
  
  // Selection state
  const [selectedService, setSelectedService] = useState<Service | null>(
    services.length > 0 ? services[0] : null
  )
  const [selectedPriceOption, setSelectedPriceOption] = useState<PriceOption | null>(
    services.length > 0 && services[0].price_options?.length 
      ? services[0].price_options[0] 
      : null
  )

  // Date & Time
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('14:00')

  // Customer info
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
    location: '',
  })

  // Submission & Result state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [confirmedBooking, setConfirmedBooking] = useState<{
    booking_id: string
    booking_status: string
    payment_status: string
  } | null>(null)

  // Handle service selection change
  const handleSelectService = (svc: Service) => {
    setSelectedService(svc)
    if (svc.price_options && svc.price_options.length > 0) {
      setSelectedPriceOption(svc.price_options[0])
    } else {
      setSelectedPriceOption(null)
    }
  }

  // Submit booking
  const handleCompleteBooking = async () => {
    if (!selectedService || !selectedPriceOption || !selectedDate || !selectedTime) {
      setErrorMsg('Please select service, date, and time.')
      return
    }
    if (!customerInfo.name || !customerInfo.email || !customerInfo.phone) {
      setErrorMsg('Please fill in your name, email, and phone.')
      return
    }

    setIsSubmitting(true)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          service_id: selectedService.id,
          price_option_id: selectedPriceOption.id,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          notes: customerInfo.notes,
          location: customerInfo.location,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking request')
      }

      setConfirmedBooking(data.booking)
      setStep(4)
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Pre-generate some upcoming 14 days dates for quick selection
  const availableDates: string[] = []
  const today = new Date()
  for (let i = 1; i <= 14; i++) {
    const d = new Date()
    d.setDate(today.getDate() + i)
    availableDates.push(d.toISOString().split('T')[0])
  }

  const timeSlots = [
    '10:00', '11:30', '14:00', '15:30', '17:00', '18:30'
  ]

  return (
    <div className="glass-panel rounded-3xl border-white/10 p-6 sm:p-10 max-w-4xl mx-auto shadow-2xl relative overflow-hidden">
      {/* Step Indicators */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
        {[
          { num: 1, label: 'Service' },
          { num: 2, label: 'Date & Time' },
          { num: 3, label: 'Details' },
          { num: 4, label: 'Confirmation' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= s.num
                  ? 'bg-[#e91e8c] text-white shadow-[0_0_15px_rgba(233,30,140,0.5)]'
                  : 'bg-white/10 text-gray-500'
              }`}
            >
              {step > s.num ? <CheckCircle2 className="w-4 h-4" /> : s.num}
            </div>
            <span className={`text-xs uppercase tracking-wider hidden sm:inline ${
              step >= s.num ? 'text-white font-medium' : 'text-gray-500'
            }`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: Select Service & Tier */}
      {step === 1 && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-white">Select a Service</h2>
            <p className="text-xs text-gray-400">Choose the type of collaboration or session you wish to reserve.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((svc) => {
              const isSelected = selectedService?.id === svc.id
              return (
                <div
                  key={svc.id}
                  onClick={() => handleSelectService(svc)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'border-[#e91e8c] bg-[#e91e8c]/10 shadow-[0_0_20px_rgba(233,30,140,0.2)]'
                      : 'border-white/10 bg-[#141414] hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base">{svc.name}</h3>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#e91e8c]" />}
                    </div>
                    {svc.description && (
                      <p className="text-xs text-gray-400 leading-relaxed">{svc.description}</p>
                    )}
                  </div>

                  {svc.duration_minutes && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
                      <Clock className="w-3.5 h-3.5 text-[#e91e8c]" />
                      <span>{svc.duration_minutes} minutes</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Price Option Selection */}
          {selectedService?.price_options && selectedService.price_options.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-white/10">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-300">
                Select Pricing Tier
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedService.price_options.map((opt) => {
                  const isSelected = selectedPriceOption?.id === opt.id
                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedPriceOption(opt)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-[#e91e8c] bg-[#e91e8c]/15 text-white'
                          : 'border-white/10 bg-[#141414] text-gray-400 hover:text-white'
                      }`}
                    >
                      <p className="font-bold text-sm text-white">{opt.name}</p>
                      <p className="font-serif text-lg font-bold text-[#ff2d9c] mt-1">
                        {opt.currency} {opt.amount.toLocaleString('en-IN')}
                      </p>
                      {opt.description && (
                        <p className="text-[11px] text-gray-400 mt-1">{opt.description}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="pt-6 flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!selectedService || !selectedPriceOption}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] disabled:opacity-40 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Next: Date &amp; Time</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Select Date & Time */}
      {step === 2 && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-white">Choose Appointment Date &amp; Time</h2>
            <p className="text-xs text-gray-400">Select an upcoming available slot for your reservation.</p>
          </div>

          <div className="space-y-3">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              Available Dates (Next 14 Days)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {availableDates.map((dateStr) => {
                const isSelected = selectedDate === dateStr
                const dateObj = new Date(dateStr)
                const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                const dayNum = dateObj.getDate()
                const monthName = dateObj.toLocaleDateString('en-US', { month: 'short' })

                return (
                  <button
                    key={dateStr}
                    type="button"
                    onClick={() => setSelectedDate(dateStr)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'border-[#e91e8c] bg-[#e91e8c]/20 text-white shadow-[0_0_15px_rgba(233,30,140,0.4)]'
                        : 'border-white/10 bg-[#141414] text-gray-400 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <p className="text-[10px] uppercase font-semibold text-gray-400">{dayName}</p>
                    <p className="text-lg font-bold text-white">{dayNum}</p>
                    <p className="text-[10px] text-gray-400">{monthName}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-white/10">
            <label className="text-xs uppercase tracking-wider font-semibold text-gray-300">
              Preferred Time Window
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
              {timeSlots.map((time) => {
                const isSelected = selectedTime === time
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'border-[#e91e8c] bg-[#e91e8c] text-white shadow-[0_0_15px_rgba(233,30,140,0.5)]'
                        : 'border-white/10 bg-[#141414] text-gray-300 hover:border-white/20'
                    }`}
                  >
                    {time}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-6 flex items-center justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 rounded-full border border-white/20 text-xs font-semibold text-gray-300 hover:text-white hover:border-white/40 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!selectedDate || !selectedTime}
              className="px-8 py-3 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(233,30,140,0.5)] disabled:opacity-40 hover:scale-105 transition-all flex items-center gap-2"
            >
              <span>Next: Contact Details</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Customer Details & Summary */}
      {step === 3 && (
        <div className="space-y-6 animate-fade-in">
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold text-white">Your Contact Details</h2>
            <p className="text-xs text-gray-400">All fields are verified server-side for appointment scheduling.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-300">
                Full Name <span className="text-[#e91e8c]">*</span>
              </label>
              <input
                type="text"
                required
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                placeholder="Maya Verma"
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-300">
                Email Address <span className="text-[#e91e8c]">*</span>
              </label>
              <input
                type="email"
                required
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                placeholder="maya@example.com"
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-300">
                Phone Number <span className="text-[#e91e8c]">*</span>
              </label>
              <input
                type="tel"
                required
                value={customerInfo.phone}
                onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase text-gray-300">
                Location (if physical session required)
              </label>
              <input
                type="text"
                value={customerInfo.location}
                onChange={(e) => setCustomerInfo({ ...customerInfo, location: e.target.value })}
                placeholder="Studio / City / Online"
                className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e91e8c]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase text-gray-300">
              Project Notes &amp; Special Requests
            </label>
            <textarea
              rows={3}
              value={customerInfo.notes}
              onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
              placeholder="Tell us about the creative vision, styling requirements, or timeline..."
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#e91e8c] resize-none"
            />
          </div>

          {/* Booking Summary Box */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase tracking-wider text-[#ff2d9c] font-semibold">
                Summary
              </span>
              <p className="text-sm font-bold text-white">
                {selectedService?.name} — {selectedPriceOption?.name}
              </p>
              <p className="text-xs text-gray-400">
                Scheduled on {selectedDate} at {selectedTime}
              </p>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase text-gray-400">Amount</span>
              <p className="font-serif text-2xl font-bold text-[#ff2d9c]">
                {selectedPriceOption?.currency} {selectedPriceOption?.amount.toLocaleString('en-IN')}
              </p>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 rounded-full border border-white/20 text-xs font-semibold text-gray-300 hover:text-white transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <button
              onClick={handleCompleteBooking}
              disabled={isSubmitting || !customerInfo.name || !customerInfo.email || !customerInfo.phone}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white text-xs font-bold uppercase tracking-wider shadow-[0_0_25px_rgba(233,30,140,0.5)] disabled:opacity-40 hover:scale-105 transition-all flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Submitting Request...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Booking Request</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Success & Status */}
      {step === 4 && confirmedBooking && (
        <div className="text-center py-8 space-y-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#e91e8c]/15 border border-[#e91e8c] flex items-center justify-center text-[#ff2d9c] shadow-[0_0_30px_rgba(233,30,140,0.4)]">
            <Sparkles className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-[#e91e8c]">
              Booking ID: {confirmedBooking.booking_id}
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white">
              Booking Request Received ♡
            </h2>
            <p className="text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
              Your booking request is waiting for approval. Our team will review the slot availability and contact you with confirmation.
            </p>
          </div>

          <div className="max-w-md mx-auto p-5 rounded-2xl bg-[#141414] border border-white/10 text-left space-y-2.5 text-xs text-gray-300">
            <div className="flex justify-between">
              <span className="text-gray-500">Service:</span>
              <span className="font-semibold text-white">{selectedService?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span className="font-semibold text-white">{selectedDate}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Time:</span>
              <span className="font-semibold text-white">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Booking Status:</span>
              <span className="text-yellow-400 font-semibold">{confirmedBooking.booking_status}</span>
            </div>
          </div>

          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            A confirmation receipt has been queued to <strong className="text-gray-300">{customerInfo.email}</strong>.
          </p>
        </div>
      )}
    </div>
  )
}
