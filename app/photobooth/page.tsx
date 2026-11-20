'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/useAuth'
import { createClient } from '@/lib/supabase-client'
import Footer from '@/components/layout/Footer'

// ─── Types ───────────────────────────────────────────────────────────────────

type Step = 'landing' | 'layout' | 'camera' | 'customize' | 'preview'
type LayoutId = 'classic' | 'mini' | 'double' | 'friendship' | 'grid' | 'collage'

interface StickerEl {
  id: string
  symbol: string
  x: number // % of strip width
  y: number // % of strip height
  size: number
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

const FRAMES: { id: string; label: string; color: string; width: number }[] = [
  { id: 'none', label: 'None', color: 'transparent', width: 0 },
  { id: 'pink-glitter', label: 'Pink Glitter', color: '#FF4FA3', width: 8 },
  { id: 'chrome', label: 'Chrome Y2K', color: '#C0C0C0', width: 8 },
  { id: 'baby-blue', label: 'Baby Blue', color: '#89CFF0', width: 8 },
  { id: 'purple', label: 'Purple Dream', color: '#9B59B6', width: 8 },
  { id: 'classic-white', label: 'Classic White', color: '#FFFFFF', width: 12 },
  { id: 'hot-pink', label: 'Hot Pink', color: '#FF1493', width: 8 },
  { id: 'vintage', label: 'Vintage Film', color: '#8B7355', width: 8 },
]

const BG_COLORS = [
  { hex: '#FFB6D9', label: 'Pink' },
  { hex: '#E6D0FF', label: 'Lavender' },
  { hex: '#B9E0FF', label: 'Baby Blue' },
  { hex: '#FFF8ED', label: 'Cream' },
  { hex: '#FFFFFF', label: 'White' },
  { hex: '#1A0020', label: 'Dark' },
  { hex: '#FFD6EC', label: 'Blush' },
  { hex: '#D6FFE8', label: 'Mint' },
]

const STICKER_LIBRARY = [
  '♡', '✦', '★', '✿', '◆', '🌸', '🦋', '🍒',
  '🎀', '💫', '⭐', '🌙', '📷', '💕', '🌈', '✨',
  '🎀', '💎', '🌺', '🫧', '🫶', '💌', '🎞️', '🪄',
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

// ─── Layout Preview SVG ───────────────────────────────────────────────────────

function LayoutPreview({ id }: { id: LayoutId }) {
  const base = 'fill-[#FFB6D9]/40 stroke-[#FF4FA3]/60 stroke-[0.5]'
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
  const [selectedFrame, setSelectedFrame] = useState('pink-glitter')
  const [bgColor, setBgColor] = useState('#FFB6D9')
  const [stickers, setStickers] = useState<StickerEl[]>([])
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

  function addSticker(symbol: string) {
    setStickers(prev => [...prev, {
      id: Date.now().toString(),
      symbol, x: 50, y: 50,
      size: 28, rotation: 0,
    }])
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
  async function generateExport(): Promise<string> {
    const scale = 2
    const W = 400 * scale
    const PAD = 10 * scale

    const filter = FILTERS.find(f => f.id === selectedFilter)!
    const frame = FRAMES.find(f => f.id === selectedFrame)!

    const imgs = await Promise.all(capturedPhotos.map(loadImage))
    if (!imgs.length) throw new Error('No photos')

    const imgAspect = imgs[0].height / imgs[0].width
    const photoW = W - PAD * 2
    const photoH = Math.round(photoW * Math.min(imgAspect, 1.1))

    let canvasH = 0
    const positions: { x: number; y: number; w: number; h: number }[] = []

    if (selectedLayout === 'grid') {
      const cw = (W - PAD * 3) / 2
      const ch = Math.round(cw * Math.min(imgAspect, 1.0))
      canvasH = PAD * 3 + ch * 2
      imgs.slice(0, 4).forEach((_, i) => {
        positions.push({ x: PAD + (i % 2) * (cw + PAD), y: PAD + Math.floor(i / 2) * (ch + PAD), w: cw, h: ch })
      })
    } else if (selectedLayout === 'collage') {
      const cw = (W - PAD * 3) / 2
      const ch = Math.round(cw * Math.min(imgAspect, 1.0))
      const rows = Math.ceil(imgs.length / 2)
      canvasH = PAD + rows * (ch + PAD)
      imgs.forEach((_, i) => {
        positions.push({ x: PAD + (i % 2) * (cw + PAD), y: PAD + Math.floor(i / 2) * (ch + PAD), w: cw, h: ch })
      })
    } else if (selectedLayout === 'friendship') {
      const hdrH = 56 * scale
      canvasH = PAD + hdrH + PAD + imgs.length * (photoH + PAD)
      imgs.forEach((_, i) => {
        positions.push({ x: PAD, y: PAD + hdrH + PAD + i * (photoH + PAD), w: photoW, h: photoH })
      })
    } else {
      canvasH = PAD + imgs.length * (photoH + PAD)
      imgs.forEach((_, i) => {
        positions.push({ x: PAD, y: PAD + i * (photoH + PAD), w: photoW, h: photoH })
      })
    }

    const footerH = 28 * scale
    canvasH += footerH

    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = canvasH
    const ctx = canvas.getContext('2d')!

    // Background
    ctx.fillStyle = bgColor
    ctx.fillRect(0, 0, W, canvasH)

    // Friendship header
    if (selectedLayout === 'friendship') {
      const hdrH = 56 * scale
      ctx.fillStyle = frame.id !== 'none' ? frame.color : '#FF4FA3'
      ctx.font = `bold ${18 * scale}px Pacifico, cursive`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, PAD, W, hdrH)
      ctx.fillStyle = '#3A0030'
      ctx.fillText('friendship strip ♡', W / 2, PAD + hdrH / 2)
    }

    // Photos with filter
    if (filter.css !== 'none') ctx.filter = filter.css
    imgs.forEach((img, i) => {
      if (!positions[i]) return
      const { x, y, w, h } = positions[i]
      const ia = img.width / img.height
      const sa = w / h
      let sx = 0, sy = 0, sw = img.width, sh = img.height
      if (ia > sa) { sw = img.height * sa; sx = (img.width - sw) / 2 }
      else { sh = img.width / sa; sy = (img.height - sh) / 2 }
      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
    })
    ctx.filter = 'none'

    // Frame border
    if (frame.id !== 'none') {
      ctx.strokeStyle = frame.color
      ctx.lineWidth = frame.width * scale
      ctx.strokeRect(frame.width * scale / 2, frame.width * scale / 2, W - frame.width * scale, canvasH - frame.width * scale)
    }

    // Stickers
    stickers.forEach(s => {
      ctx.save()
      ctx.translate((s.x / 100) * W, (s.y / 100) * canvasH)
      ctx.rotate((s.rotation * Math.PI) / 180)
      ctx.font = `${s.size * scale}px serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(s.symbol, 0, 0)
      ctx.restore()
    })

    // Text elements
    textElements.forEach(t => {
      ctx.save()
      ctx.translate((t.x / 100) * W, (t.y / 100) * canvasH)
      ctx.rotate((t.rotation * Math.PI) / 180)
      ctx.font = `${t.fontSize * scale}px ${t.fontFamily}, cursive`
      ctx.fillStyle = t.color
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(t.text, 0, 0)
      ctx.restore()
    })

    // Watermark
    ctx.fillStyle = 'rgba(0,0,0,0.22)'
    ctx.font = `${8 * scale}px monospace`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText('✦ made with SCRAPPY ✦', W / 2, canvasH - 5 * scale)

    return canvas.toDataURL('image/png', 0.95)
  }

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
        bg_color: bgColor,
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
    setTextElements([])
    setSelectedFilter('none')
    setSelectedFrame('pink-glitter')
    setBgColor('#FFB6D9')
    setExportedUrl(null)
    setSaved(false)
    setSaveError('')
    setStep('layout')
  }

  // ─── Filter CSS helper ───
  const filterCss = FILTERS.find(f => f.id === selectedFilter)?.css ?? 'none'
  const frameStyle = FRAMES.find(f => f.id === selectedFrame)!

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
            <div className="absolute bottom-8 left-16 text-xl opacity-25">📷</div>
            <div className="absolute bottom-6 right-12 text-2xl opacity-25">🌸</div>
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
                📷 LET&apos;S TAKE PICTURES!
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
                  { icon: '🖼️', label: 'Choose layout', n: '01' },
                  { icon: '📷', label: 'Strike a pose', n: '02' },
                  { icon: '🎨', label: 'Decorate', n: '03' },
                  { icon: '💾', label: 'Save & share', n: '04' },
                ].map(s => (
                  <div key={s.n} className="flex flex-col items-center gap-1">
                    <div className="text-3xl">{s.icon}</div>
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
                <div className="text-5xl mb-4">📷</div>
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
                      <span className="text-3xl">📷</span>
                    )}
                  </button>

                  {/* Camera switch */}
                  <button
                    onClick={() => setFacingMode(m => m === 'user' ? 'environment' : 'user')}
                    disabled={isCapturing}
                    className="w-10 h-10 rounded-full bg-[#2B0A2E] border border-[#FFB6D9]/30 text-[#FFB6D9] flex items-center justify-center hover:bg-[#3A0030] transition-colors disabled:opacity-40"
                  >
                    🔄
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
                    ⚡ FLASH {enableFlash ? 'ON' : 'OFF'}
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
    const isGrid = selectedLayout === 'grid' || selectedLayout === 'collage'

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
                    background: bgColor,
                    border: frameStyle.id !== 'none' ? `${frameStyle.width}px solid ${frameStyle.color}` : 'none',
                    width: isGrid ? '260px' : '180px',
                    cursor: draggingId ? 'grabbing' : 'default',
                  }}
                  onMouseMove={handleDragMove}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchMove={handleDragMove}
                  onTouchEnd={handleDragEnd}
                >
                  {/* Friendship header */}
                  {selectedLayout === 'friendship' && (
                    <div className="text-center py-2 font-caveat text-[#3A0030] border-b border-black/10" style={{ fontFamily: 'Caveat, cursive', fontSize: '14px' }}>
                      friendship strip ♡
                    </div>
                  )}

                  {/* Photos */}
                  {isGrid ? (
                    <div className="grid grid-cols-2 gap-1 p-1">
                      {capturedPhotos.map((p, i) => (
                        <img key={i} src={p} alt="" className="w-full object-cover" style={{ filter: filterCss, aspectRatio: '1 / 1' }} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 p-1">
                      {capturedPhotos.map((p, i) => (
                        <img key={i} src={p} alt="" className="w-full object-cover" style={{ filter: filterCss, aspectRatio: '4 / 3' }} />
                      ))}
                    </div>
                  )}

                  {/* Stickers */}
                  {stickers.map(s => (
                    <div
                      key={s.id}
                      onMouseDown={e => handleDragStart(e, s.id)}
                      onTouchStart={e => handleDragStart(e, s.id)}
                      className="absolute cursor-grab active:cursor-grabbing"
                      style={{
                        left: `${s.x}%`,
                        top: `${s.y}%`,
                        fontSize: s.size,
                        transform: `translate(-50%, -50%) rotate(${s.rotation}deg)`,
                        zIndex: 10,
                        userSelect: 'none',
                      }}
                    >
                      {s.symbol}
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

                  {/* Watermark */}
                  <div className="text-center py-1 font-pixel text-black/20" style={{ fontSize: '7px' }}>
                    ✦ made with SCRAPPY ✦
                  </div>
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

                {/* Frame + Background */}
                <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-4">
                  <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '10px' }}>FRAME</div>
                  <div className="flex gap-2 flex-wrap mb-4">
                    {FRAMES.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFrame(f.id)}
                        title={f.label}
                        className={`w-9 h-9 rounded-lg border-2 transition-all ${
                          selectedFrame === f.id ? 'scale-110 shadow-md' : 'hover:scale-105'
                        }`}
                        style={{
                          background: f.id === 'none' ? '#f0f0f0' : f.color,
                          borderColor: selectedFrame === f.id ? '#FF4FA3' : '#FFB6D9',
                          outline: f.id === 'none' ? '1px dashed #ccc' : 'none',
                        }}
                      />
                    ))}
                  </div>

                  <div className="font-pixel text-xs text-[#3A0030] mb-2" style={{ fontSize: '10px' }}>BACKGROUND</div>
                  <div className="flex gap-2 flex-wrap">
                    {BG_COLORS.map(c => (
                      <button
                        key={c.hex}
                        onClick={() => setBgColor(c.hex)}
                        title={c.label}
                        className={`w-9 h-9 rounded-full border-2 transition-all ${
                          bgColor === c.hex ? 'scale-110 shadow-md border-[#FF4FA3]' : 'border-[#FFB6D9]/50 hover:scale-105'
                        }`}
                        style={{ background: c.hex }}
                      />
                    ))}
                  </div>
                </div>

                {/* Stickers */}
                <div className="bg-white rounded-2xl border-2 border-[#FFB6D9]/50 p-4">
                  <div className="font-pixel text-xs text-[#3A0030] mb-3" style={{ fontSize: '10px' }}>STICKERS</div>
                  <div className="grid grid-cols-8 gap-1">
                    {STICKER_LIBRARY.map((symbol, i) => (
                      <button
                        key={i}
                        onClick={() => addSticker(symbol)}
                        className="text-xl p-1.5 rounded-lg hover:bg-[#FFB6D9]/20 transition-colors"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                  {stickers.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {stickers.map(s => (
                        <button
                          key={s.id}
                          onClick={() => setStickers(prev => prev.filter(x => x.id !== s.id))}
                          className="font-nunito text-xs bg-red-50 text-red-400 border border-red-200 rounded-full px-2 py-0.5 hover:bg-red-100"
                          style={{ fontSize: '10px' }}
                        >
                          {s.symbol} ×
                        </button>
                      ))}
                    </div>
                  )}
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
