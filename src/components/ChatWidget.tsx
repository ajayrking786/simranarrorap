'use client'

import React, { useState, useRef, useEffect } from 'react'
import { MessageSquare, X, Send, Bot, Sparkles, User, Minimize2 } from 'lucide-react'

interface Message {
  role: 'user' | 'model'
  text: string
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      text: 'Hello! I am Simran AI ♡. How can I help you today with appointments, collaborations, or exploring our gallery?',
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])
    setIsLoading(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          history: messages.map((m) => ({
            role: m.role,
            parts: m.text,
          })),
        }),
      })

      const data = await res.json()

      if (res.ok && data.response) {
        setMessages((prev) => [...prev, { role: 'model', text: data.response }])
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            text: data.error || "I don't have that information available right now. Please use the Contact section.",
          },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: "I don't have that information available right now. Please use the Contact section.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white rounded-full shadow-[0_0_25px_rgba(233,30,140,0.6)] hover:shadow-[0_0_35px_rgba(233,30,140,0.9)] hover:scale-105 transition-all focus:outline-none"
          aria-label="Open Simran AI Assistant"
        >
          <Sparkles className="w-5 h-5 animate-spin-slow" />
          <span className="text-sm font-semibold tracking-wide">Simran AI ♡</span>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-[#111111] border border-[#e91e8c]/40 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-4 py-3.5 bg-[#161616] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#e91e8c] to-[#ff2d9c] flex items-center justify-center text-white shadow-[0_0_10px_rgba(233,30,140,0.5)]">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1">
                  Simran AI <span className="text-[#e91e8c]">♡</span>
                </h3>
                <p className="text-[11px] text-gray-400">Official Creator Assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              aria-label="Close chat"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-sm">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'model' && (
                  <div className="w-6 h-6 rounded-full bg-[#e91e8c]/20 border border-[#e91e8c]/50 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3 h-3 text-[#e91e8c]" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 leading-relaxed text-xs sm:text-sm ${
                    m.role === 'user'
                      ? 'bg-gradient-to-r from-[#e91e8c] to-[#ff2d9c] text-white rounded-tr-none shadow-[0_0_15px_rgba(233,30,140,0.3)]'
                      : 'bg-[#1a1a1a] border border-white/5 text-gray-200 rounded-tl-none'
                  }`}
                >
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-0.5 text-gray-300">
                    <User className="w-3 h-3" />
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-2.5 justify-start">
                <div className="w-6 h-6 rounded-full bg-[#e91e8c]/20 border border-[#e91e8c]/50 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 text-[#e91e8c] animate-pulse" />
                </div>
                <div className="bg-[#1a1a1a] border border-white/5 text-gray-400 px-3.5 py-2.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#e91e8c] rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-[#e91e8c] rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-[#e91e8c] rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-[#161616] border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Simran AI anything..."
              className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-full px-4 py-2 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#e91e8c] transition-colors"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-full bg-[#e91e8c] text-white hover:bg-[#ff2d9c] disabled:opacity-40 disabled:hover:bg-[#e91e8c] transition-colors focus:outline-none"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
