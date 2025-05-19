// /app/api/stream/route.ts

import { addClient } from '@/lib/see'
import { NextRequest } from 'next/server'


export async function GET(req: NextRequest) {
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()

  addClient(writer)

  const encoder = new TextEncoder()
  writer.write(encoder.encode(`data: ${JSON.stringify({ connected: true })}\n\n`))

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  })
}
