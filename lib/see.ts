// /lib/sse.ts

import { NextResponse } from 'next/server'

let clients: WritableStreamDefaultWriter[] = []

export function addClient(writer: WritableStreamDefaultWriter) {
  clients.push(writer)
}

export function removeClient(writer: WritableStreamDefaultWriter) {
  clients = clients.filter((c) => c !== writer)
}

export function broadcast(data: any) {
  const payload = `data: ${JSON.stringify(data)}\n\n`
  clients.forEach(async (writer) => {
    try {
      await writer.write(payload)
    } catch {
      removeClient(writer)
    }
  })
}
