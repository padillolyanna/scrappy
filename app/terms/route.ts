import { NextResponse } from 'next/server'

export function GET() {
  return NextResponse.redirect('https://www.scrappy.fun/tos', { status: 301 })
}
