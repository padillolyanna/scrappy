'use client'

import { useState } from 'react'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'
import { TEMPLATES } from '@/lib/types'
import AuthModal from '@/components/ui/AuthModal'

type Step = 'pick' | 'created'

function generateToken() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
}

export default function ExchangePage() {
  const { user, loading } = useAuth()
  const [step, setStep] = useState<Step>('pick')
  const [selectedTemplate, setSelectedTemplate] = useState('about-me')
  const [creating, setCreating] = useState(false)
  const [inviteUrl, setInviteUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setCreating(true)
    setError('')
    const supabase = createClient()
    const token = generateToken()

    // Try to insert into exchanges table
    const { data, error: insertError } = await supabase
      .from('exchanges')
      .insert({
        creator_id: user.id,
        template_id: selectedTemplate,
        invite_token: token,
        status: 'pending',
      })
      .select('id')
      .single()

    if (insertError || !data) {
      // exchanges table may not exist yet — show instructions
      setError('exchanges_table_missing')
      setCreating(false)
      return
    }

    // Also add creator as first participant
    await supabase.from('exchange_participants').insert({
      exchange_id: data.id,
      user_id: user.id,
    })

    const url = `${window.location.origin}/exchange/join/${token}`
    setInviteUrl(url)
    setStep('created')
    setCreating(false)
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const template = TEMPLATES.find((t) => t.id === selectedTemplate)

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-10 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <div
              className="font-pixel text-xs text-[#FF4FA3] mb-2 tracking-widest"
              style={{ fontSize: '12px' }}
            >
              ✉ SCRAPBOOK EXCHANGE
            </div>
            <h1
              className="font-pacifico text-5xl text-[#3A0030]"
              style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(28px, 6vw, 48px)' }}
            >
              pass notes with a stranger
            </h1>
            <p
              className="font-caveat text-xl text-[#888] mt-2"
              style={{ fontFamily: 'Caveat, cursive' }}
            >
              answer the same questions, then reveal your answers together ✦
            </p>
          </div>

          {/* Error: missing table */}
          {error === 'exchanges_table_missing' && (
            <div className="bg-[#FFF0A8] border-2 border-[#FFD700] rounded-xl p-6 mb-8">
              <div className="font-pixel text-xs text-[#8B6914] mb-2" style={{ fontSize: '12px' }}>
                SETUP REQUIRED
              </div>
              <p className="font-nunito text-sm text-[#3A0030] mb-3">
                The exchange feature needs a one-time database setup. Run this SQL in your Supabase dashboard:
              </p>
              <pre className="bg-[#3A0030] text-[#00ff41] text-xs p-4 rounded-lg overflow-auto font-mono" style={{ fontSize: '12px' }}>
{`-- exchanges
create table if not exists public.exchanges (
  id uuid default uuid_generate_v4() primary key,
  creator_id uuid references public.profiles(id) on delete cascade not null,
  template_id text not null,
  status text default 'pending',
  invite_token text unique not null,
  expires_at timestamptz default (now() + interval '7 days'),
  created_at timestamptz default now()
);
alter table public.exchanges enable row level security;
create policy "Exchanges viewable by creator" on public.exchanges
  for select using (auth.uid() = creator_id);
create policy "Authenticated users can create exchanges" on public.exchanges
  for insert with check (auth.uid() = creator_id);
create policy "Creator can update exchange" on public.exchanges
  for update using (auth.uid() = creator_id);

-- exchange participants
create table if not exists public.exchange_participants (
  id uuid default uuid_generate_v4() primary key,
  exchange_id uuid references public.exchanges(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  joined_at timestamptz default now(),
  unique (exchange_id, user_id)
);
alter table public.exchange_participants enable row level security;
create policy "Participants viewable by all exchange members" on public.exchange_participants
  for select using (
    exists (select 1 from public.exchange_participants ep
      where ep.exchange_id = exchange_id and ep.user_id = auth.uid())
  );
create policy "Users can join exchanges" on public.exchange_participants
  for insert with check (auth.uid() = user_id);

-- exchange answers
create table if not exists public.exchange_answers (
  id uuid default uuid_generate_v4() primary key,
  exchange_id uuid references public.exchanges(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  question_id text not null,
  question_text text not null,
  answer_text text not null,
  created_at timestamptz default now(),
  unique (exchange_id, user_id, question_id)
);
alter table public.exchange_answers enable row level security;
create policy "Exchange answers viewable by participants" on public.exchange_answers
  for select using (
    exists (select 1 from public.exchange_participants ep
      where ep.exchange_id = exchange_id and ep.user_id = auth.uid())
  );
create policy "Users can submit their own answers" on public.exchange_answers
  for insert with check (auth.uid() = user_id);`}
              </pre>
              <button
                onClick={() => setError('')}
                className="btn-outline-y2k mt-4 text-xs"
                style={{ fontSize: '12px' }}
              >
                try again
              </button>
            </div>
          )}

          {step === 'pick' && (
            <div>
              {/* How it works */}
              <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-6 mb-8">
                <div className="font-pixel text-xs text-[#3A0030] mb-4" style={{ fontSize: '12px' }}>
                  HOW IT WORKS
                </div>
                <div className="grid sm:grid-cols-4 gap-4">
                  {[
                    { step: 1, text: 'Pick a template', symbol: '◆' },
                    { step: 2, text: 'Get an invite link', symbol: '◎' },
                    { step: 3, text: 'Share with someone', symbol: '♡' },
                    { step: 4, text: 'Compare answers!', symbol: '✦' },
                  ].map((s) => (
                    <div key={s.step} className="text-center">
                      <div className="font-pixel text-2xl text-[#FF4FA3]/50 mb-2">{s.symbol}</div>
                      <div className="font-pixel text-xs text-[#888]" style={{ fontSize: '12px' }}>
                        {s.step}. {s.text}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Template picker */}
              <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-6 mb-6">
                <div className="font-pixel text-xs text-[#3A0030] mb-4" style={{ fontSize: '12px' }}>
                  CHOOSE A TEMPLATE
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {TEMPLATES.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        selectedTemplate === t.id
                          ? 'border-[#FF4FA3] bg-[#FF4FA3]/5 shadow'
                          : 'border-[#FFB6D9]/50 hover:border-[#FF4FA3] bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-pixel text-xl text-[#3A0030]/30">{t.symbol}</span>
                        <span className="font-pixel text-xs text-[#3A0030]" style={{ fontSize: '12px' }}>
                          {t.name}
                        </span>
                        {selectedTemplate === t.id && (
                          <span className="ml-auto font-pixel text-xs text-[#FF4FA3]" style={{ fontSize: '12px' }}>
                            ✓
                          </span>
                        )}
                      </div>
                      <div
                        className="font-caveat text-[#888]"
                        style={{ fontFamily: 'Caveat, cursive', fontSize: '14px' }}
                      >
                        {t.description}
                      </div>
                      <div className="font-nunito text-xs text-[#888] mt-1">
                        {t.questions.length} questions
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected template preview */}
              {template && (
                <div className="bg-[#FFF8ED] rounded-xl border-2 border-[#FFB6D9]/30 p-4 mb-6">
                  <div className="font-pixel text-xs text-[#888] mb-2" style={{ fontSize: '12px' }}>
                    PREVIEW — {template.name}
                  </div>
                  <div className="space-y-1">
                    {template.questions.slice(0, 4).map((q) => (
                      <div key={q.id} className="flex items-center gap-2">
                        <span className="text-[#FFB6D9] text-xs">♡</span>
                        <span className="font-nunito text-xs text-[#3A0030]">{q.question_text}</span>
                      </div>
                    ))}
                    {template.questions.length > 4 && (
                      <div className="font-nunito text-xs text-[#888] pl-4">
                        + {template.questions.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                onClick={handleCreate}
                disabled={creating || loading}
                className="btn-y2k w-full py-4 text-base"
              >
                {creating ? 'creating exchange...' : 'create exchange & get link ✦'}
              </button>

              {!user && !loading && (
                <p className="text-center font-caveat text-[#888] mt-3" style={{ fontFamily: 'Caveat, cursive' }}>
                  you need to{' '}
                  <Link href="/auth/login" className="text-[#FF4FA3] hover:underline">
                    log in
                  </Link>{' '}
                  to create an exchange ✦
                </p>
              )}
            </div>
          )}

          {step === 'created' && (
            <div className="text-center">
              <div className="font-pixel text-5xl text-[#FF4FA3] mb-4">✦</div>
              <h2
                className="font-pacifico text-3xl text-[#3A0030] mb-2"
                style={{ fontFamily: 'Pacifico, cursive' }}
              >
                your exchange is ready!
              </h2>
              <p
                className="font-caveat text-xl text-[#888] mb-8"
                style={{ fontFamily: 'Caveat, cursive' }}
              >
                share this link with someone and answer the same questions ✦
              </p>

              <div className="bg-white rounded-xl border-2 border-[#FFB6D9] p-5 mb-6 max-w-lg mx-auto">
                <div className="font-pixel text-xs text-[#888] mb-2" style={{ fontSize: '12px' }}>
                  YOUR INVITE LINK
                </div>
                <div className="font-nunito text-sm text-[#3A0030] break-all mb-4 bg-[#FFF8ED] rounded-lg p-3">
                  {inviteUrl}
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={handleCopy}
                    className="btn-y2k"
                  >
                    {copied ? '✓ copied!' : '◎ copy link'}
                  </button>
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({ title: 'SCRAPPY Exchange Invitation', url: inviteUrl })
                      } else {
                        handleCopy()
                      }
                    }}
                    className="btn-outline-y2k"
                  >
                    share ✦
                  </button>
                </div>
              </div>

              <div className="bg-[#FFF0A8] border-2 border-[#FFD700] rounded-xl p-4 mb-6 max-w-lg mx-auto text-left">
                <div className="font-pixel text-xs text-[#8B6914] mb-2" style={{ fontSize: '12px' }}>
                  NEXT STEPS
                </div>
                <div className="space-y-2">
                  {[
                    'Share the link with a friend or stranger',
                    "They'll answer the same questions you did",
                    "Once both complete, you'll see answers side by side",
                  ].map((s, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <span className="font-pixel text-[#FF4FA3] text-sm">{i + 1}.</span>
                      <span className="font-nunito text-xs text-[#3A0030]">{s}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-center">
                <Link href="/my-space" className="btn-outline-y2k">
                  my space →
                </Link>
                <button
                  onClick={() => { setStep('pick'); setInviteUrl('') }}
                  className="font-nunito text-sm text-[#888] hover:text-[#FF4FA3] transition-colors"
                >
                  create another
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {showAuthModal && (
        <AuthModal reason="save" onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  )
}
