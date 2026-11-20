'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'
import Footer from '@/components/layout/Footer'
import {
  BACKGROUNDS, DEFAULT_MAG_LINES, FRAMES, ensureFonts, renderStrip,
  type LayoutId,
} from '@/lib/photoboothArt'
import { EMOJI_STICKERS, GEM_COLORS, GEM_STICKERS, STICKERS, Sticker, StickerDefs, stickerTintable } from '@/components/notebook/Stickers'

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 'landing' | 'layout' | 'camera' | 'customize' | 'preview'

interface StickerEl {
  id: string
  content: string // 'svg:<id>' or 'txt:<emoji>'
  color?: string
  x: number // % of strip width
  y: number // % of strip height
  size: number // px in the on-screen preview
  rotation: number
}

interface TextEl {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  color: string
  fontFamily: string
  rotation: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const LAYOUTS: { id: LayoutId; label: string; count: number; desc: string }[] = [
  { id: 'classic', label: 'CLASSIC STRIP', count: 4, desc: '4 photos · vertical strip' },
  { id: 'mini', label: 'MINI STRIP', count: 3, desc: '3 photos · compact' },
  { id: 'double', label: 'DOUBLE TROUBLE', count: 2, desc: '2 photos · simple' },
  { id: 'friendship', label: 'FRIENDSHIP STRIP', count: 4, desc: '4 photos · with title' },
  { id: 'grid', label: 'PHOTO GRID', count: 4, desc: '4 photos · 2×2 grid' },
  { id: 'collage', label: 'COLLAGE', count: 6, desc: '6 photos · creative' },
  { id: 'cover', label: 'MAGAZINE COVER', count: 1, desc: '1 photo · be the cover star' },
]

const FILTERS: { id: string; label: string; css: string }[] = [
  { id: 'none', label: 'Original', css: 'none' },
  { id: 'y2k_flash', label: 'Y2K Flash', css: 'brightness(1.35) contrast(1.25) saturate(0.9)' },
  { id: 'disposable', label: 'Disposable', css: 'sepia(0.35) contrast(1.15) brightness(1.08) saturate(1.3)' },
  { id: 'pink_dream', label: 'Pink Dream', css: 'brightness(1.1) saturate(1.5) hue-rotate(-20deg)' },
  { id: 'vintage', label: 'Vintage Film', css: 'sepia(0.5) contrast(0.85) brightness(0.9) saturate(0.75)' },
  { id: 'cool_blue', label: 'Cool Blue', css: 'saturate(0.7) hue-rotate(190deg) brightness(1.1) contrast(1.1)' },
  { id: 'soft_glow', label: 'Soft Glow', css: 'brightness(1.2) contrast(0.88) saturate(1.15)' },
  { id: 'y2k_digital', label: 'Y2K Digital', css: 'saturate(1.6) contrast(1.1) brightness(1.07) hue-rotate(-5deg)' },
  { id: 'bw', label: 'B&W', css: 'grayscale(1) contrast(1.1) brightness(1.05)' },
]

const FONTS = ['Caveat', 'Pacifico', 'VT323', 'Nunito', 'Space Grotesk']

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function newSticker(content: string, color?: string): StickerEl {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    content, color,
    x: 30 + Math.random() * 40, y: 20 + Math.random() * 60,
    size: content.startsWith('txt:') ? 34 : 46,
    rotation: Math.round((Math.random() - 0.5) * 24),
  }
}

// ─── Layout Preview SVG ───────────────────────────────────────────────────────

