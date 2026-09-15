import { NextRequest, NextResponse } from 'next/server'
import { getChatResponse } from '@/services/aiService'

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    const response = await getChatResponse(message, history || [])

    return NextResponse.json({ response })
  } catch (err: any) {
    console.error('AI chat route error:', err)
    return NextResponse.json({
      response: "I don't have that information available right now. Please use the Contact section.",
    })
  }
}
