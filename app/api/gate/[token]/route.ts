import { NextResponse, type NextRequest } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const secret = process.env.ADMIN_GATE_SECRET

  if (!secret || token !== secret) {
    return new NextResponse(null, { status: 404 })
  }

  const response = NextResponse.redirect(new URL('/admin', request.url))
  response.cookies.set('scrappy_gate', secret, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 365, // 1 year
    path: '/',
  })
  return response
}