function LayoutPreview({ id }: { id: LayoutId }) {
  const base = 'fill-[#FFB6D9]/40 stroke-[#FF4FA3]/60 stroke-[0.5]'
  if (id === 'cover') {
    return (
      <svg viewBox="0 0 44 60" className="w-full h-full">
        <rect x={1} y={1} width={42} height={58} rx="1" className={base} />
        <rect x={6} y={4} width={32} height={8} rx="1" className="fill-[#FF4FA3]/70" />
        <rect x={28} y={22} width={12} height={2} className="fill-[#FF4FA3]/60" />
        <rect x={30} y={26} width={10} height={2} className="fill-[#3A0030]/40" />
        <rect x={28} y={30} width={12} height={2} className="fill-[#FF4FA3]/60" />
      </svg>
    )
  }
  if (id === 'grid' || id === 'collage') {
    const slots = id === 'grid' ? [[0,0],[1,0],[0,1],[1,1]] : [[0,0],[1,0],[0,1],[1,1],[0,2],[1,2]]
    return (
      <svg viewBox="0 0 44 60" className="w-full h-full">
        {slots.map(([col, row], i) => (
          <rect key={i} x={col * 23 + 1} y={row * 20 + 1} width={20} height={17} rx="1" className={base} />
        ))}
      </svg>
    )
  }
  const count = LAYOUTS.find(l => l.id === id)!.count
  return (
    <svg viewBox="0 0 30 70" className="w-full h-full">
      {Array.from({ length: count }).map((_, i) => (
        <rect key={i} x={1} y={i * (70 / count) + 1} width={28} height={70 / count - 3} rx="1" className={base} />
      ))}
    </svg>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PhotoboothPage() {
  const { user } = useAuth()
  const supabase = createClient()

  // ── Step ──
  const [step, setStep] = useState<Step>('landing')
  const [selectedLayout, setSelectedLayout] = useState<LayoutId>('classic')

  // ── Camera ──
  const videoRef = useRef<HTMLVideoElement>(null)
  const captureCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [cameraReady, setCameraReady] = useState(false)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')

  // ── Capture ──
  const capturedRef = useRef<string[]>([])
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([])
  const [countdown, setCountdown] = useState<number | null>(null)
  const [flashActive, setFlashActive] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureIndex, setCaptureIndex] = useState(0)
  const [countdownDuration, setCountdownDuration] = useState(3)
  const [enableFlash, setEnableFlash] = useState(true)

  // ── Customize ──
  const [selectedFilter, setSelectedFilter] = useState('none')
  const [selectedFrame, setSelectedFrame] = useState('rhinestone')
  const [bgId, setBgId] = useState('glitter-pink')
  const [magTitle, setMagTitle] = useState('sparkle')
  const [stripTitle, setStripTitle] = useState('best friends 4ever ♡')
  const [magLines, setMagLines] = useState<string[]>(DEFAULT_MAG_LINES)
  const [loadedImgs, setLoadedImgs] = useState<HTMLImageElement[]>([])
  const [fontsReady, setFontsReady] = useState(false)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)
  const [stickers, setStickers] = useState<StickerEl[]>([])
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null)
  const [gemColor, setGemColor] = useState(GEM_COLORS[0].hex)
  const [stickerTab, setStickerTab] = useState<'gems' | 'stickers' | 'emoji'>('gems')
  const [textElements, setTextElements] = useState<TextEl[]>([])
  const stripPreviewRef = useRef<HTMLDivElement>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [addingText, setAddingText] = useState(false)
  const [newText, setNewText] = useState('')
  const [newTextColor, setNewTextColor] = useState('#FF4FA3')
  const [newTextFont, setNewTextFont] = useState('Caveat')
  const [newTextSize, setNewTextSize] = useState(22)

  // ── Export / Save ──
  const [exportedUrl, setExportedUrl] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  // ── Camera lifecycle ──
  const startCamera = useCallback(async () => {
    setCameraError(null)
    setCameraReady(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
        setCameraReady(true)
      }
    } catch {
      setCameraError("Couldn't access your camera. Please allow camera access and try again.")
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setCameraReady(false)
  }, [])

  useEffect(() => {
    if (step === 'camera') {
      startCamera()
    } else {
      stopCamera()
    }
    return () => stopCamera()
  }, [step, startCamera, stopCamera])

  // ── Re-init camera when facingMode changes ──
  useEffect(() => {
    if (step === 'camera' && streamRef.current) {
      stopCamera()
      setTimeout(startCamera, 100)
    }
  }, [facingMode]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Capture ──
  function captureFromVideo(): string {
    const video = videoRef.current!
    const canvas = captureCanvasRef.current!
    canvas.width = video.videoWidth || 640
    canvas.height = video.videoHeight || 480
    const ctx = canvas.getContext('2d')!
    if (facingMode === 'user') {
      ctx.save()
      ctx.scale(-1, 1)
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height)
      ctx.restore()
    } else {
      ctx.drawImage(video, 0, 0)
    }
    return canvas.toDataURL('image/jpeg', 0.92)
  }

  const requiredCount = LAYOUTS.find(l => l.id === selectedLayout)?.count ?? 4

  async function runCaptureSequence() {
    if (isCapturing) return
    setIsCapturing(true)
    capturedRef.current = capturedPhotos.slice()

    for (let i = capturedRef.current.length; i < requiredCount; i++) {
      setCaptureIndex(i)

      for (let c = countdownDuration; c >= 1; c--) {
        setCountdown(c)
        await sleep(1000)
      }
      setCountdown(null)
      await sleep(80)

      if (enableFlash) {
        setFlashActive(true)
        await sleep(120)
        setFlashActive(false)
      }

      const photo = captureFromVideo()
      capturedRef.current = [...capturedRef.current, photo]
      setCapturedPhotos([...capturedRef.current])
      await sleep(500)
    }

    setIsCapturing(false)
    setStep('customize')
  }

  function retakePhoto(index: number) {
    const updated = capturedPhotos.filter((_, i) => i !== index)
    capturedRef.current = updated
    setCapturedPhotos(updated)
  }

  // ── Drag ──
  function handleDragStart(e: React.MouseEvent | React.TouchEvent, id: string) {
    e.preventDefault()
    const rect = stripPreviewRef.current?.getBoundingClientRect()
    if (!rect) return
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const el = [...stickers, ...textElements].find(x => x.id === id)
    if (!el) return
    setSelectedStickerId(stickers.some(x => x.id === id) ? id : null)
    setDraggingId(id)
    setDragOffset({
      x: clientX - rect.left - (el.x / 100) * rect.width,
      y: clientY - rect.top - (el.y / 100) * rect.height,
    })
  }

  function handleDragMove(e: React.MouseEvent | React.TouchEvent) {
    if (!draggingId || !stripPreviewRef.current) return
    const rect = stripPreviewRef.current.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const nx = Math.max(0, Math.min(100, ((clientX - rect.left - dragOffset.x) / rect.width) * 100))
    const ny = Math.max(0, Math.min(100, ((clientY - rect.top - dragOffset.y) / rect.height) * 100))

    setStickers(prev => prev.map(s => s.id === draggingId ? { ...s, x: nx, y: ny } : s))
    setTextElements(prev => prev.map(t => t.id === draggingId ? { ...t, x: nx, y: ny } : t))
  }

  function handleDragEnd() { setDraggingId(null) }

  function addSticker(content: string, color?: string) {
    const el = newSticker(content, color)
    const id = el.id
    setStickers(prev => [...prev, el])
    setSelectedStickerId(id)
  }

  function updateSticker(id: string, patch: Partial<StickerEl>) {
    setStickers(prev => prev.map(s => (s.id === id ? { ...s, ...patch } : s)))
  }

  function addTextEl() {
    if (!newText.trim()) return
    setTextElements(prev => [...prev, {
      id: Date.now().toString(),
      text: newText.trim(),
      x: 50, y: 50,
      fontSize: newTextSize,
      color: newTextColor,
      fontFamily: newTextFont,
      rotation: 0,
    }])
    setNewText('')
    setAddingText(false)
  }

  // ── Export ──
  const isWide = selectedLayout === 'grid' || selectedLayout === 'collage' || selectedLayout === 'cover'
  const previewWidth = isWide ? 260 : 180
  const artOpts = {
    layout: selectedLayout,
    count: Math.max(1, capturedPhotos.length),
    filterCss: FILTERS.find(f => f.id === selectedFilter)?.css ?? 'none',
    bgId,
    frameId: selectedFrame,
    magTitle,
    magLines,
    stripTitle,
  }

  async function generateExport(): Promise<string> {
    await ensureFonts()
    const imgs = await Promise.all(capturedPhotos.map(loadImage))
    if (!imgs.length) throw new Error('No photos')
    const canvas = document.createElement('canvas')
    const { W, H } = renderStrip(canvas, { ...artOpts, imgs, scale: 2 })
    const ctx = canvas.getContext('2d')!
    // stickers/text are sized in preview pixels — scale them to the export
    const k = W / previewWidth

    // stickers are SVG art: serialise the preview's self-contained SVG and draw it
    const serializer = new XMLSerializer()
    for (const s of stickers) {
      const svg = stripPreviewRef.current?.querySelector(`[data-sticker-id="${s.id}"] svg`)
      if (!svg) continue
      const url = URL.createObjectURL(new Blob([serializer.serializeToString(svg)], { type: 'image/svg+xml' }))
      try {
        const img = await loadImage(url)
        // the SVG viewBox has a 6/112 margin around the 100-unit art
        const box = s.size * k * (112 / 100)
        ctx.save()
        ctx.translate((s.x / 100) * W, (s.y / 100) * H)
        ctx.rotate((s.rotation * Math.PI) / 180)
        ctx.shadowColor = 'rgba(43,10,46,.3)'
        ctx.shadowBlur = 3 * k
        ctx.shadowOffsetY = 2 * k
        ctx.drawImage(img, -box / 2, -box / 2, box, box)
        ctx.restore()
      } catch {
        // skip a sticker that fails to rasterise rather than failing the strip
      } finally {
        URL.revokeObjectURL(url)
      }
    }

    textElements.forEach(t => {
      ctx.save()
      ctx.translate((t.x / 100) * W, (t.y / 100) * H)
      ctx.rotate((t.rotation * Math.PI) / 180)
      ctx.font = `${t.fontSize * k}px ${t.fontFamily}, cursive`
      ctx.shadowColor = 'rgba(0,0,0,0.3)'
      ctx.shadowBlur = 3 * k
      ctx.shadowOffsetY = 1 * k
      ctx.fillStyle = t.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(t.text, 0, 0)
      ctx.restore()
    })

    return canvas.toDataURL('image/png', 0.95)
  }

  // Load captured photos + fonts once for the live canvas preview
  useEffect(() => {
    let cancelled = false
    Promise.all(capturedPhotos.map(loadImage)).then(imgs => { if (!cancelled) setLoadedImgs(imgs) }).catch(() => {})
    ensureFonts().then(() => { if (!cancelled) setFontsReady(true) })
    return () => { cancelled = true }
  }, [capturedPhotos])

  // Redraw the live preview whenever a choice changes
  useEffect(() => {
    if (step !== 'customize' || !previewCanvasRef.current) return
    renderStrip(previewCanvasRef.current, { ...artOpts, imgs: loadedImgs, scale: 1.5 })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, loadedImgs, fontsReady, selectedLayout, selectedFilter, bgId, selectedFrame, magTitle, magLines, stripTitle, capturedPhotos.length])

  async function goToPreview() {
    setGenerating(true)
    try {
      const url = await generateExport()
      setExportedUrl(url)
      setStep('preview')
    } catch (err) {
      console.error(err)
    }
    setGenerating(false)
  }

  function downloadStrip() {
    if (!exportedUrl) return
    const a = document.createElement('a')
    a.href = exportedUrl
    a.download = `scrappy-photobooth-${Date.now()}.png`
    a.click()
  }

  async function saveToPhotobooth() {
    if (!user) return
    setSaving(true)
    setSaveError('')
    try {
      // Upload PNG to Supabase storage
      const blob = await (await fetch(exportedUrl!)).blob()
      const fileName = `${user.id}/${Date.now()}.png`
      const { error: uploadErr } = await supabase.storage
        .from('photobooth')
        .upload(fileName, blob, { contentType: 'image/png', upsert: false })

      if (uploadErr) throw uploadErr

      const { data: { publicUrl } } = supabase.storage.from('photobooth').getPublicUrl(fileName)

      const { error: dbErr } = await supabase.from('photobooth_sessions').insert({
        user_id: user.id,
        layout_id: selectedLayout,
        filter_id: selectedFilter,
        frame_id: selectedFrame,
        bg_color: bgId,
        photo_count: capturedPhotos.length,
        strip_url: publicUrl,
        status: 'completed',
      })

      if (dbErr) throw dbErr
      setSaved(true)
    } catch (e: unknown) {
      setSaveError('Could not save. Make sure the photobooth bucket exists in Supabase Storage.')
    }
    setSaving(false)
  }

  function resetAll() {
    capturedRef.current = []
    setCapturedPhotos([])
    setCaptureIndex(0)
    setStickers([])
    setSelectedStickerId(null)
    setTextElements([])
    setSelectedFilter('none')
    setSelectedFrame('rhinestone')
    setBgId('glitter-pink')
    setStripTitle('best friends 4ever ♡')
    setExportedUrl(null)
    setSaved(false)
    setSaveError('')
    setStep('layout')
  }

  // ─── Filter CSS helper ───

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP: LANDING
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'landing') {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1">
          {/* Hero */}
          <div className="bg-gradient-to-b from-[#2B0A2E] via-[#3A0030] to-[#FFB6D9] py-16 px-4 text-center relative overflow-hidden">
            {/* Decorations */}
            <div className="absolute top-6 left-8 text-3xl opacity-40 animate-sparkle">✦</div>
            <div className="absolute top-12 right-10 text-2xl opacity-30 animate-sparkle" style={{ animationDelay: '0.5s' }}>★</div>
            <div className="absolute bottom-8 left-16 text-xl opacity-25">✦</div>
            <div className="absolute bottom-6 right-12 text-2xl opacity-25">✿</div>
            <div className="absolute top-20 left-1/4 text-xl opacity-20">♡</div>
            <div className="absolute top-8 right-1/4 text-lg opacity-20">◆</div>

            <div className="font-pixel text-xs text-[#FF4FA3] mb-3 tracking-widest" style={{ fontSize: '11px' }}>
              ✦ YOUR LITTLE PHOTO CORNER ✦
            </div>
            <h1
              className="font-pacifico text-[#FFB6D9]"
              style={{ fontFamily: 'Pacifico, cursive', fontSize: 'clamp(32px, 8vw, 60px)', textShadow: '0 2px 20px rgba(255,75,163,0.5)' }}
            >
              SCRAPPY PHOTOBOOTH
            </h1>
            <p className="font-pixel text-[#FFD6EC] mt-2" style={{ fontSize: '14px' }}>
              Strike a pose. Make a memory. Keep it forever.
            </p>
            <p
              className="font-caveat text-[#FFB6D9]/80 mt-3 max-w-md mx-auto"
              style={{ fontFamily: 'Caveat, cursive', fontSize: '18px' }}
            >
              Step inside our little digital photo booth and create nostalgic photo strips.
              Bring your friends, make silly faces, and decorate your pictures.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <button
                onClick={() => setStep('layout')}
                className="btn-y2k text-base px-8 py-3"
                style={{ fontSize: '14px' }}
              >
                LET&apos;S TAKE PICTURES!
              </button>
              {user && (
                <Link href="/photobooth/gallery" className="btn-outline-y2k px-8 py-3 text-sm bg-white/10 border-white/50 text-white hover:bg-white/20" style={{ fontSize: '13px' }}>
                  MY PHOTO STRIPS ✦
                </Link>
              )}
            </div>
          </div>

          {/* Strip style preview cards */}
          <div className="max-w-4xl mx-auto px-4 py-10">
            <div className="font-pixel text-xs text-center text-[#3A0030] mb-6 tracking-widest" style={{ fontSize: '11px' }}>
              ✦ CHOOSE FROM 6 LAYOUTS ✦
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {LAYOUTS.map(l => (
                <button
                  key={l.id}
                  onClick={() => { setSelectedLayout(l.id); setStep('camera') }}
                  className="bg-white rounded-xl border-2 border-[#FFB6D9]/50 p-3 hover:border-[#FF4FA3] hover:shadow-md transition-all group"
                >
                  <div className="h-14 flex items-center justify-center">
                    <div className="w-8 h-14 mx-auto">
                      <LayoutPreview id={l.id} />
                    </div>
                  </div>
                  <div className="font-pixel text-[#3A0030] mt-1" style={{ fontSize: '8px' }}>{l.label}</div>
                  <div className="font-nunito text-[#888] mt-0.5" style={{ fontSize: '9px' }}>{l.count} photos</div>
                </button>
              ))}
            </div>

            {/* How it works */}
            <div className="mt-10 bg-[#FFF8ED] rounded-2xl border-2 border-[#FFB6D9]/40 p-6">
              <div className="font-pixel text-xs text-[#FF4FA3] mb-4 text-center" style={{ fontSize: '11px' }}>
                ✦ HOW IT WORKS ✦
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                {[
                  { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF4FA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><rect x="7" y="7" width="10" height="10" rx="1"/></svg>, label: 'Choose layout', n: '01' },
                  { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF4FA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>, label: 'Strike a pose', n: '02' },
                  { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF4FA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>, label: 'Decorate', n: '03' },
                  { icon: <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF4FA3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>, label: 'Save & share', n: '04' },
                ].map(s => (
                  <div key={s.n} className="flex flex-col items-center gap-1">
                    <div className="flex items-center justify-center">{s.icon}</div>
                    <div className="font-pixel text-[#FF4FA3]" style={{ fontSize: '9px' }}>{s.n}</div>
                    <div className="font-caveat text-[#3A0030]" style={{ fontFamily: 'Caveat, cursive', fontSize: '15px' }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP: LAYOUT PICKER
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'layout') {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 py-10 px-4">
          <div className="max-w-3xl mx-auto">
            <button onClick={() => setStep('landing')} className="text-[#888] hover:text-[#FF4FA3] font-nunito text-sm mb-6 flex items-center gap-1">
              ← back
            </button>
            <div className="text-center mb-8">
              <div className="font-pixel text-xs text-[#FF4FA3] mb-2" style={{ fontSize: '11px' }}>STEP 01</div>
              <h1 className="font-pacifico text-3xl text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>
                choose your layout
              </h1>
              <p className="font-caveat text-[#888] mt-1" style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}>
                pick how many photos you want to take ✦
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {LAYOUTS.map(l => (
                <button
                  key={l.id}
                  onClick={() => setSelectedLayout(l.id)}
                  className={`bg-white rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md ${
                    selectedLayout === l.id ? 'border-[#FF4FA3] shadow-md scale-[1.02]' : 'border-[#FFB6D9]/50'
                  }`}
                >
                  <div className="h-24 flex items-center justify-center mb-3">
                    <div className={l.id === 'grid' || l.id === 'collage' ? 'w-20 h-20' : 'w-10 h-24'}>
                      <LayoutPreview id={l.id} />
                    </div>
                  </div>
                  <div className="font-pixel text-[#3A0030]" style={{ fontSize: '10px' }}>{l.label}</div>
                  <div className="font-nunito text-[#888] text-xs mt-0.5">{l.desc}</div>
                  {selectedLayout === l.id && (
                    <div className="mt-2 font-pixel text-[#FF4FA3]" style={{ fontSize: '9px' }}>✦ SELECTED</div>
                  )}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep('camera')}
              className="btn-y2k w-full py-3 mt-8 text-base"
            >
              USE THIS LAYOUT ✦
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP: CAMERA
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'camera') {
    return (
      <div className="flex flex-col min-h-screen bg-[#1A0020]">
        <main className="flex-1 flex flex-col items-center py-6 px-4">
          <div className="w-full max-w-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setStep('layout')} className="text-[#FFB6D9] hover:text-white font-nunito text-sm flex items-center gap-1">
                ← layout
              </button>
              <div className="font-pixel text-[#FF4FA3] text-center" style={{ fontSize: '11px' }}>
                ✦ SCRAPPY PHOTOBOOTH ✦
              </div>
              <div className="font-pixel text-[#FFB6D9]" style={{ fontSize: '11px' }}>
                {capturedPhotos.length}/{requiredCount} photos
              </div>
            </div>

            {cameraError ? (
              <div className="bg-[#2B0A2E] rounded-2xl border-2 border-[#FF4FA3]/50 p-10 text-center">
                <div className="flex justify-center mb-4"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF4FA3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></div>
                <h2 className="font-pacifico text-xl text-[#FFB6D9] mb-2" style={{ fontFamily: 'Pacifico, cursive' }}>
                  oops! camera trouble
                </h2>
                <p className="font-caveat text-[#FFB6D9]/70 mb-6" style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}>
                  {cameraError}
                </p>
                <div className="flex gap-3 justify-center">
                  <button onClick={startCamera} className="btn-y2k px-6">TRY AGAIN</button>
                </div>
              </div>
            ) : (
              <div className="relative">
                {/* Camera feed */}
                <div className="relative bg-black rounded-2xl overflow-hidden border-2 border-[#FF4FA3]/30 aspect-[4/3]">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
                  />

                  {/* Flash overlay */}
                  {flashActive && (
                    <div className="absolute inset-0 bg-white animate-pulse" style={{ opacity: 0.9, zIndex: 20 }} />
                  )}

                  {/* Countdown overlay */}
                  {countdown !== null && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ zIndex: 30 }}>
                      <div
                        className="font-pixel text-white drop-shadow-lg"
                        style={{
                          fontSize: '120px',
                          lineHeight: 1,
                          textShadow: '0 0 40px #FF4FA3, 0 4px 0 #3A0030',
                          animation: 'pulse 0.9s ease-out',
                        }}
                      >
                        {countdown}
                      </div>
                    </div>
                  )}

                  {/* Not ready overlay */}
                  {!cameraReady && !cameraError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-[#1A0020]/80">
                      <div className="font-caveat text-[#FFB6D9] text-xl" style={{ fontFamily: 'Caveat, cursive' }}>
                        starting camera...
                      </div>
                    </div>
                  )}

                  {/* Photo counter badge */}
                  {cameraReady && !countdown && !isCapturing && (
                    <div className="absolute top-3 left-3 bg-black/50 rounded-full px-3 py-1 font-pixel text-white" style={{ fontSize: '10px' }}>
                      PHOTO {capturedPhotos.length + 1} OF {requiredCount}
                    </div>
                  )}
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-center gap-4 mt-5">
                  {/* Settings */}
                  <div className="flex items-center gap-2">
                    <select
                      value={countdownDuration}
                      onChange={e => setCountdownDuration(Number(e.target.value))}
                      className="bg-[#2B0A2E] border border-[#FFB6D9]/30 text-[#FFB6D9] rounded-lg px-2 py-1 font-pixel text-xs"
                      style={{ fontSize: '10px' }}
                      disabled={isCapturing}
                    >
                      <option value={3}>3s</option>
                      <option value={5}>5s</option>
                      <option value={10}>10s</option>
                    </select>
                  </div>

                  {/* Main capture button */}
                  <button
                    onClick={runCaptureSequence}
                    disabled={!cameraReady || isCapturing || capturedPhotos.length >= requiredCount}
                    className="w-20 h-20 rounded-full bg-[#FF4FA3] border-4 border-white shadow-lg hover:bg-[#e0398e] active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center"
                    style={{ boxShadow: '0 0 20px rgba(255,79,163,0.5)' }}
                  >
                    {isCapturing ? (
                      <span className="font-pixel text-white" style={{ fontSize: '10px' }}>...</span>
                    ) : (
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    )}
                  </button>

                  {/* Camera switch */}
                  <button
                    onClick={() => setFacingMode(m => m === 'user' ? 'environment' : 'user')}
                    disabled={isCapturing}
                    className="w-10 h-10 rounded-full bg-[#2B0A2E] border border-[#FFB6D9]/30 text-[#FFB6D9] flex items-center justify-center hover:bg-[#3A0030] transition-colors disabled:opacity-40"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><polyline points="23 20 23 14 17 14"/><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/></svg>
                  </button>
                </div>

                {/* Flash toggle */}
                <div className="flex items-center justify-center gap-2 mt-3">
                  <button
                    onClick={() => setEnableFlash(e => !e)}
                    className={`font-pixel text-xs px-3 py-1 rounded-full border transition-colors ${
                      enableFlash
                        ? 'bg-[#FF4FA3] border-[#FF4FA3] text-white'
                        : 'bg-transparent border-[#FFB6D9]/30 text-[#FFB6D9]/60'
                    }`}
                    style={{ fontSize: '10px' }}
                  >
                    <svg className="inline mr-1" width="11" height="11" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>FLASH {enableFlash ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Captured thumbnails */}
                {capturedPhotos.length > 0 && (
                  <div className="mt-5">
                    <div className="font-pixel text-[#FFB6D9] mb-2" style={{ fontSize: '10px' }}>
                      CAPTURED PHOTOS:
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {capturedPhotos.map((photo, i) => (
                        <div key={i} className="relative flex-shrink-0 group">
                          <img
                            src={photo}
                            alt={`Photo ${i + 1}`}
                            className="h-16 w-20 object-cover rounded-lg border-2 border-[#FFB6D9]/30"
                          />
                          <button
                            onClick={() => retakePhoto(i)}
                            disabled={isCapturing}
                            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF4FA3] rounded-full text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            ×
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 text-center font-pixel text-white bg-black/50 rounded-b-lg" style={{ fontSize: '8px' }}>
                            {i + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue button */}
                {capturedPhotos.length >= requiredCount && (
                  <button
                    onClick={() => setStep('customize')}
                    className="btn-y2k w-full py-3 mt-5 text-base"
                  >
                    DECORATE MY STRIP ✦
                  </button>
                )}
              </div>
            )}

            {/* Hidden capture canvas */}
            <canvas ref={captureCanvasRef} className="hidden" />
          </div>
        </main>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP: CUSTOMIZE
  // ─────────────────────────────────────────────────────────────────────────────
  if (step === 'customize') {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 py-6 px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <button onClick={() => setStep('camera')} className="text-[#888] hover:text-[#FF4FA3] font-nunito text-sm flex items-center gap-1">
                ← retake photos
              </button>
              <div className="font-pixel text-xs text-[#3A0030]" style={{ fontSize: '11px' }}>
                ✦ STEP 03 — DECORATE ✦
              </div>
              <button
                onClick={goToPreview}
                disabled={generating}
                className="btn-y2k py-2 px-5 text-sm"
                style={{ fontSize: '12px' }}
              >
                {generating ? 'generating...' : 'PREVIEW ✦'}
              </button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Strip preview */}
              <div className="flex-shrink-0 flex flex-col items-center">
                <div className="font-pixel text-xs text-[#888] mb-2" style={{ fontSize: '9px' }}>
                  DRAG STICKERS &amp; TEXT TO REPOSITION
                </div>
                <div
                  ref={stripPreviewRef}
                  className="relative select-none"
                  style={{
                    width: `${previewWidth}px`,
                    cursor: draggingId ? 'grabbing' : 'default',
                    boxShadow: '0 6px 18px rgba(43,10,46,.35)',
                  }}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  <canvas ref={previewCanvasRef} className="block w-full h-auto" aria-label="photo strip preview" />

                  {/* Stickers */}
                  {stickers.map(s => (
                    <div
                      key={s.id}
                      data-sticker-id={s.id}
                      onMouseDown={e => handleDragStart(e, s.id)}
                      onTouchStart={e => handleDragStart(e, s.id)}
                      className="absolute cursor-grab active:cursor-grabbing"
                      style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        width: s.size * (112 / 100),
                        height: s.size * (112 / 100),
                        transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
                        zIndex: 10,
                        userSelect: 'none',
                        filter: 'drop-shadow(0 2px 2px rgba(43,10,46,.3))',
                        outline: selectedStickerId === s.id ? '2px dashed #FF4FA3' : 'none',
                        outlineOffset: 2,
                      }}
                    >
                      <div style={{ width: '100%', height: '100%' }} className="[&>svg]:w-full [&>svg]:h-full">
                        <Sticker content={s.content} color={s.color} standalone />
                      </div>
                    </div>
                  ))}

                  {/* Text elements */}
                  {textElements.map(t => (
                    <div
                      key={t.id}
                      onMouseDown={e => handleDragStart(e, t.id)}
                      onTouchStart={e => handleDragStart(e, t.id)}
                      className="absolute cursor-grab active:cursor-grabbing whitespace-nowrap"
                      style={{
                        left: `${t.x}%`,
                        top: `${t.y}%`,
                        fontSize: t.fontSize,
                        color: t.color,
                        fontFamily: `${t.fontFamily}, cursive`,
                        transform: `translate(-50%, -50%) rotate(${t.rotation}deg)`,
                        zIndex: 10,
                        userSelect: 'none',
                        textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                      }}
                    >
                      {t.text}
                    </div>
                  ))}

                </div>
              </div>

              {/* Controls panel */}
              <div className="flex-1 space-y-4 overflow-y-auto max-h-[80vh] lg:max-h-none">

                {/* Filters */}
                <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-4">
                  <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '10px' }}>FILTERS</div>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {FILTERS.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFilter(f.id)}
                        className={`flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                          selectedFilter === f.id ? 'border-[#FF4FA3] scale-105' : 'border-[#FFB6D9]/40 hover:border-[#FF4FA3]'
                        }`}
                      >
                        <img
                          src={capturedPhotos[0]}
                          alt={f.label}
                          className="w-14 h-14 object-cover"
                          style={{ filter: f.css }}
                        />
                        <div className="text-center py-1 font-nunito text-[#888]" style={{ fontSize: '7px' }}>{f.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frames */}
                <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-4">
                  <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '10px' }}>FRAMES</div>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {FRAMES.filter(f => f.group === 'frame').map(f => (
                      <ArtChoice key={f.id} label={f.label} active={selectedFrame === f.id} onClick={() => setSelectedFrame(f.id)}>
                        <ArtThumb kind="frame" id={f.id} bgId={bgId} layout={selectedLayout} imgs={loadedImgs} magTitle={magTitle} magLines={magLines} />
                      </ArtChoice>
                    ))}
                  </div>
                </div>

                {/* Magazine covers */}
                <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-4">
                  <div className="font-pixel text-xs text-[#3A0030] mb-1" style={{ fontSize: '10px' }}>MAGAZINE COVERS</div>
                  <p className="font-nunito text-xs text-[#888] mb-3">be the cover star — works best with the magazine cover layout ✦</p>
                  <div className="grid grid-cols-3 gap-2 max-w-sm">
                    {FRAMES.filter(f => f.group === 'magazine').map(f => (
                      <ArtChoice key={f.id} label={f.label.replace('cover: ', '')} active={selectedFrame === f.id} onClick={() => setSelectedFrame(f.id)}>
                        <ArtThumb kind="frame" id={f.id} bgId={bgId} layout="cover" imgs={loadedImgs.slice(0, 1)} magTitle={magTitle} magLines={magLines} />
                      </ArtChoice>
                    ))}
                  </div>
                  {(selectedFrame.startsWith('mag-') || selectedLayout === 'friendship') && (
                    <div className="mt-3 space-y-2">
                      {selectedLayout === 'friendship' && (
                        <label className="block font-pixel text-xs text-[#3A0030]" style={{ fontSize: '9px' }}>
                          STRIP TITLE
                          <input value={stripTitle} onChange={e => setStripTitle(e.target.value.slice(0, 28))} className="input-y2k text-sm mt-1" maxLength={28} />
                        </label>
                      )}
                      {selectedFrame.startsWith('mag-') && (
                        <label className="block font-pixel text-xs text-[#3A0030]" style={{ fontSize: '9px' }}>
                          MAGAZINE NAME
                          <input value={magTitle} onChange={e => setMagTitle(e.target.value.slice(0, 14))} className="input-y2k text-sm mt-1" placeholder="sparkle" maxLength={14} />
                        </label>
                      )}
                      {selectedFrame.startsWith('mag-') && (
                        <label className="block font-pixel text-xs text-[#3A0030]" style={{ fontSize: '9px' }}>
                          COVER LINES (one per line · the last one goes big at the bottom)
                          <textarea
                            value={magLines.join('\n')}
                            onChange={e => setMagLines(e.target.value.split('\n').slice(0, 6).map(l => l.slice(0, 32)))}
                            className="input-y2k text-sm mt-1 resize-none"
                            rows={6}
                          />
                        </label>
                      )}
                    </div>
                  )}
                </div>

                {/* Backgrounds */}
                <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-4">
                  <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '10px' }}>BACKGROUNDS</div>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {BACKGROUNDS.map(b => (
                      <ArtChoice key={b.id} label={b.label} active={bgId === b.id} onClick={() => setBgId(b.id)}>
                        <ArtThumb kind="bg" id={b.id} />
                      </ArtChoice>
                    ))}
                  </div>
                </div>

                {/* Stickers */}
                <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-4">
                  <StickerDefs />
                  <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
                    <div className="font-pixel text-xs text-[#3A0030]" style={{ fontSize: '10px' }}>STICKERS &amp; GEMS</div>
                    <div className="flex rounded-full border-2 border-[#FFB6D9] overflow-hidden">
                      {(['gems', 'stickers', 'emoji'] as const).map(t => (
                        <button
                          key={t}
                          onClick={() => setStickerTab(t)}
                          className={`px-3 py-1 font-nunito font-bold text-xs ${stickerTab === t ? 'bg-[#FF4FA3] text-white' : 'bg-white text-[#3A0030]'}`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  {stickerTab === 'gems' && (
                    <>
                      <div className="flex flex-wrap gap-1.5 mb-3" role="radiogroup" aria-label="gem colour">
                        {GEM_COLORS.map(c => (
                          <button
                            key={c.id}
                            onClick={() => setGemColor(c.hex)}
                            title={c.label}
                            aria-label={c.label}
                            aria-checked={gemColor === c.hex}
                            role="radio"
                            className={`w-7 h-7 rounded-full border-2 transition-transform ${gemColor === c.hex ? 'border-[#3A0030] scale-110' : 'border-white shadow'}`}
                            style={{ background: `radial-gradient(circle at 35% 30%, #fff 0 12%, ${c.hex} 45%, #2B0A2E 130%)` }}
                          />
                        ))}
                      </div>
                      <div className="grid grid-cols-5 sm:grid-cols-9 gap-1">
                        {GEM_STICKERS.map(g => (
                          <button key={g.id} onClick={() => addSticker(`svg:${g.id}`, g.tint ? gemColor : undefined)} title={g.label} className="aspect-square p-1 rounded-lg hover:bg-[#FFB6D9]/20 hover:scale-110 transition-transform">
                            <Sticker content={`svg:${g.id}`} color={g.tint ? gemColor : undefined} />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  {stickerTab === 'stickers' && (
                    <div className="grid grid-cols-6 sm:grid-cols-9 gap-1">
                      {STICKERS.map(g => (
                        <button key={g.id} onClick={() => addSticker(`svg:${g.id}`)} title={g.label} className="aspect-square p-1 rounded-lg hover:bg-[#FFB6D9]/20 hover:scale-110 hover:-rotate-6 transition-transform">
                          <Sticker content={`svg:${g.id}`} />
                        </button>
                      ))}
                    </div>
                  )}
                  {stickerTab === 'emoji' && (
                    <div className="grid grid-cols-8 sm:grid-cols-12 gap-1">
                      {EMOJI_STICKERS.map(e => (
                        <button key={e} onClick={() => addSticker(`txt:${e}`)} className="aspect-square p-1 rounded-lg hover:bg-[#FFB6D9]/20 hover:scale-110 transition-transform">
                          <Sticker content={`txt:${e}`} />
                        </button>
                      ))}
                    </div>
                  )}

                  {stickers.find(x => x.id === selectedStickerId) && (() => {
                    const cur = stickers.find(x => x.id === selectedStickerId)!
                    return (
                      <div className="mt-3 p-3 rounded-xl bg-[#FFF0F7] border-2 border-[#FFB6D9] space-y-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 shrink-0"><Sticker content={cur.content} color={cur.color} /></div>
                          <span className="font-pixel text-[#3A0030] flex-1" style={{ fontSize: '9px' }}>SELECTED STICKER — drag it on the strip</span>
                          <button onClick={() => { setStickers(prev => [...prev.filter(x => x.id !== cur.id), cur]) }} className="font-nunito text-xs font-bold px-2 py-1 rounded-full border-2 border-[#FFB6D9] bg-white">to front</button>
                          <button onClick={() => addSticker(cur.content, cur.color)} className="font-nunito text-xs font-bold px-2 py-1 rounded-full border-2 border-[#FFB6D9] bg-white">copy</button>
                          <button onClick={() => { setStickers(prev => prev.filter(x => x.id !== cur.id)); setSelectedStickerId(null) }} className="font-nunito text-xs font-bold px-2 py-1 rounded-full border-2 border-red-200 bg-white text-red-500">delete</button>
                        </div>
                        <label className="flex items-center gap-2 font-nunito text-xs text-[#3A0030]">
                          <span className="w-12">size</span>
                          <input type="range" min={16} max={150} value={cur.size} onChange={e => updateSticker(cur.id, { size: Number(e.target.value) })} className="flex-1 accent-[#FF4FA3]" />
                        </label>
                        <label className="flex items-center gap-2 font-nunito text-xs text-[#3A0030]">
                          <span className="w-12">rotate</span>
                          <input type="range" min={-180} max={180} value={cur.rotation} onChange={e => updateSticker(cur.id, { rotation: Number(e.target.value) })} className="flex-1 accent-[#FF4FA3]" />
                        </label>
                        {stickerTintable(cur.content) && (
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-nunito text-xs text-[#3A0030] w-12">colour</span>
                            {GEM_COLORS.map(c => (
                              <button key={c.id} onClick={() => updateSticker(cur.id, { color: c.hex })} title={c.label} aria-label={c.label} className={`w-6 h-6 rounded-full border-2 ${cur.color === c.hex ? 'border-[#3A0030]' : 'border-white shadow'}`} style={{ background: c.hex }} />
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })()}
                </div>

                {/* Text */}
                <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-4">
                  <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '10px' }}>TEXT</div>
                  {addingText ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newText}
                        onChange={e => setNewText(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTextEl()}
                        placeholder="type something..."
                        className="input-y2k text-sm"
                        maxLength={40}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <select value={newTextFont} onChange={e => setNewTextFont(e.target.value)} className="input-y2k text-xs flex-1">
                          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        <input type="color" value={newTextColor} onChange={e => setNewTextColor(e.target.value)} className="w-10 h-10 rounded-lg border-2 border-[#FFB6D9]/50 cursor-pointer" />
                        <select value={newTextSize} onChange={e => setNewTextSize(Number(e.target.value))} className="input-y2k text-xs w-16">
                          {[14, 18, 22, 28, 36].map(s => <option key={s} value={s}>{s}px</option>)}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={addTextEl} className="btn-y2k text-xs py-1.5 flex-1" style={{ fontSize: '11px' }}>ADD TEXT</button>
                        <button onClick={() => setAddingText(false)} className="btn-outline-y2k text-xs py-1.5 px-3" style={{ fontSize: '11px' }}>cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <button onClick={() => setAddingText(true)} className="btn-outline-y2k text-xs py-1.5 px-4 w-full" style={{ fontSize: '11px' }}>
                        + add text
                      </button>
                      {textElements.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {textElements.map(t => (
                            <button
                              key={t.id}
                              onClick={() => setTextElements(prev => prev.filter(x => x.id !== t.id))}
                              className="font-nunito text-xs bg-red-50 text-red-400 border border-red-200 rounded-full px-2 py-0.5 hover:bg-red-100 max-w-[120px] truncate"
                              style={{ fontSize: '10px' }}
                            >
                              {t.text} ×
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={goToPreview}
              disabled={generating}
              className="btn-y2k w-full py-3 mt-6 text-base"
            >
              {generating ? 'generating preview...' : 'PREVIEW MY STRIP ✦'}
            </button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // STEP: PREVIEW + SAVE
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 py-10 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setStep('customize')} className="text-[#888] hover:text-[#FF4FA3] font-nunito text-sm flex items-center gap-1">
              ← edit
            </button>
            <div className="font-pixel text-xs text-[#3A0030]" style={{ fontSize: '11px' }}>✦ YOUR PHOTO STRIP ✦</div>
            <div />
          </div>

          {exportedUrl ? (
            <div className="text-center">
              <img
                src={exportedUrl}
                alt="Your photo strip"
                className="max-w-xs mx-auto rounded-xl shadow-xl border-2 border-[#FFB6D9]/50"
              />

              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2 mt-4 font-nunito text-sm">
                  {saveError}
                </div>
              )}

              {saved && (
                <div className="bg-green-50 border border-green-200 text-green-600 rounded-lg px-4 py-2 mt-4 font-nunito text-sm">
                  ✓ saved to your photobooth gallery!
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 mt-6 justify-center">
                <button onClick={downloadStrip} className="btn-y2k px-8 py-3">
                  DOWNLOAD ✦
                </button>
                {user ? (
                  <button
                    onClick={saveToPhotobooth}
                    disabled={saving || saved}
                    className="btn-outline-y2k px-8 py-3"
                    style={{ fontSize: '13px' }}
                  >
                    {saving ? 'saving...' : saved ? '✓ saved!' : 'SAVE TO MY PHOTOBOOTH'}
                  </button>
                ) : (
                  <Link href="/auth/signup" className="btn-outline-y2k px-8 py-3 text-sm" style={{ fontSize: '13px' }}>
                    SIGN UP TO SAVE ✦
                  </Link>
                )}
              </div>

              {saved && (
                <Link href="/photobooth/gallery" className="inline-block mt-3 font-nunito text-sm text-[#FF4FA3] hover:underline">
                  view my gallery →
                </Link>
              )}

              <div className="mt-6">
                <button onClick={resetAll} className="font-nunito text-sm text-[#888] hover:text-[#FF4FA3] transition-colors">
                  take another photo strip →
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="font-caveat text-[#888] text-xl" style={{ fontFamily: 'Caveat, cursive' }}>
                generating your strip... ✦
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

// ─── Art pickers ─────────────────────────────────────────────────────────────

function ArtChoice({ label, active, onClick, children }: { label: string; active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={`rounded-lg overflow-hidden border-2 bg-[#f7eaf1] transition-all text-left ${
        active ? 'border-[#FF4FA3] ring-2 ring-[#FF4FA3]/50 scale-[1.04]' : 'border-[#FFB6D9]/60 hover:border-[#FF4FA3]'
      }`}
    >
      <div className="aspect-[3/4] flex items-center justify-center overflow-hidden">{children}</div>
      <div className="font-nunito font-bold text-[#3A0030] text-center truncate px-1 py-0.5 bg-white" style={{ fontSize: '9px' }}>{label}</div>
    </button>
  )
}

function ArtThumb(props:
  | { kind: 'bg'; id: string }
  | { kind: 'frame'; id: string; bgId: string; layout: LayoutId; imgs: HTMLImageElement[]; magTitle: string; magLines: string[] }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const deps = props.kind === 'bg' ? [props.id] : [props.id, props.bgId, props.layout, props.imgs, props.magTitle, props.magLines]
  useEffect(() => {
    const c = ref.current
    if (!c) return
    if (props.kind === 'bg') {
      c.width = 90
      c.height = 120
      const ctx = c.getContext('2d')!
      ;(BACKGROUNDS.find(b => b.id === props.id) ?? BACKGROUNDS[0]).draw(ctx, 90, 120, 0.45)
    } else {
      const count = props.layout === 'cover' ? 1 : Math.max(1, Math.min(props.imgs.length || 3, 6))
      renderStrip(c, {
        layout: props.layout, count, filterCss: 'none', bgId: props.bgId, frameId: props.id,
        magTitle: props.magTitle, magLines: props.magLines, imgs: props.imgs, scale: 0.3,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
  return <canvas ref={ref} className="max-w-full max-h-full" style={{ display: 'block' }} />
}
