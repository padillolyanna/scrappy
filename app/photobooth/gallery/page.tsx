export const instant = false

import { createClient } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Footer from '@/components/layout/Footer'

export default async function PhotoboothGalleryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="font-pixel text-5xl text-[#FFB6D9] mb-4">📷</div>
          <h2 className="font-pacifico text-2xl text-[#3A0030] mb-2" style={{ fontFamily: 'Pacifico, cursive' }}>
            sign in to see your strips
          </h2>
          <p className="font-caveat text-lg text-[#888] mb-4" style={{ fontFamily: 'Caveat, cursive' }}>
            your photo gallery lives here ✦
          </p>
          <Link href="/auth/login" className="btn-y2k">log in</Link>
        </div>
      </div>
    )
  }

  const { data: sessions } = await supabase
    .from('photobooth_sessions')
    .select('id, layout_id, strip_url, photo_count, filter_id, frame_id, created_at')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('created_at', { ascending: false })
    .limit(48)

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <Link href="/photobooth" className="text-[#888] hover:text-[#FF4FA3] font-nunito text-sm flex items-center gap-1">
              ← photobooth
            </Link>
            <div className="font-pixel text-xs text-[#3A0030]" style={{ fontSize: '11px' }}>✦ MY PHOTO STRIPS ✦</div>
            <Link href="/photobooth" className="btn-y2k py-2 px-4 text-xs" style={{ fontSize: '11px' }}>
              + NEW STRIP
            </Link>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-pacifico text-3xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
              my photobooth gallery
            </h1>
            <p className="font-caveat text-lg text-[#888] mt-1" style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}>
              {sessions?.length ?? 0} photo strips saved ✦
            </p>
          </div>

          {!sessions || sessions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border-2 border-[#FFB6D9]/30">
              <div className="text-5xl mb-4">📷</div>
              <div className="font-pacifico text-xl text-[#3A0030] mb-2" style={{ fontFamily: 'Pacifico, cursive' }}>
                no strips yet!
              </div>
              <p className="font-caveat text-[#888] mb-6" style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}>
                take your first photos and save them here ✦
              </p>
              <Link href="/photobooth" className="btn-y2k">take photos now</Link>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 md:columns-4 gap-4 space-y-4">
              {sessions.map(s => (
                <div key={s.id} className="break-inside-avoid bg-white rounded-xl border-2 border-[#FFB6D9]/40 overflow-hidden hover:border-[#FF4FA3] hover:shadow-md transition-all group mb-4">
                  {s.strip_url ? (
                    <img
                      src={s.strip_url}
                      alt="photo strip"
                      className="w-full object-cover"
                    />
                  ) : (
                    <div className="h-32 bg-[#FFB6D9]/20 flex items-center justify-center">
                      <span className="text-3xl">📷</span>
                    </div>
                  )}
                  <div className="p-3">
                    <div className="font-pixel text-[#3A0030] capitalize" style={{ fontSize: '9px' }}>
                      {s.layout_id?.replace('-', ' ')} · {s.photo_count} photos
                    </div>
                    <div className="font-nunito text-xs text-[#888] mt-0.5">
                      {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    {s.strip_url && (
                      <a
                        href={s.strip_url}
                        download={`scrappy-strip-${s.id}.png`}
                        className="mt-2 font-nunito text-xs text-[#FF4FA3] hover:underline block"
                      >
                        download ↓
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
