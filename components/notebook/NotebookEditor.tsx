'use client'

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type React from 'react'
import { createPortal } from 'react-dom'
import { TEMPLATES } from '@/lib/types'
import {
  FONTS, PAGE_H, PAGE_W, PAPERS, PAPER_COLORS, SPREAD_W, SWATCHES, TAPES, TAPE_COLORS,
  addTo, blankPage, compressImage, makeImage, makeQuestion, starterCover, makeShape, makeSticker, makeTape, makeText,
  paperStyle, pageBackground, SPIRAL_COLORS, hasTransparency,
  type ElementProps, type NbElement, type NbPage, type PaperId,
} from '@/lib/notebook'
import { BACKGROUNDS as ART_BACKGROUNDS } from '@/lib/photoboothArt'
import {
  FRAME_ASSETS, FRAME_CATEGORIES, STICKER_ASSETS, STICKER_CATEGORIES, assetThumb,
  type FrameCategory, type StickerCategory,
} from '@/lib/assetLibrary'
import NotebookViewer from './NotebookViewer'
import ElementView, { QuestionView, textBoxStyle } from './ElementView'
import StaticSpread, { CoverFrame, SpreadFrame, StaticCover, placed, sortedSpreadElements } from './Spread'
import { EMOJI_STICKERS, GEM_STICKERS, STICKERS, Sticker, stickerTintable } from './Stickers'

type Panel = 'library' | 'frames' | 'photos' | 'text' | 'stickers' | 'tape' | 'shapes' | 'backgrounds' | 'questions'
type Sel = { page: number; id: string } | null

const IcoCam = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>

const PANELS: { id: Panel; icon: React.ReactNode; label: string; color: string }[] = [
  { id: 'library', icon: '♦', label: 'objects', color: '#FF2E93' },
  { id: 'frames', icon: '▣', label: 'frames', color: '#1D9BF0' },
  { id: 'photos', icon: <IcoCam />, label: 'photos', color: '#14B8A6' },
  { id: 'text', icon: 'Aa', label: 'text', color: '#7C4DDB' },
  { id: 'stickers', icon: '★', label: 'doodles', color: '#F59E0B' },
  { id: 'tape', icon: '▤', label: 'tape', color: '#EC4899' },
  { id: 'shapes', icon: '◆', label: 'shapes', color: '#22C55E' },
  { id: 'backgrounds', icon: '▦', label: 'bg', color: '#0EA5E9' },
  { id: 'questions', icon: '?', label: 'Q&A', color: '#A855F7' },
]

const TEXT_FX: { id: NonNullable<ElementProps['textFx']>; label: string; color: string; gradTo?: string; font: string }[] = [
  { id: 'glitter', label: 'glitter', color: '#FF2E93', gradTo: '#FFD1E8', font: 'chango' },
  { id: 'chrome', label: 'chrome', color: '#C7CCD6', gradTo: '#FF4FA3', font: 'chango' },
  { id: 'outline', label: 'bubble', color: '#6FE3FF', font: 'chango' },
  { id: 'sticker', label: 'sticker', color: '#7C4DDB', font: 'cherry' },
  { id: 'gradient', label: 'gradient', color: '#FF4FA3', gradTo: '#7C4DDB', font: 'fredoka' },
  { id: 'shadow', label: 'pop shadow', color: '#FFFFFF', gradTo: '#FF2E93', font: 'chango' },
]

interface Props {
  pages: NbPage[]
  onChange: (next: NbPage[] | ((prev: NbPage[]) => NbPage[])) => void
  title: string
  onTitleChange: (t: string) => void
  templateId?: string
  /** Upload a compressed data URL and return a hosted URL. If omitted or it
   *  throws, the data URL is kept and uploaded at save time. */
  uploadImage?: (dataUrl: string) => Promise<string>
  actions?: React.ReactNode
}

export default function NotebookEditor({ pages, onChange, title, onTitleChange, templateId, uploadImage, actions }: Props) {
  // ── history ──────────────────────────────────────────────────────────
  const pagesRef = useRef(pages)
  useLayoutEffect(() => {
    pagesRef.current = pages
  }, [pages])
  const past = useRef<NbPage[][]>([])
  const future = useRef<NbPage[][]>([])
  const lastKey = useRef<{ key: string; t: number } | null>(null)
  const [hist, setHist] = useState({ past: 0, future: 0 })
  const bump = useCallback(() => setHist({ past: past.current.length, future: future.current.length }), [])

  const commit = useCallback(
    (next: NbPage[], key?: string) => {
      const now = Date.now()
      const coalesce = key && lastKey.current?.key === key && now - lastKey.current.t < 900
      if (!coalesce) {
        past.current.push(pagesRef.current)
        if (past.current.length > 100) past.current.shift()
      }
      lastKey.current = key ? { key, t: now } : null
      future.current = []
      pagesRef.current = next
      onChange(next)
      bump()
    },
    [onChange, bump],
  )
  const live = useCallback(
    (next: NbPage[]) => {
      pagesRef.current = next
      onChange(next)
    },
    [onChange],
  )
  const pushSnapshot = useCallback((snap: NbPage[]) => {
    past.current.push(snap)
    future.current = []
    lastKey.current = null
    bump()
  }, [bump])
  const undo = useCallback(() => {
    const prev = past.current.pop()
    if (!prev) return
    future.current.push(pagesRef.current)
    lastKey.current = null
    pagesRef.current = prev
    onChange(prev)
    bump()
  }, [onChange, bump])
  const redo = useCallback(() => {
    const nxt = future.current.pop()
    if (!nxt) return
    past.current.push(pagesRef.current)
    lastKey.current = null
    pagesRef.current = nxt
    onChange(nxt)
    bump()
  }, [onChange, bump])

  // ── view state ───────────────────────────────────────────────────────
  const [spreadState, setSpread] = useState(-1) // -1 = front cover (when there is one)
  const [activePage, setActivePage] = useState(0)
  const [sel, setSel] = useState<Sel>(null)
  const [editing, setEditing] = useState<string | null>(null)
  const [panel, setPanel] = useState<Panel | null>('stickers')
  const [fullscreen, setFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [previewing, setPreviewing] = useState(false)
  const [exporting, setExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)
  const bgFileRef = useRef<HTMLInputElement>(null)
  const stickerFileRef = useRef<HTMLInputElement>(null)
  const [libCat, setLibCat] = useState<StickerCategory | 'all'>('all')
  const [frameCat, setFrameCat] = useState<FrameCategory | 'all'>('all')
  const [bgTarget, setBgTarget] = useState<'left' | 'right' | 'both'>('both')
  const [guides, setGuides] = useState<{ v?: number; h?: number }>({})
  const [uploads, setUploads] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [notice, setNotice] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const clipboard = useRef<NbElement | null>(null)

  const hasCover = !!pages[0]?.cover
  const spiral = hasCover ? pages[0].spiral : undefined
  const off = hasCover ? 1 : 0
  const spreads = Math.max(1, Math.ceil((pages.length - off) / 2))
  const onCover = hasCover && spreadState < 0
  const spread = Math.max(0, Math.min(spreadState, spreads - 1))
  const leftIdx = off + spread * 2
  const rightIdx = leftIdx + 1
  const left = pages[leftIdx]
  const right = pages[rightIdx]

  const selected = useMemo(() => {
    if (!sel) return null
    return pages[sel.page]?.elements.find((e) => e.id === sel.id) ?? null
  }, [sel, pages])

  // ── canvas scale ─────────────────────────────────────────────────────
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ w: 0, h: 0 })
  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setStage({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [fullscreen])
  const fitScale = stage.w
    ? Math.min(1.25, (stage.w - 48) / (SPREAD_W + 24), fullscreen ? (stage.h - 40) / (PAGE_H + 30) : 9)
    : 0
  const scale = fitScale * zoom

  // ── export / background helpers ─────────────────────────────────────
  async function downloadSpread() {
    setExporting(true)
    try {
      await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)))
      const node = exportRef.current
      if (!node) throw new Error('no export node')
      const { toPng } = await import('html-to-image')
      const url = await toPng(node, { pixelRatio: 2, cacheBust: true, backgroundColor: '#f7eaf1' })
      const a = document.createElement('a')
      a.href = url
      a.download = `${(title || 'scrappy-page').replace(/[^a-z0-9-_ ]/gi, '').trim() || 'scrappy-page'}-${spread * 2 + 1}-${spread * 2 + 2}.png`
      a.click()
    } catch {
      setNotice("couldn't make the image — try again ✦")
    }
    setExporting(false)
  }

  const bgIdxs = onCover ? [0] : bgTarget === 'left' ? [leftIdx] : bgTarget === 'right' ? [rightIdx] : [leftIdx, rightIdx]

  const MAX_STICKER_MB = 5
  async function handleStickerFiles(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    let warnedOpaque = false
    for (const f of Array.from(files).slice(0, 8)) {
      if (!/^image\/(png|webp|gif|jpeg)$/.test(f.type)) {
        setNotice(`${f.name}: use a PNG, WebP, GIF or JPG image`)
        continue
      }
      if (f.size > MAX_STICKER_MB * 1024 * 1024) {
        setNotice(`${f.name} is ${(f.size / 1024 / 1024).toFixed(1)} MB — stickers can be up to ${MAX_STICKER_MB} MB`)
        continue
      }
      try {
        let url = await compressImage(f, 800, 0.9)
        const transparent = await hasTransparency(url)
        const dims = await new Promise<{ w: number; h: number }>((res) => {
          const im = new Image()
          im.onload = () => res({ w: im.width, h: im.height })
          im.onerror = () => res({ w: 1, h: 1 })
          im.src = url
        })
        if (uploadImage) {
          try { url = await uploadImage(url) } catch { /* keep inline; uploads on save */ }
        }
        const aspect = dims.w / Math.max(1, dims.h)
        const size = 130
        add({ ...makeSticker(`url:${url}`), w: Math.round(aspect >= 1 ? size : size * aspect), h: Math.round(aspect >= 1 ? size / aspect : size), props: { shadow: transparent } })
        if (!transparent && !warnedOpaque) {
          warnedOpaque = true
          setNotice('tip: that image has no transparent background, so it shows as a rectangle. A PNG cutout looks more like a real sticker ✦')
        }
      } catch {
        setNotice(`couldn't read ${f.name}`)
      }
    }
    setBusy(false)
  }

  const myStickers = Array.from(new Set(pages.flatMap((p) => p.elements.filter((e) => e.type === 'sticker' && e.content.startsWith('url:')).map((e) => e.content))))

  async function handleBgFile(files: FileList | null) {
    const f = files?.[0]
    if (!f || !f.type.startsWith('image/')) return
    setBusy(true)
    try {
      let url = await compressImage(f, 1600, 0.85)
      if (uploadImage) {
        try { url = await uploadImage(url) } catch { setNotice('background saved locally — it uploads when you save ✦') }
      }
      setPaper(bgIdxs, { bgImage: url, bgScale: 1 })
    } catch {
      setNotice("couldn't read that image")
    }
    setBusy(false)
  }

  // ── element helpers ──────────────────────────────────────────────────
  const mapEl = useCallback(
    (pageIdx: number, id: string, fn: (el: NbElement) => NbElement) =>
      pagesRef.current.map((p, i) => (i === pageIdx ? { ...p, elements: p.elements.map((e) => (e.id === id ? fn(e) : e)) } : p)),
    [],
  )
  const setProps = (patch: Partial<ElementProps>, key?: string) => {
    if (!sel) return
    commit(mapEl(sel.page, sel.id, (e) => ({ ...e, props: { ...e.props, ...patch } })), key)
  }
  const setEl = (patch: Partial<NbElement>, key?: string) => {
    if (!sel) return
    commit(mapEl(sel.page, sel.id, (e) => ({ ...e, ...patch })), key)
  }

  function ensurePage(idx: number, list: NbPage[]) {
    if (list[idx]) return list
    const base = list[list.length - 1]
    const next = [...list]
    while (!next[idx]) next.push(blankPage(base?.color, base?.paper))
    return next
  }

  function add(el: Omit<NbElement, 'id' | 'z'>, opts: { center?: boolean } = { center: true }) {
    const pageIdx = onCover ? 0 : activePage >= leftIdx && activePage <= rightIdx ? activePage : leftIdx
    let list = ensurePage(pageIdx, pagesRef.current)
    const jitter = () => Math.round((Math.random() - 0.5) * 60)
    const placedEl = opts.center
      ? { ...el, x: Math.round(PAGE_W / 2 - el.w / 2 + jitter()), y: Math.round(PAGE_H / 2 - el.h / 2 + jitter()) }
      : el
    const res = addTo(list[pageIdx], placedEl)
    list = list.map((p, i) => (i === pageIdx ? res.page : p))
    commit(list)
    setSel({ page: pageIdx, id: res.id })
    setEditing(null)
  }

  function removeSelected() {
    if (!sel) return
    commit(pagesRef.current.map((p, i) => (i === sel.page ? { ...p, elements: p.elements.filter((e) => e.id !== sel.id) } : p)))
    setSel(null)
    setEditing(null)
  }

  function duplicateSelected(src = selected, pageIdx = sel?.page) {
    if (!src || pageIdx === undefined) return
    const page = pagesRef.current[pageIdx]
    const res = addTo(page, { ...structuredClone(src), x: src.x + 18, y: src.y + 18 })
    commit(pagesRef.current.map((p, i) => (i === pageIdx ? res.page : p)))
    setSel({ page: pageIdx, id: res.id })
  }

  function layer(dir: 'up' | 'down' | 'top' | 'bottom') {
    if (!sel || !selected) return
    const els = pagesRef.current[sel.page].elements
    const zs = els.map((e) => e.z)
    const z =
      dir === 'top' ? Math.max(...zs) + 1 : dir === 'bottom' ? Math.min(...zs) - 1 : dir === 'up' ? selected.z + 1.5 : selected.z - 1.5
    // renormalise
    const reordered = els
      .map((e) => (e.id === sel.id ? { ...e, z } : e))
      .sort((a, b) => a.z - b.z)
      .map((e, i) => ({ ...e, z: i + 1 }))
    commit(pagesRef.current.map((p, i) => (i === sel.page ? { ...p, elements: reordered } : p)))
  }

  // ── photos ───────────────────────────────────────────────────────────
  const fileRef = useRef<HTMLInputElement>(null)
  const fillTarget = useRef<Sel>(null)

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return
    setBusy(true)
    const urls: string[] = []
    for (const f of Array.from(files).slice(0, 12)) {
      if (!f.type.startsWith('image/')) continue
      try {
        let url = await compressImage(f)
        if (uploadImage) {
          try {
            url = await uploadImage(url)
          } catch {
            setNotice('photo saved locally — it will upload when you save ✦')
          }
        }
        urls.push(url)
      } catch {
        setNotice("couldn't read one of those images")
      }
    }
    setBusy(false)
    if (!urls.length) return
    setUploads((u) => [...urls, ...u])
    const target = fillTarget.current
    fillTarget.current = null
    if (target) {
      commit(mapEl(target.page, target.id, (e) => ({ ...e, content: urls[0] })))
      setSel(target)
      return
    }
    if (selected?.type === 'image' && sel && !selected.content) {
      commit(mapEl(sel.page, sel.id, (e) => ({ ...e, content: urls[0] })))
      return
    }
    urls.slice(0, 4).forEach((u) => add(makeImage(u, 'polaroid')))
  }

  function pickPhotoFor(target: Sel) {
    fillTarget.current = target
    fileRef.current?.click()
  }

  const knownPhotos = useMemo(() => {
    const set = new Set(uploads)
    pages.forEach((p) => p.elements.forEach((e) => e.type === 'image' && e.content && set.add(e.content)))
    return Array.from(set)
  }, [uploads, pages])

  // ── keyboard ─────────────────────────────────────────────────────────
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement
      const typing = t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key.toLowerCase() === 'z' && !typing) {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (mod && e.key.toLowerCase() === 'y' && !typing) {
        e.preventDefault()
        redo()
        return
      }
      if (typing) {
        if (e.key === 'Escape') (t as HTMLInputElement).blur()
        return
      }
      if (e.key === 'Escape') {
        setSel(null)
        setEditing(null)
        if (fullscreen) setFullscreen(false)
      }
      if (!sel || !selected) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        removeSelected()
      } else if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault()
        duplicateSelected()
      } else if (mod && e.key.toLowerCase() === 'c') {
        clipboard.current = structuredClone(selected)
      } else if (mod && e.key.toLowerCase() === 'v' && clipboard.current) {
        e.preventDefault()
        duplicateSelected(clipboard.current, sel.page)
      } else if (e.key.startsWith('Arrow') && !selected.props.locked) {
        e.preventDefault()
        const d = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0
        const dy = e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0
        setEl({ x: selected.x + dx, y: selected.y + dy }, `nudge-${selected.id}`)
      } else if (e.key === 'Enter' && (selected.type === 'text' || selected.type === 'question')) {
        e.preventDefault()
        setEditing(selected.id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  // ── pointer interactions ─────────────────────────────────────────────
  type Drag =
    | { kind: 'move'; page: number; id: string; sx: number; sy: number; ox: number; oy: number; snap: NbPage[]; moved: boolean }
    | { kind: 'resize'; page: number; id: string; sx: number; sy: number; hx: number; hy: number; o: NbElement; snap: NbPage[]; keep: boolean }
    | { kind: 'rotate'; page: number; id: string; cx: number; cy: number; a0: number; r0: number; snap: NbPage[] }
  const drag = useRef<Drag | null>(null)

  function startMove(e: React.PointerEvent, pageIdx: number, el: NbElement) {
    if (e.button !== 0) return
    e.stopPropagation()
    setSel({ page: pageIdx, id: el.id })
    setActivePage(pageIdx)
    if (editing === el.id) return
    if (editing) setEditing(null)
    if (el.props.locked) return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    drag.current = { kind: 'move', page: pageIdx, id: el.id, sx: e.clientX, sy: e.clientY, ox: el.x, oy: el.y, snap: pagesRef.current, moved: false }
  }

  function startResize(e: React.PointerEvent, pageIdx: number, el: NbElement, hx: number, hy: number) {
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const keep = (hx !== 0 && hy !== 0) && (el.type === 'sticker' || el.type === 'image' || el.type === 'text')
    drag.current = { kind: 'resize', page: pageIdx, id: el.id, sx: e.clientX, sy: e.clientY, hx, hy, o: el, snap: pagesRef.current, keep }
  }

  function startRotate(e: React.PointerEvent, pageIdx: number, el: NbElement) {
    e.stopPropagation()
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const box = (e.currentTarget as HTMLElement).closest('[data-el]')!.getBoundingClientRect()
    const cx = box.left + box.width / 2
    const cy = box.top + box.height / 2
    drag.current = { kind: 'rotate', page: pageIdx, id: el.id, cx, cy, a0: Math.atan2(e.clientY - cy, e.clientX - cx), r0: el.rotation, snap: pagesRef.current }
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current
    if (!d || !scale) return
    if (d.kind === 'move') {
      const dx = (e.clientX - d.sx) / scale
      const dy = (e.clientY - d.sy) / scale
      if (!d.moved && Math.hypot(dx, dy) < 2) return
      d.moved = true
      const el = d.snap[d.page].elements.find((x) => x.id === d.id)!
      let nx = d.ox + dx
      let ny = d.oy + dy
      // snap element centre to page centre lines
      const g: { v?: number; h?: number } = {}
      const cx = nx + el.w / 2
      const cy = ny + el.h / 2
      if (Math.abs(cx - PAGE_W / 2) < 6 / scale) {
        nx = PAGE_W / 2 - el.w / 2
        g.v = (d.page % 2) * PAGE_W + PAGE_W / 2
      }
      if (Math.abs(cy - PAGE_H / 2) < 6 / scale) {
        ny = PAGE_H / 2 - el.h / 2
        g.h = PAGE_H / 2
      }
      setGuides(g)
      live(mapEl(d.page, d.id, (x) => ({ ...x, x: Math.round(nx), y: Math.round(ny) })))
    } else if (d.kind === 'resize') {
      const o = d.o
      const rad = (o.rotation * Math.PI) / 180
      const gx = (e.clientX - d.sx) / scale
      const gy = (e.clientY - d.sy) / scale
      // pointer delta in the element's local (unrotated) frame
      const lx = gx * Math.cos(rad) + gy * Math.sin(rad)
      const ly = -gx * Math.sin(rad) + gy * Math.cos(rad)
      const min = 20
      let w = d.hx ? Math.max(min, o.w + d.hx * lx) : o.w
      let h = d.hy ? Math.max(min, o.h + d.hy * ly) : o.h
      if (d.keep || e.shiftKey) {
        const f = Math.max(w / o.w, h / o.h)
        w = Math.max(min, o.w * f)
        h = Math.max(min, o.h * f)
      }
      // keep the opposite edge/corner fixed
      const dwx = ((w - o.w) / 2) * d.hx
      const dhy = ((h - o.h) / 2) * d.hy
      const ocx = o.x + o.w / 2
      const ocy = o.y + o.h / 2
      const ncx = ocx + dwx * Math.cos(rad) - dhy * Math.sin(rad)
      const ncy = ocy + dwx * Math.sin(rad) + dhy * Math.cos(rad)
      const textScale = o.type === 'text' && d.keep ? w / o.w : 1
      live(
        mapEl(d.page, d.id, (x) => ({
          ...x,
          w: Math.round(w), h: Math.round(h),
          x: Math.round(ncx - w / 2), y: Math.round(ncy - h / 2),
          props: textScale !== 1 ? { ...x.props, size: Math.max(8, Math.round((o.props.size ?? 24) * textScale)) } : x.props,
        })),
      )
    } else {
      const a = Math.atan2(e.clientY - d.cy, e.clientX - d.cx)
      let r = d.r0 + ((a - d.a0) * 180) / Math.PI
      r = ((r % 360) + 540) % 360 - 180
      if (e.shiftKey) r = Math.round(r / 15) * 15
      else {
        const near = Math.round(r / 45) * 45
        if (Math.abs(r - near) < 4) r = near
      }
      live(mapEl(d.page, d.id, (x) => ({ ...x, rotation: Math.round(r * 10) / 10 })))
    }
  }

  function onPointerUp() {
    const d = drag.current
    drag.current = null
    setGuides({})
    if (!d) return
    if (d.kind === 'move' && !d.moved) return
    // hop between left/right page if the centre crossed the binding
    if (d.kind === 'move') {
      const list = pagesRef.current
      const el = list[d.page].elements.find((x) => x.id === d.id)
      if (el) {
        const cx = el.x + el.w / 2
        const isLeft = (d.page - off) % 2 === 0
        const other = isLeft ? d.page + 1 : d.page - 1
        const isCoverPage = !!list[d.page]?.cover
        if (!isCoverPage && ((isLeft && cx > PAGE_W) || (!isLeft && cx < 0))) {
          let next = ensurePage(other, list)
          const moved = { ...el, x: el.x + (isLeft ? -PAGE_W : PAGE_W), z: next[other].elements.reduce((m, x) => Math.max(m, x.z), 0) + 1 }
          next = next.map((p, i) =>
            i === d.page ? { ...p, elements: p.elements.filter((x) => x.id !== el.id) } : i === other ? { ...p, elements: [...p.elements, moved] } : p,
          )
          live(next)
          setSel({ page: other, id: el.id })
          setActivePage(other)
        }
      }
    }
    pushSnapshot(d.snap)
  }

  // ── spreads ──────────────────────────────────────────────────────────
  function addSpread() {
    const base = pagesRef.current[pagesRef.current.length - 1]
    const paper = base?.cover ? 'grid' : base?.paper
    const list = (pagesRef.current.length - off) % 2 ? [...pagesRef.current, blankPage(base?.color, paper)] : [...pagesRef.current]
    list.push(blankPage(base?.cover ? '#FFF8ED' : base?.color, paper), blankPage(base?.cover ? '#FFF8ED' : base?.color, paper))
    commit(list)
    setSpread(Math.ceil((list.length - off) / 2) - 1)
    setSel(null)
  }
  function deleteSpread() {
    if (spreads <= 1) return
    const hasStuff = (left?.elements.length ?? 0) + (right?.elements.length ?? 0) > 0
    if (hasStuff) { setConfirmDelete(true); return }
    commit(pagesRef.current.filter((_, i) => i !== leftIdx && i !== rightIdx))
    setSpread((s) => Math.max(0, s - 1))
    setSel(null)
  }
  function confirmDeleteSpread() {
    setConfirmDelete(false)
    commit(pagesRef.current.filter((_, i) => i !== leftIdx && i !== rightIdx))
    setSpread((s) => Math.max(0, s - 1))
    setSel(null)
  }
  function goSpread(n: number) {
    setSpread(Math.max(0, Math.min(spreads - 1, n)))
    setSel(null)
    setEditing(null)
    setActivePage(off + Math.max(0, Math.min(spreads - 1, n)) * 2)
  }
  function goCover() {
    setSpread(-1)
    setSel(null)
    setEditing(null)
    setActivePage(0)
  }
  function addCover() {
    if (pagesRef.current[0]?.cover) return goCover()
    commit([starterCover('pink-princess', title), ...pagesRef.current])
    setSpread(-1)
    setActivePage(0)
    setSel(null)
  }
  function setSpiral(hex: string, coalesce = false) {
    if (!pagesRef.current[0]?.cover) return
    commit(pagesRef.current.map((p, i) => (i === 0 ? { ...p, spiral: hex } : p)), coalesce ? 'spiral' : undefined)
  }
  function removeCover() {
    if (!pagesRef.current[0]?.cover) return
    commit(pagesRef.current.slice(1))
    setSpread(0)
    setSel(null)
  }

  function setPaper(pageIdxs: number[], patch: Partial<Pick<NbPage, 'paper' | 'color' | 'bgImage' | 'bgScale'>>) {
    const list = pageIdxs.reduce((l, i) => ensurePage(i, l), pagesRef.current)
    commit(list.map((p, i) => (pageIdxs.includes(i) ? { ...p, ...patch } : p)))
  }

  // ── render ───────────────────────────────────────────────────────────
  const template = TEMPLATES.find((t) => t.id === templateId)
  const meta = PANELS.find((p) => p.id === panel)
  const usedQuestions = new Set(pages.flatMap((p) => p.elements.filter((e) => e.type === 'question').map((e) => e.props.question)))

  const body = (
    <div
      className={fullscreen ? 'fixed inset-0 z-[200] flex flex-col bg-[#FFF0F7]' : 'flex flex-col'}
      style={fullscreen ? { backgroundImage: 'radial-gradient(rgba(255,79,163,.15) 1.5px, transparent 1.6px)', backgroundSize: '22px 22px' } : undefined}
    >
      <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }} />

      {/* ── app title bar ── */}
      <div
        className="flex flex-wrap items-center gap-1.5 px-2 py-1.5 border-2 border-[#0B1B4A] rounded-t-xl text-white"
        style={{ background: 'linear-gradient(180deg,#7FD4FF 0%,#2F8CFF 45%,#1560E0 55%,#2A7BFF 100%)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,.7), inset 0 -2px 0 rgba(0,0,0,.2)' }}
      >
        <span className="hidden sm:flex gap-1 mr-1" aria-hidden>
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] border border-black/30" />
          <span className="w-3 h-3 rounded-full bg-[#FEBC2E] border border-black/30" />
          <span className="w-3 h-3 rounded-full bg-[#28C840] border border-black/30" />
        </span>
        <span className="hidden md:inline font-silkscreen text-[12px] tracking-wide drop-shadow">SCRAPPY STUDIO</span>
        <input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="name your scrapbook…"
          aria-label="scrapbook title"
          className="font-chango text-sm text-[#FF2E93] bg-white border-2 border-[#0B1B4A] rounded-lg px-3 py-1 min-w-0 flex-1 max-w-[240px] outline-none"
          style={{ boxShadow: 'inset 1px 2px 0 rgba(0,0,0,.12)' }}
        />
        <ToolBtn onClick={undo} disabled={!hist.past} title="undo (ctrl+z)" tone="chrome">↶</ToolBtn>
        <ToolBtn onClick={redo} disabled={!hist.future} title="redo (ctrl+shift+z)" tone="chrome">↷</ToolBtn>
        <div className="flex items-center gap-0.5 bg-black/20 rounded-lg px-1 py-0.5">
          <ToolBtn onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))} title="zoom out" tone="chrome">−</ToolBtn>
          <button onClick={() => setZoom(1)} className="font-silkscreen text-[12px] w-11 text-center" title="fit to screen">{Math.round(zoom * 100)}%</button>
          <ToolBtn onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100))} title="zoom in" tone="chrome">＋</ToolBtn>
        </div>
        <div className="flex-1" />
        {busy && <span className="font-pixel text-lg text-[#FFF0A8] animate-blink">uploading…</span>}
        <ToolBtn onClick={() => setPreviewing(true)} title="preview the finished scrapbook" tone="yellow">▶ preview</ToolBtn>
        <ToolBtn onClick={downloadSpread} disabled={exporting} title="download this spread as a PNG" tone="lime">{exporting ? 'saving…' : '↓ png'}</ToolBtn>
        <ToolBtn onClick={() => setFullscreen((f) => !f)} title={fullscreen ? 'exit full screen (esc)' : 'full screen'} tone="chrome">
          {fullscreen ? '⤡' : '⤢'}
        </ToolBtn>
        {actions}
      </div>

      {/* ── selection bar ── */}
      <div className="min-h-[46px] flex flex-wrap items-center gap-1.5 px-2 py-1.5 border-x-2 border-b-2 border-[#0B1B4A] text-[#2B0A2E]" style={{ background: 'linear-gradient(180deg,#FFF6B8,#FFE066)' }}>
        {selected && sel ? (
          <SelectionBar
            el={selected}
            setProps={setProps}
            setEl={setEl}
            onLayer={layer}
            onDuplicate={() => duplicateSelected()}
            onDelete={removeSelected}
            onReplacePhoto={() => pickPhotoFor(sel)}
            onEdit={() => setEditing(selected.id)}
          />
        ) : (
          <span className="hidden sm:inline font-pixel text-lg text-[#7C2D12] px-1">
            ✦ pick something from the shelf on the left · click to select · double-click to type · ⟳ to rotate · drag across the spiral to switch pages
          </span>
        )}
      </div>

      <div className={`flex ${fullscreen ? 'flex-1 min-h-0' : ''} flex-col md:flex-row border-x-2 border-b-2 border-[#0B1B4A] rounded-b-xl overflow-hidden bg-white`}>
        {/* ── rail ── */}
        <nav
          className="flex md:flex-col gap-1 p-1.5 overflow-x-auto md:overflow-y-auto"
          style={{ background: 'linear-gradient(180deg,#2B0A6E,#12052E)' }}
          aria-label="editor tools"
        >
          {PANELS.map((p) => {
            const on = panel === p.id
            return (
              <button
                key={p.id}
                onClick={() => setPanel((cur) => (cur === p.id ? null : p.id))}
                className="flex flex-col items-center justify-center w-14 h-14 shrink-0 rounded-xl border-2 transition-all text-white"
                style={{
                  background: on ? `linear-gradient(180deg, #ffffff66, ${p.color} 45%, ${p.color})` : `linear-gradient(180deg, ${p.color}55, ${p.color}22)`,
                  borderColor: on ? '#ffffff' : `${p.color}88`,
                  boxShadow: on ? `0 0 12px ${p.color}, inset 0 1px 0 rgba(255,255,255,.7)` : 'inset 0 1px 0 rgba(255,255,255,.25)',
                }}
                aria-pressed={on}
              >
                <span className="text-lg leading-none font-chango drop-shadow">{p.icon}</span>
                <span className="font-pixel text-sm leading-none mt-1">{p.label}</span>
              </button>
            )
          })}
        </nav>

        {/* ── panel ── */}
        {panel && meta && (
          <aside className={`${fullscreen ? 'md:w-[260px]' : 'md:w-[210px]'} shrink-0 bg-[#FFFDF7] border-b-2 md:border-b-0 md:border-r-2 border-[#0B1B4A] overflow-y-auto ${fullscreen ? '' : 'max-h-[300px] md:max-h-[680px]'}`}>
            <div
              className="sticky top-0 z-10 px-3 py-1.5 font-silkscreen text-[12px] text-white border-b-2 border-[#0B1B4A]"
              style={{ background: `linear-gradient(180deg, #ffffff55, ${meta.color} 50%, ${meta.color})`, textShadow: '0 1px 0 rgba(0,0,0,.35)' }}
            >
              {meta.label === 'bg' ? 'BACKGROUNDS' : meta.label === 'objects' ? 'OBJECT SHELF' : meta.label.toUpperCase()}
            </div>
            <div className="p-3">
              {panel === 'library' && (
                <div className="space-y-2">
                  <CatChips value={libCat} onChange={(v) => setLibCat(v as StickerCategory | 'all')} cats={STICKER_CATEGORIES} />
                  {STICKER_ASSETS.length === 0 ? (
                    <EmptyShelf />
                  ) : (
                    <div className="grid grid-cols-5 md:grid-cols-3 gap-2">
                      {STICKER_ASSETS.filter((a) => libCat === 'all' || a.category === libCat).map((a) => (
                        <button
                          key={a.id}
                          onClick={() => add({ ...makeSticker(`img:${a.id}`), w: Math.round(110 * Math.min(1, a.aspect)), h: Math.round(110 / Math.max(1, a.aspect)), props: { shadow: true } })}
                          title={a.label}
                          className="aspect-square rounded-xl p-1 transition-transform hover:scale-110 hover:-rotate-3"
                          style={{ background: 'radial-gradient(circle at 50% 40%, #ffffff, #f1e9ff)', boxShadow: 'inset 0 0 0 1.5px #e5d5ff' }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={assetThumb(a.id)} alt={a.label} loading="lazy" decoding="async" className="w-full h-full object-contain drop-shadow" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {panel === 'frames' && (
                <div className="space-y-3">
                  <CatChips value={frameCat} onChange={(v) => setFrameCat(v as FrameCategory | 'all')} cats={FRAME_CATEGORIES} />
                  <p className="font-pixel text-base text-[#555] leading-tight">click a frame to add it — if a photo is selected, it goes around that photo ✦</p>
                  {FRAME_ASSETS.length > 0 && (
                    <div className="grid grid-cols-4 md:grid-cols-2 gap-2">
                      {FRAME_ASSETS.filter((f) => frameCat === 'all' || f.category === frameCat).map((f) => (
                        <button
                          key={f.id}
                          onClick={() => {
                            if (selected?.type === 'image' && sel) setProps({ assetFrame: f.id, frame: 'none' })
                            else add({ ...makeImage('', 'none'), w: 240, h: Math.round(240 / f.aspect), rotation: 0, props: { frame: 'none', assetFrame: f.id, filter: 'none', shadow: true } })
                          }}
                          title={f.label}
                          className="rounded-lg p-1 border-2 border-[#0B1B4A]/20 hover:border-[#1D9BF0] bg-[repeating-conic-gradient(#f3f3f8_0_25%,#fff_0_50%)] bg-[length:12px_12px]"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={assetThumb(f.id)} alt={f.label} loading="lazy" className="w-full object-contain" style={{ aspectRatio: String(f.aspect) }} />
                          <div className="font-pixel text-sm leading-none mt-1 truncate">{f.label}</div>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="font-silkscreen text-[12px] text-[#1D9BF0]">CLASSIC FRAMES</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['polaroid', 'film', 'rounded', 'circle', 'heart', 'stamp'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => {
                          if (selected?.type === 'image' && sel) setProps({ frame: f, assetFrame: undefined })
                          else add(makeImage('', f))
                        }}
                        className="aspect-square rounded-lg border-2 border-[#0B1B4A]/30 bg-white hover:bg-[#E6F4FF] p-1.5 flex flex-col items-center justify-center"
                        title={`${f} frame`}
                      >
                        <div style={{ width: 40, height: f === 'film' ? 30 : 40 }}><FramePreview frame={f} /></div>
                        <span className="font-pixel text-sm leading-none mt-0.5">{f}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {panel === 'text' && (
                <div className="space-y-2">
                  <PanelBtn onClick={() => add(makeText('heading'))}><span className="font-chango text-xl text-[#FF4FA3]">add a heading</span></PanelBtn>
                  <PanelBtn onClick={() => add(makeText('subheading'))}><span className="font-pacifico text-lg">add a subheading</span></PanelBtn>
                  <PanelBtn onClick={() => add(makeText('note'))}><span className="font-caveat text-xl">handwritten note</span></PanelBtn>
                  <PanelBtn onClick={() => add(makeText('pixel'))}><span className="font-pixel text-xl text-[#7C4DDB]">&gt; pixel text_</span></PanelBtn>
                  <PanelBtn onClick={() => add(makeText('label'))}><span className="font-caveat text-lg bg-[#FFE4F0] border-2 border-[#2B0A2E] rounded px-2">label tag</span></PanelBtn>
                  <PanelBtn onClick={() => add(makeText('sticky'))}><span className="font-caveat text-lg bg-[#FFF0A8] px-3 py-1 shadow">sticky note</span></PanelBtn>
                  <PanelBtn onClick={() => add({ ...makeText('note'), w: 220, content: 'omg hiii!! ♡', props: { font: 'gochi', size: 22, color: '#2B0A2E', align: 'center', textBg: 'bubble', bgColor: '#FFFFFF' } })}>
                    <span className="font-caveat text-lg bg-white border-2 border-[#2B0A2E] rounded-2xl px-3">speech bubble</span>
                  </PanelBtn>
                  <div className="font-silkscreen text-[12px] text-[#7C4DDB] pt-2">FANCY LETTERING</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {TEXT_FX.map((fx) => (
                      <button
                        key={fx.id}
                        onClick={() => add({ ...makeText('heading'), w: 280, content: 'so cute!!', props: { font: fx.font, size: 40, color: fx.color, gradTo: fx.gradTo, align: 'center', textFx: fx.id } })}
                        className="h-14 rounded-lg border-2 border-[#2B0A2E] bg-[#2B0A2E] flex items-center justify-center overflow-hidden hover:scale-105 transition-transform"
                        style={{ backgroundImage: 'linear-gradient(135deg,#3d1640,#1b0b2a)' }}
                        title={`${fx.label} text`}
                      >
                        <span style={{ ...textBoxStyle({ id: 'fx', type: 'text', x: 0, y: 0, w: 1, h: 1, z: 0, rotation: 0, content: '', props: { font: fx.font, size: 20, color: fx.color, gradTo: fx.gradTo, textFx: fx.id, align: 'center' } }), minHeight: undefined, width: 'auto' }}>{fx.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {panel === 'photos' && (
                <div className="space-y-3">
                  <button onClick={() => { fillTarget.current = null; fileRef.current?.click() }} className="btn-bevel w-full text-sm" disabled={busy}>
                    {busy ? 'uploading…' : '+ upload photos'}
                  </button>
                  <p className="font-pixel text-base text-[#888] leading-tight">click a photo to add it — or to fill the selected empty frame.</p>
                  <div className="font-silkscreen text-[12px] text-[#D4006E]">EMPTY FRAMES</div>
                  <div className="grid grid-cols-3 gap-2">
                    {(['polaroid', 'film', 'rounded', 'circle', 'heart', 'stamp'] as const).map((f) => (
                      <button key={f} onClick={() => add(makeImage('', f))} className="aspect-square rounded-lg border-2 border-[#2B0A2E] bg-white hover:bg-[#FFE4F0] p-1.5 flex flex-col items-center justify-center" title={`${f} frame`}>
                        <div style={{ width: 40, height: f === 'film' ? 30 : 40 }}><FramePreview frame={f} /></div>
                        <span className="font-pixel text-sm leading-none mt-0.5">{f}</span>
                      </button>
                    ))}
                  </div>
                  {knownPhotos.length > 0 && (
                    <>
                      <div className="font-silkscreen text-[12px] text-[#D4006E]">YOUR PHOTOS</div>
                      <div className="grid grid-cols-3 gap-1.5">
                        {knownPhotos.map((src, i) => (
                          <button
                            key={`${i}-${src.slice(-24)}`}
                            onClick={() => {
                              if (selected?.type === 'image' && sel) setEl({ content: src })
                              else add(makeImage(src, 'polaroid'))
                            }}
                            className="aspect-square overflow-hidden rounded border-2 border-[#2B0A2E] hover:scale-105 transition-transform"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt="" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {panel === 'stickers' && (
                <div className="space-y-3">
                  <input ref={stickerFileRef} type="file" accept="image/png,image/webp,image/gif,image/jpeg" multiple hidden onChange={(e) => { handleStickerFiles(e.target.files); e.target.value = '' }} />
                  <button onClick={() => stickerFileRef.current?.click()} className="btn-bevel w-full text-sm" disabled={busy}>
                    {busy ? 'uploading…' : '↑ upload your own sticker'}
                  </button>
                  <div className="rounded-lg border-2 border-dashed border-[#F59E0B]/60 bg-[#FFF8E6] px-2.5 py-2 font-nunito text-[13px] leading-snug text-[#5A3A10]">
                    <b>sticker tips ✦</b>
                    <ul className="list-disc pl-4 mt-0.5 space-y-0.5">
                      <li><b>PNG with a transparent background</b> (no background) looks best. JPGs show as a rectangle.</li>
                      <li>Up to <b>{MAX_STICKER_MB} MB</b> each, up to 8 at a time.</li>
                      <li>At least <b>300×300 px</b> so it stays sharp. Big images are shrunk to 800 px.</li>
                      <li>PNG, WebP, GIF (first frame) or JPG.</li>
                    </ul>
                  </div>
                  {myStickers.length > 0 && (
                    <>
                      <div className="font-silkscreen text-[12px] text-[#D4006E]">YOUR STICKERS</div>
                      <div className="grid grid-cols-6 md:grid-cols-3 gap-2">
                        {myStickers.map((c) => (
                          <button key={c.slice(-40)} onClick={() => add({ ...makeSticker(c), w: 110, h: 110 })} className="aspect-square rounded-lg p-1 bg-[repeating-conic-gradient(#f3eef8_0_25%,#fff_0_50%)] bg-[length:10px_10px] hover:scale-110 transition-transform" title="add again">
                            <Sticker content={c} />
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="font-silkscreen text-[12px] text-[#D4006E]">DOODLES</div>
                  <div className="grid grid-cols-6 md:grid-cols-3 gap-2">
                    {STICKERS.map((s) => (
                      <button key={s.id} onClick={() => add(makeSticker(`svg:${s.id}`))} title={s.label} className="aspect-square rounded-lg hover:bg-[#FFE4F0] p-1.5 transition-transform hover:scale-110 hover:-rotate-6">
                        <Sticker content={`svg:${s.id}`} />
                      </button>
                    ))}
                  </div>
                  <div className="font-silkscreen text-[12px] text-[#D4006E]">GEMS</div>
                  <div className="grid grid-cols-6 md:grid-cols-3 gap-2">
                    {GEM_STICKERS.map((g) => (
                      <button key={g.id} onClick={() => add({ ...makeSticker(`svg:${g.id}`), w: 64, h: 64 })} title={g.label} className="aspect-square rounded-lg hover:bg-[#FFE4F0] p-1.5 transition-transform hover:scale-110">
                        <Sticker content={`svg:${g.id}`} />
                      </button>
                    ))}
                  </div>
                  <div className="font-silkscreen text-[12px] text-[#D4006E]">SYMBOLS & EMOJI</div>
                  <div className="grid grid-cols-8 md:grid-cols-5 gap-1">
                    {EMOJI_STICKERS.map((s) => (
                      <button key={s} onClick={() => add({ ...makeSticker(`txt:${s}`), w: 64, h: 64 })} className="aspect-square rounded hover:bg-[#FFE4F0] p-0.5 hover:scale-110 transition-transform">
                        <Sticker content={`txt:${s}`} />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {panel === 'tape' && (
                <div className="space-y-2">
                  {TAPES.map((t) => (
                    <div key={t.id} className="flex gap-1.5 items-center">
                      <span className="font-pixel text-base w-14">{t.label}</span>
                      <div className="flex gap-1 flex-wrap flex-1">
                        {TAPE_COLORS.slice(0, 4).map((c) => (
                          <button key={c} onClick={() => add(makeTape(t.id, c))} className="h-6 flex-1 min-w-[28px] -rotate-3 hover:rotate-0 transition-transform" style={{ ...t.css(c), opacity: 0.9, clipPath: 'polygon(0 10%, 6% 0, 94% 0, 100% 10%, 100% 90%, 94% 100%, 6% 100%, 0 90%)' }} aria-label={`${t.label} tape`} />
                        ))}
                      </div>
                    </div>
                  ))}
                  <p className="font-pixel text-base text-[#888] pt-1">tip: pick more colours in the bar above once it&apos;s placed.</p>
                </div>
              )}

              {panel === 'shapes' && (
                <div className="grid grid-cols-3 gap-2">
                  {(['rect', 'circle', 'heart', 'star', 'speech', 'ticket', 'scallop', 'cloud'] as const).map((s) => (
                    <button key={s} onClick={() => add(makeShape(s))} className="aspect-square rounded-lg hover:bg-[#FFE4F0] p-2 flex flex-col items-center" title={s}>
                      <div className="w-full flex-1">
                        <ElementView el={{ id: 'p', type: 'shape', x: 0, y: 0, w: 1, h: 1, z: 0, rotation: 0, content: '', props: { shape: s, fill: s === 'heart' ? '#FF9ECF' : s === 'star' ? '#FFD84F' : '#fff', stroke: '#2B0A2E' } }} />
                      </div>
                      <span className="font-pixel text-sm leading-none mt-1">{s}</span>
                    </button>
                  ))}
                </div>
              )}

              {panel === 'questions' && (
                <QuestionsPanel
                  questions={template?.questions.map((q) => q.question_text) ?? []}
                  used={usedQuestions}
                  onAdd={(q, style) => add(makeQuestion(q, '', 40, 60, style))}
                />
              )}

              {panel === 'backgrounds' && (
                <div className="space-y-3">
                  {hasCover && (
                    <div>
                      <div className="font-silkscreen text-[12px] text-[#0EA5E9] mb-1.5">SPIRAL COLOUR</div>
                      <div className="flex flex-wrap gap-1.5">
                        {SPIRAL_COLORS.map((c) => (
                          <button
                            key={c.id}
                            onClick={() => setSpiral(c.hex)}
                            title={c.label}
                            aria-label={`${c.label} spiral`}
                            aria-pressed={(spiral ?? '').toLowerCase() === c.hex.toLowerCase()}
                            className={`w-8 h-8 rounded-full border-2 ${(spiral ?? '').toLowerCase() === c.hex.toLowerCase() ? 'border-[#FF2E93] ring-2 ring-[#FF2E93]/40' : 'border-[#0B1B4A]/40'}`}
                            style={{ background: `radial-gradient(circle at 35% 30%, #fff 0 14%, ${c.hex} 50%, #1a1a1a 140%)` }}
                          />
                        ))}
                        <label className="w-8 h-8 rounded-full border-2 border-dashed border-[#0B1B4A]/50 flex items-center justify-center cursor-pointer text-sm" title="custom colour">
                          ＋
                          <input type="color" className="sr-only" value={spiral ?? '#B9C0CC'} onChange={(e) => setSpiral(e.target.value, true)} aria-label="custom spiral colour" />
                        </label>
                      </div>
                    </div>
                  )}
                  <div className="flex rounded-lg border-2 border-[#0B1B4A] overflow-hidden">
                    {(['left', 'right', 'both'] as const).map((t) => (
                      <button key={t} onClick={() => setBgTarget(t)} className={`flex-1 font-pixel text-base py-0.5 ${bgTarget === t ? 'bg-[#0EA5E9] text-white' : 'bg-white'}`}>
                        {t === 'both' ? 'both pages' : `${t} page`}
                      </button>
                    ))}
                  </div>
                  <div className="font-silkscreen text-[12px] text-[#0EA5E9]">TEXTURES</div>
                  <div className="grid grid-cols-4 md:grid-cols-3 gap-1.5">
                    {ART_BACKGROUNDS.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setPaper(bgIdxs, { paper: `art:${b.id}` })}
                        className={`rounded-md overflow-hidden border-2 ${pages[bgIdxs[0]]?.paper === `art:${b.id}` ? 'border-[#FF2E93] ring-2 ring-[#FF2E93]' : 'border-[#0B1B4A]/30'}`}
                        title={b.label}
                      >
                        <div className="h-12" style={pageBackground({ paper: `art:${b.id}`, color: '#fff' })} />
                        <div className="font-pixel text-sm leading-none bg-white py-0.5 truncate">{b.label}</div>
                      </button>
                    ))}
                  </div>
                  <div className="font-silkscreen text-[12px] text-[#0EA5E9]">PAPER</div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PAPERS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPaper(bgIdxs, { paper: p.id as PaperId })}
                        className={`h-10 rounded border-2 ${pages[bgIdxs[0]]?.paper === p.id ? 'border-[#FF2E93] ring-2 ring-[#FF2E93]' : 'border-[#0B1B4A]/40'}`}
                        style={{ ...paperStyle(p.id, pages[bgIdxs[0]]?.color ?? '#FFF8ED'), backgroundSize: undefined }}
                        title={p.label}
                      />
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {PAPER_COLORS.map((c) => (
                      <button key={c} onClick={() => setPaper(bgIdxs, { color: c })} className="w-6 h-6 rounded-full border-2 border-[#0B1B4A]" style={{ background: c }} aria-label={`paper colour ${c}`} />
                    ))}
                  </div>
                  <div className="font-silkscreen text-[12px] text-[#0EA5E9]">YOUR OWN PHOTO</div>
                  <input ref={bgFileRef} type="file" accept="image/*" hidden onChange={(e) => { handleBgFile(e.target.files); e.target.value = '' }} />
                  <button onClick={() => bgFileRef.current?.click()} className="btn-bevel w-full text-sm" disabled={busy}>↑ upload a background</button>
                  {pages[bgIdxs[0]]?.bgImage && (
                    <div className="space-y-1">
                      <label className="flex items-center gap-2 font-pixel text-base">
                        size
                        <input type="range" min={0.5} max={3} step={0.05} value={pages[bgIdxs[0]]?.bgScale ?? 1} onChange={(e) => setPaper(bgIdxs, { bgScale: Number(e.target.value) })} className="flex-1 accent-[#0EA5E9]" />
                      </label>
                      <button onClick={() => setPaper(bgIdxs, { bgImage: undefined, bgScale: undefined })} className="font-pixel text-base underline">remove photo background</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}

        {/* ── stage ── */}
        <div
          className="flex-1 min-w-0 flex flex-col"
          style={{ background: 'conic-gradient(#E9DDFF 0 25%, #F6F0FF 0 50%) 0 0 / 28px 28px' }}
        >
          <div
            ref={stageRef}
            className={`relative flex-1 flex ${zoom > 1 ? 'items-start justify-start overflow-auto' : 'items-center justify-center overflow-hidden'} ${fullscreen ? 'min-h-0' : ''}`}
            style={{ minHeight: fullscreen ? undefined : fitScale ? (PAGE_H + 40) * fitScale + 24 : 360, maxHeight: fullscreen ? undefined : '78vh', touchAction: zoom > 1 ? 'pan-x pan-y' : 'none', padding: zoom > 1 ? 24 : 0 }}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onPointerDown={() => { setSel(null); setEditing(null) }}
          >
            {scale > 0 && (
              <div style={{ width: SPREAD_W * scale, height: PAGE_H * scale, position: 'relative', flexShrink: 0 }}>
                <div style={{ width: SPREAD_W, height: PAGE_H, transform: `scale(${scale})`, transformOrigin: '0 0' }}>
                  {onCover ? (
                    <div style={{ marginLeft: PAGE_W / 2 }}>
                      <CoverFrame page={pages[0]} onPageBgPointerDown={(e) => { e.stopPropagation(); setSel(null); setEditing(null); setActivePage(0) }}>
                        {[...pages[0].elements].sort((a, b) => a.z - b.z).map((el) => (
                          <EditableItem
                            key={el.id}
                            el={el}
                            pageSide={0}
                            scale={scale}
                            selected={sel?.id === el.id}
                            editing={editing === el.id}
                            onPointerDown={(e) => startMove(e, 0, el)}
                            onDoubleClick={() => {
                              if (el.type === 'text' || el.type === 'question') setEditing(el.id)
                              if (el.type === 'image' && !el.content) pickPhotoFor({ page: 0, id: el.id })
                            }}
                            onResize={(e, hx, hy) => startResize(e, 0, el, hx, hy)}
                            onRotate={(e) => startRotate(e, 0, el)}
                            onText={(text) => commit(mapEl(0, el.id, (x) => ({ ...x, content: text })), `type-${el.id}`)}
                            onAutoHeight={(h) =>
                              onChange((prev) => prev.map((p, i) => (i === 0 ? { ...p, elements: p.elements.map((x) => (x.id === el.id ? { ...x, h } : x)) } : p)))
                            }
                            onDoneEditing={() => setEditing(null)}
                            onPickPhoto={() => pickPhotoFor({ page: 0, id: el.id })}
                          />
                        ))}
                      </CoverFrame>
                    </div>
                  ) : (
                    <SpreadFrame
                      left={left ?? blankPage()}
                      right={right}
                      onPageBgPointerDown={(e, side) => { e.stopPropagation(); setSel(null); setEditing(null); setActivePage(side ? rightIdx : leftIdx) }}
                    >
                      {sortedSpreadElements(left, right).map(({ el, page }) => {
                        const pageIdx = page === 0 ? leftIdx : rightIdx
                        return (
                          <EditableItem
                            key={el.id}
                            el={el}
                            pageSide={page}
                            scale={scale}
                            selected={sel?.id === el.id}
                            editing={editing === el.id}
                            onPointerDown={(e) => startMove(e, pageIdx, el)}
                            onDoubleClick={() => {
                              if (el.type === 'text' || el.type === 'question') setEditing(el.id)
                              if (el.type === 'image' && !el.content) pickPhotoFor({ page: pageIdx, id: el.id })
                            }}
                            onResize={(e, hx, hy) => startResize(e, pageIdx, el, hx, hy)}
                            onRotate={(e) => startRotate(e, pageIdx, el)}
                            onText={(text) => commit(mapEl(pageIdx, el.id, (x) => ({ ...x, content: text })), `type-${el.id}`)}
                            onAutoHeight={(h) =>
                              onChange((prev) =>
                                prev.map((p, i) => (i === pageIdx ? { ...p, elements: p.elements.map((x) => (x.id === el.id ? { ...x, h } : x)) } : p)),
                              )
                            }
                            onDoneEditing={() => setEditing(null)}
                            onPickPhoto={() => pickPhotoFor({ page: pageIdx, id: el.id })}
                          />
                        )
                      })}
                      {guides.v !== undefined && <div style={{ position: 'absolute', left: guides.v, top: 0, bottom: 0, width: 0, borderLeft: `${1.5 / scale}px dashed #FF4FA3` }} />}
                      {guides.h !== undefined && <div style={{ position: 'absolute', top: guides.h, left: 0, right: 0, height: 0, borderTop: `${1.5 / scale}px dashed #FF4FA3` }} />}
                    </SpreadFrame>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ── spread strip ── */}
          <div className="flex items-center gap-2 px-2 py-2 border-t-2 border-[#2B0A2E] bg-white overflow-x-auto">
            <ToolBtn onClick={() => (spread === 0 && hasCover ? goCover() : goSpread(spread - 1))} disabled={onCover || (spread === 0 && !hasCover)} title="previous">◀</ToolBtn>
            {hasCover ? (
              <button
                onClick={goCover}
                className={`shrink-0 rounded-md border-2 p-0.5 transition-all ${onCover ? 'border-[#FF4FA3] ring-2 ring-[#FF4FA3]/40' : 'border-[#2B0A2E]/40 hover:border-[#2B0A2E]'}`}
                aria-label="front cover"
              >
                <div style={{ width: PAGE_W * 0.085 + 6, height: PAGE_H * 0.085, overflow: 'hidden', pointerEvents: 'none', paddingLeft: 3 }}>
                  <div style={{ transform: 'scale(0.085)', transformOrigin: '0 0' }}>
                    <StaticCover page={pages[0]} />
                  </div>
                </div>
                <div className="font-pixel text-sm leading-none text-center">cover</div>
              </button>
            ) : (
              <ToolBtn onClick={addCover} title="add a front cover">＋ cover</ToolBtn>
            )}
            {Array.from({ length: spreads }).map((_, i) => (
              <button
                key={i}
                onClick={() => goSpread(i)}
                className={`shrink-0 rounded-md border-2 p-0.5 transition-all ${i === spread && !onCover ? 'border-[#FF4FA3] ring-2 ring-[#FF4FA3]/40' : 'border-[#2B0A2E]/40 hover:border-[#2B0A2E]'}`}
                aria-label={`spread ${i + 1}`}
              >
                <div style={{ width: SPREAD_W * 0.085, height: PAGE_H * 0.085, overflow: 'hidden', pointerEvents: 'none' }}>
                  <div style={{ transform: 'scale(0.085)', transformOrigin: '0 0' }}>
                    <StaticSpread left={pages[off + i * 2]} right={pages[off + i * 2 + 1]} spiral={spiral} />
                  </div>
                </div>
                <div className="font-pixel text-sm leading-none text-center">{i * 2 + 1}–{i * 2 + 2}</div>
              </button>
            ))}
            <ToolBtn onClick={addSpread} title="add two pages">＋ pages</ToolBtn>
            <ToolBtn onClick={() => (onCover ? goSpread(0) : goSpread(spread + 1))} disabled={!onCover && spread >= spreads - 1} title="next">▶</ToolBtn>
            <div className="flex-1" />
            {onCover ? (
              <ToolBtn onClick={removeCover} title="remove the front cover (you can undo)">✕ cover</ToolBtn>
            ) : (
              <ToolBtn onClick={deleteSpread} disabled={spreads <= 1} title="delete this spread">✕ spread</ToolBtn>
            )}
          </div>
        </div>

        {/* ── properties ── */}
        <aside className={`${fullscreen ? 'hidden lg:block' : 'hidden'} w-[210px] shrink-0 border-l-2 border-[#0B1B4A] bg-[#F4F7FF] overflow-y-auto`}>
          <div className="px-3 py-1.5 font-silkscreen text-[12px] text-white border-b-2 border-[#0B1B4A]" style={{ background: 'linear-gradient(180deg,#9FB4FF,#5B6CFF 50%,#4453E8)' }}>
            PROPERTIES
          </div>
          {selected && sel ? (
            <PropertiesPanel
              el={selected}
              setEl={setEl}
              setProps={setProps}
              onLayer={layer}
              onDuplicate={() => duplicateSelected()}
              onDelete={removeSelected}
            />
          ) : (
            <div className="p-3 font-pixel text-base text-[#4453E8] leading-tight">
              nothing selected ✦<br />click anything on the page to see its position, size, rotation, shadow and layer.
            </div>
          )}
        </aside>
      </div>

      {/* offscreen render used for PNG download */}
      {exporting && (
        <div style={{ position: 'fixed', left: -10000, top: 0, pointerEvents: 'none' }} aria-hidden>
          <div ref={exportRef} style={{ padding: 24, background: '#f7eaf1', display: 'inline-block' }}>
            {onCover ? <StaticCover page={pages[0]} /> : <StaticSpread left={left} right={right} spiral={spiral} />}
          </div>
        </div>
      )}

      {previewing && (
        <div className="fixed inset-0 z-[450] flex flex-col bg-[#12052E]/85 backdrop-blur-sm" onClick={() => setPreviewing(false)}>
          <div className="flex items-center justify-between px-4 py-2 text-white">
            <span className="font-silkscreen text-xs">PREVIEW — this is how visitors will see your scrapbook</span>
            <button onClick={() => setPreviewing(false)} className="font-chango text-sm bg-white/15 hover:bg-white/25 rounded-lg px-3 py-1">close ✕</button>
          </div>
          <div className="flex-1 overflow-auto px-4 pb-6" onClick={(e) => e.stopPropagation()}>
            <div className="max-w-5xl mx-auto bg-[#FFF8FB] rounded-2xl p-4">
              <NotebookViewer pages={pages} />
            </div>
          </div>
        </div>
      )}

      {notice && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[300] bg-[#FFF0A8] border-2 border-[#2B0A2E] rounded-lg px-4 py-2 font-pixel text-lg shadow-lg" role="status" onClick={() => setNotice(null)}>
          {notice}
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center bg-[#3A0030]/50 backdrop-blur-sm" onClick={() => setConfirmDelete(false)}>
          <div className="bg-white rounded-2xl border-2 border-[#FFB6D9] shadow-2xl p-6 max-w-xs w-full mx-4" onClick={e => e.stopPropagation()}>
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">✦</div>
              <h2 className="font-pacifico text-lg text-[#3A0030]" style={{ fontFamily: 'Pacifico, cursive' }}>delete this spread?</h2>
              <p className="font-caveat text-[#888] mt-1" style={{ fontFamily: 'Caveat, cursive', fontSize: '17px' }}>
                this will remove the spread and everything on it. you can undo with ctrl+z.
              </p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(false)} className="btn-outline-y2k flex-1 py-2 text-sm" style={{ fontSize: '12px' }}>
                cancel
              </button>
              <button onClick={confirmDeleteSpread} className="btn-y2k flex-1 py-2 text-sm bg-[#D4006E]" style={{ fontSize: '12px' }}>
                delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  useEffect(() => {
    if (!notice) return
    const t = setTimeout(() => setNotice(null), 4000)
    return () => clearTimeout(t)
  }, [notice])

  if (fullscreen && typeof document !== 'undefined') return createPortal(body, document.body)
  return body
}

// ─── Editable element ─────────────────────────────────────────────────────

const HANDLES: [number, number][] = [[-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]]

function EditableItem({
  el, pageSide, scale, selected, editing, onPointerDown, onDoubleClick, onResize, onRotate, onText, onAutoHeight, onDoneEditing, onPickPhoto,
}: {
  el: NbElement
  pageSide: 0 | 1
  scale: number
  selected: boolean
  editing: boolean
  onPointerDown: (e: React.PointerEvent) => void
  onDoubleClick: () => void
  onResize: (e: React.PointerEvent, hx: number, hy: number) => void
  onRotate: (e: React.PointerEvent) => void
  onText: (t: string) => void
  onAutoHeight: (h: number) => void
  onDoneEditing: () => void
  onPickPhoto: () => void
}) {
  const measureRef = useRef<HTMLElement | null>(null)
  const isText = el.type === 'text'
  const autoFit = isText && !['sticky', 'bubble'].includes(el.props.textBg ?? 'none')
  const grows = isText || el.type === 'question'

  useLayoutEffect(() => {
    if (!grows) return
    const node = measureRef.current
    if (!node) return
    if (node.tagName === 'TEXTAREA') {
      node.style.height = 'auto'
      node.style.height = `${node.scrollHeight}px`
    }
    const box = (node.closest('[data-content]') as HTMLElement | null) ?? node
    const needed = autoFit ? Math.ceil(node.offsetHeight) : Math.max(el.h, Math.ceil(box.scrollHeight))
    if (needed > 0 && Math.abs(needed - el.h) > 1) onAutoHeight(needed)
  })

  const hs = 12 / scale
  const handles =
    el.type === 'tape'
      ? HANDLES.filter(([x, y]) => x !== 0 && y === 0)
      : autoFit
      ? HANDLES.filter(([x, y]) => y === 0 || x !== 0)
      : HANDLES

  const textareaStyle: React.CSSProperties = {
    ...(isText ? textBoxStyle(el) : {}),
    minHeight: undefined,
    width: '100%',
    resize: 'none',
    border: 'none',
    outline: 'none',
    overflow: 'hidden',
    display: 'block',
    padding: isText ? (textBoxStyle(el).padding as string | undefined) ?? 0 : 0,
    background: isText ? textBoxStyle(el).background : 'transparent',
  }

  let content: React.ReactNode
  if (isText) {
    content = editing ? (
      <textarea
        ref={(n) => { measureRef.current = n }}
        autoFocus
        value={el.content}
        onChange={(e) => onText(e.target.value)}
        onBlur={onDoneEditing}
        onPointerDown={(e) => e.stopPropagation()}
        style={textareaStyle}
        rows={1}
      />
    ) : (
      <div ref={(n) => { measureRef.current = n }} style={{ ...textBoxStyle(el), minHeight: autoFit ? undefined : '100%' }}>
        {el.content || <span style={{ opacity: 0.4 }}>type here…</span>}
      </div>
    )
  } else if (el.type === 'question') {
    content = (
      <div ref={(n) => { if (!editing) measureRef.current = n }} style={{ minHeight: '100%' }}>
        <QuestionView
          el={el}
          answerSlot={
            editing ? (
              <textarea
                ref={(n) => { measureRef.current = n }}
                autoFocus
                value={el.content}
                placeholder="write your answer…"
                onChange={(e) => onText(e.target.value)}
                onBlur={onDoneEditing}
                onPointerDown={(e) => e.stopPropagation()}
                rows={1}
                style={{ fontFamily: textBoxStyle(el).fontFamily, fontSize: el.props.size ?? 22, color: el.props.color ?? '#2B0A2E', width: '100%', background: 'transparent', border: 'none', outline: 'none', resize: 'none', overflow: 'hidden', lineHeight: 1.25, display: 'block' }}
              />
            ) : undefined
          }
        />
      </div>
    )
  } else {
    content = <ElementView el={el} onPickPhoto={onPickPhoto} />
  }

  return (
    <div
      data-el={el.id}
      onPointerDown={onPointerDown}
      onDoubleClick={onDoubleClick}
      style={{
        ...placed(el, pageSide),
        pointerEvents: 'auto',
        cursor: el.props.locked ? 'default' : editing ? 'text' : 'move',
        touchAction: 'none',
        transform: `rotate(${el.rotation}deg)`,
        opacity: 1,
      }}
    >
      <div data-content style={{ width: '100%', height: grows ? 'auto' : '100%', minHeight: '100%', transform: el.props.flipX ? 'scaleX(-1)' : undefined, opacity: el.props.opacity ?? 1 }}>
        {content}
      </div>

      {selected && (
        <>
          <div style={{ position: 'absolute', inset: -2 / scale, border: `${2 / scale}px solid ${el.props.locked ? '#9CA3AF' : '#FF4FA3'}`, borderRadius: 2 / scale, pointerEvents: 'none', boxShadow: `0 0 0 ${1 / scale}px #fff` }} />
          {!el.props.locked && !editing && (
            <>
              {handles.map(([hx, hy]) => (
                <div
                  key={`${hx}${hy}`}
                  onPointerDown={(e) => onResize(e, hx, hy)}
                  style={{
                    position: 'absolute',
                    left: `calc(${(hx + 1) * 50}% - ${hs / 2}px)`,
                    top: `calc(${(hy + 1) * 50}% - ${hs / 2}px)`,
                    width: hs, height: hs,
                    background: '#fff', border: `${2 / scale}px solid #FF4FA3`, borderRadius: hx && hy ? '50%' : 3 / scale,
                    cursor: hx && hy ? (hx === hy ? 'nwse-resize' : 'nesw-resize') : hx ? 'ew-resize' : 'ns-resize',
                    touchAction: 'none',
                  }}
                />
              ))}
              <div style={{ position: 'absolute', left: '50%', top: -30 / scale, height: 22 / scale, borderLeft: `${1.5 / scale}px solid #FF4FA3`, pointerEvents: 'none' }} />
              <div
                onPointerDown={onRotate}
                title="drag to rotate (shift = 15° steps)"
                style={{
                  position: 'absolute', left: `calc(50% - ${9 / scale}px)`, top: -40 / scale, width: 18 / scale, height: 18 / scale,
                  borderRadius: '50%', background: '#FF4FA3', border: `${2 / scale}px solid #fff`, boxShadow: `0 0 0 ${1 / scale}px #2B0A2E`,
                  cursor: 'grab', color: '#fff', fontSize: 12 / scale, lineHeight: `${14 / scale}px`, textAlign: 'center', touchAction: 'none',
                }}
              >
                ⟳
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}

// ─── Selection bar ────────────────────────────────────────────────────────

function SelectionBar({
  el, setProps, setEl, onLayer, onDuplicate, onDelete, onReplacePhoto, onEdit,
}: {
  el: NbElement
  setProps: (p: Partial<ElementProps>, key?: string) => void
  setEl: (p: Partial<NbElement>, key?: string) => void
  onLayer: (d: 'up' | 'down' | 'top' | 'bottom') => void
  onDuplicate: () => void
  onDelete: () => void
  onReplacePhoto: () => void
  onEdit: () => void
}) {
  const p = el.props
  const textish = el.type === 'text' || el.type === 'question'
  return (
    <>
      {textish && (
        <>
          {el.type === 'question' && (
            <input
              value={p.question ?? ''}
              onChange={(e) => setProps({ question: e.target.value }, `q-${el.id}`)}
              className="input-mini w-[170px]"
              aria-label="question"
              placeholder="question…"
            />
          )}
          <select value={p.font ?? 'caveat'} onChange={(e) => setProps({ font: e.target.value })} className="input-mini" aria-label="font" style={{ fontFamily: FONTS.find((f) => f.id === p.font)?.css }}>
            {FONTS.map((f) => <option key={f.id} value={f.id} style={{ fontFamily: f.css }}>{f.label}</option>)}
          </select>
          <div className="flex items-center">
            <ToolBtn onClick={() => setProps({ size: Math.max(8, (p.size ?? 24) - 2) }, `size-${el.id}`)} title="smaller">−</ToolBtn>
            <input
              type="number" value={Math.round(p.size ?? 24)} min={8} max={160}
              onChange={(e) => setProps({ size: Math.max(8, Math.min(160, Number(e.target.value) || 8)) }, `size-${el.id}`)}
              className="input-mini w-12 text-center" aria-label="font size"
            />
            <ToolBtn onClick={() => setProps({ size: Math.min(160, (p.size ?? 24) + 2) }, `size-${el.id}`)} title="bigger">+</ToolBtn>
          </div>
          <ColorPick value={p.color ?? '#2B0A2E'} onChange={(c) => setProps({ color: c }, `color-${el.id}`)} label="text colour" letter="A" />
          {el.type === 'text' && (
            <>
              <ToolBtn onClick={() => setProps({ bold: !p.bold })} active={p.bold} title="bold"><b>B</b></ToolBtn>
              <ToolBtn onClick={() => setProps({ italic: !p.italic })} active={p.italic} title="italic"><i>I</i></ToolBtn>
              <ToolBtn
                onClick={() => setProps({ align: p.align === 'left' ? 'center' : p.align === 'center' ? 'right' : 'left' })}
                title="alignment"
              >
                {p.align === 'center' ? '≡' : p.align === 'right' ? '⫸' : '⫷'}
              </ToolBtn>
              <select value={p.textBg ?? 'none'} onChange={(e) => setProps({ textBg: e.target.value as ElementProps['textBg'] })} className="input-mini" aria-label="text style">
                <option value="none">plain</option>
                <option value="highlight">highlighter</option>
                <option value="label">label tag</option>
                <option value="sticky">sticky note</option>
                <option value="bubble">bubble</option>
              </select>
              {p.textBg && p.textBg !== 'none' && <ColorPick value={p.bgColor ?? '#FFF0A8'} onChange={(c) => setProps({ bgColor: c }, `bg-${el.id}`)} label="background colour" />}
              <select value={p.textFx ?? 'none'} onChange={(e) => setProps({ textFx: e.target.value === 'none' ? undefined : (e.target.value as ElementProps['textFx']) })} className="input-mini" aria-label="text effect">
                <option value="none">no effect</option>
                <option value="glitter">glitter</option>
                <option value="chrome">chrome</option>
                <option value="outline">bubble outline</option>
                <option value="sticker">sticker</option>
                <option value="gradient">gradient</option>
                <option value="shadow">pop shadow</option>
              </select>
              {(p.textFx === 'gradient' || p.textFx === 'glitter' || p.textFx === 'chrome' || p.textFx === 'shadow') && (
                <ColorPick value={p.gradTo ?? '#6FE3FF'} onChange={(c) => setProps({ gradTo: c }, `grad-${el.id}`)} label="second colour" letter="2" />
              )}
              <label className="flex items-center gap-1 font-pixel text-base" title="letter spacing">
                A↔A
                <input type="range" min={-2} max={16} step={0.5} value={p.letterSpacing ?? 0} onChange={(e) => setProps({ letterSpacing: Number(e.target.value) }, `ls-${el.id}`)} className="w-14 accent-[#FF4FA3]" aria-label="letter spacing" />
              </label>
            </>
          )}
          {el.type === 'question' && (
            <select value={p.cardStyle ?? 'card'} onChange={(e) => setProps({ cardStyle: e.target.value as ElementProps['cardStyle'] })} className="input-mini" aria-label="card style">
              <option value="card">card</option>
              <option value="lined">lined</option>
              <option value="sticky">sticky</option>
            </select>
          )}
          <ToolBtn onClick={onEdit} title="edit text (enter)">✎ type</ToolBtn>
        </>
      )}

      {el.type === 'image' && (
        <>
          <select value={p.frame ?? 'none'} onChange={(e) => setProps({ frame: e.target.value as ElementProps['frame'] })} className="input-mini" aria-label="frame">
            {['none', 'polaroid', 'film', 'rounded', 'circle', 'heart', 'stamp'].map((f) => <option key={f} value={f}>{f === 'none' ? 'no frame' : f}</option>)}
          </select>
          {p.frame === 'polaroid' && (
            <input value={p.caption ?? ''} onChange={(e) => setProps({ caption: e.target.value }, `cap-${el.id}`)} placeholder="caption…" className="input-mini w-[120px] font-caveat" aria-label="caption" />
          )}
          <select value={p.filter ?? 'none'} onChange={(e) => setProps({ filter: e.target.value as ElementProps['filter'] })} className="input-mini" aria-label="filter">
            {['none', 'vintage', 'bw', 'rosy', 'dreamy'].map((f) => <option key={f} value={f}>{f === 'none' ? 'no filter' : f === 'bw' ? 'b&w' : f}</option>)}
          </select>
          <ToolBtn onClick={onReplacePhoto} title="replace photo"><span className="flex items-center gap-1"><IcoCam />{el.content ? 'replace' : 'add photo'}</span></ToolBtn>
          <ToolBtn onClick={() => setProps({ flipX: !p.flipX })} active={p.flipX} title="flip">⇋</ToolBtn>
        </>
      )}

      {el.type === 'sticker' && (
        <>
          {stickerTintable(el.content) && <ColorPick value={p.color ?? '#FF4FA3'} onChange={(c) => setProps({ color: c }, `color-${el.id}`)} label="sticker colour" />}
          <ToolBtn onClick={() => setProps({ flipX: !p.flipX })} active={p.flipX} title="flip">⇋</ToolBtn>
        </>
      )}

      {el.type === 'tape' && (
        <>
          <select value={p.pattern ?? 'grid'} onChange={(e) => setProps({ pattern: e.target.value })} className="input-mini" aria-label="tape pattern">
            {TAPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
          <ColorPick value={p.color ?? '#FFB6D9'} onChange={(c) => setProps({ color: c }, `color-${el.id}`)} label="tape colour" extra={TAPE_COLORS} />
        </>
      )}

      {el.type === 'shape' && (
        <>
          <select value={p.shape ?? 'rect'} onChange={(e) => setProps({ shape: e.target.value as ElementProps['shape'] })} className="input-mini" aria-label="shape">
            {['rect', 'circle', 'heart', 'star', 'speech', 'ticket', 'scallop', 'cloud'].map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <ColorPick value={p.fill ?? '#FFFFFF'} onChange={(c) => setProps({ fill: c }, `fill-${el.id}`)} label="fill" />
          <ColorPick value={p.stroke ?? '#2B0A2E'} onChange={(c) => setProps({ stroke: c }, `stroke-${el.id}`)} label="outline" letter="◻" />
        </>
      )}

      <div className="flex-1" />
      <label className="flex items-center gap-1 font-pixel text-base" title="opacity">
        ◐
        <input type="range" min={0.15} max={1} step={0.05} value={p.opacity ?? 1} onChange={(e) => setProps({ opacity: Number(e.target.value) }, `op-${el.id}`)} className="w-16 accent-[#FF4FA3]" aria-label="opacity" />
      </label>
      {el.rotation !== 0 && <ToolBtn onClick={() => setEl({ rotation: 0 })} title="straighten">⟲ 0°</ToolBtn>}
      <ToolBtn onClick={() => onLayer('up')} title="bring forward">⬆</ToolBtn>
      <ToolBtn onClick={() => onLayer('down')} title="send backward">⬇</ToolBtn>
      <ToolBtn onClick={onDuplicate} title="duplicate (ctrl+d)">⧉</ToolBtn>
      <ToolBtn onClick={() => setProps({ locked: !p.locked })} active={p.locked} title={p.locked ? 'unlock' : 'lock in place'}>{p.locked ? '■' : '□'}</ToolBtn>
      <ToolBtn onClick={onDelete} title="delete (del)" danger>✕</ToolBtn>
    </>
  )
}

// ─── Properties panel ─────────────────────────────────────────────────────

function PropertiesPanel({
  el, setEl, setProps, onLayer, onDuplicate, onDelete,
}: {
  el: NbElement
  setEl: (p: Partial<NbElement>, key?: string) => void
  setProps: (p: Partial<ElementProps>, key?: string) => void
  onLayer: (d: 'up' | 'down' | 'top' | 'bottom') => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const num = (label: string, value: number, key: 'x' | 'y' | 'w' | 'h' | 'rotation', min = -2000, max = 4000) => (
    <label className="flex flex-col font-pixel text-base text-[#0B1B4A]">
      {label}
      <input
        type="number"
        value={Math.round(value)}
        min={min}
        max={max}
        onChange={(e) => {
          const v = Number(e.target.value)
          if (!Number.isFinite(v)) return
          setEl({ [key]: key === 'w' || key === 'h' ? Math.max(10, v) : v } as Partial<NbElement>, `prop-${key}-${el.id}`)
        }}
        className="input-mini w-full !h-7 text-center"
        disabled={el.props.locked}
      />
    </label>
  )
  const kind = el.type === 'sticker' && el.content.startsWith('img:') ? 'object' : el.type
  return (
    <div className="p-3 space-y-3">
      <div className="font-chango text-xs text-[#4453E8]">{kind}</div>
      <div className="grid grid-cols-2 gap-1.5">
        {num('x', el.x, 'x')}
        {num('y', el.y, 'y')}
        {num('width', el.w, 'w', 10)}
        {num('height', el.h, 'h', 10)}
      </div>
      <div className="grid grid-cols-[1fr_auto] gap-1.5 items-end">
        {num('rotation°', el.rotation, 'rotation', -180, 180)}
        <ToolBtn onClick={() => setEl({ rotation: 0 })} title="straighten">0°</ToolBtn>
      </div>
      <label className="block font-pixel text-base text-[#0B1B4A]">
        opacity {Math.round((el.props.opacity ?? 1) * 100)}%
        <input type="range" min={0.15} max={1} step={0.05} value={el.props.opacity ?? 1} onChange={(e) => setProps({ opacity: Number(e.target.value) }, `op-${el.id}`)} className="w-full accent-[#4453E8]" />
      </label>
      <label className="flex items-center gap-2 font-pixel text-base text-[#0B1B4A]">
        <input type="checkbox" checked={!!el.props.shadow} onChange={(e) => setProps({ shadow: e.target.checked })} className="w-4 h-4 accent-[#4453E8]" />
        drop shadow
      </label>
      <div>
        <div className="font-pixel text-base text-[#0B1B4A] mb-1">layer</div>
        <div className="grid grid-cols-4 gap-1">
          <ToolBtn onClick={() => onLayer('top')} title="bring to front">⤒</ToolBtn>
          <ToolBtn onClick={() => onLayer('up')} title="bring forward">↑</ToolBtn>
          <ToolBtn onClick={() => onLayer('down')} title="send backward">↓</ToolBtn>
          <ToolBtn onClick={() => onLayer('bottom')} title="send to back">⤓</ToolBtn>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-1">
        <ToolBtn onClick={onDuplicate} title="duplicate (ctrl+d)">⧉</ToolBtn>
        <ToolBtn onClick={() => setProps({ locked: !el.props.locked })} active={el.props.locked} title={el.props.locked ? 'unlock' : 'lock'}>{el.props.locked ? 'unlock' : 'lock'}</ToolBtn>
        <ToolBtn onClick={onDelete} title="delete (del)" danger>✕</ToolBtn>
      </div>
    </div>
  )
}

// ─── small UI bits ────────────────────────────────────────────────────────

const TONES: Record<string, { bg: string; fg: string; border: string }> = {
  plain: { bg: 'linear-gradient(180deg,#ffffff,#f1eef6)', fg: '#2B0A2E', border: '#2B0A2E' },
  chrome: { bg: 'linear-gradient(180deg,#ffffff 0%,#dfe4ee 45%,#b9c1d1 55%,#eef1f7 100%)', fg: '#0B1B4A', border: '#0B1B4A' },
  yellow: { bg: 'linear-gradient(180deg,#FFF7B0,#FFD23F 55%,#F5B700)', fg: '#4A2A00', border: '#4A2A00' },
  lime: { bg: 'linear-gradient(180deg,#E8FFB0,#9BE33A 55%,#5DBB12)', fg: '#173B00', border: '#173B00' },
}

function ToolBtn({ children, onClick, disabled, title, active, danger, tone = 'plain' }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; title?: string; active?: boolean; danger?: boolean; tone?: keyof typeof TONES }) {
  const t = TONES[tone]
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      className="h-8 min-w-8 px-2 rounded-lg border-2 font-nunito font-extrabold text-sm leading-none transition-all disabled:opacity-35 disabled:cursor-not-allowed active:translate-y-px hover:brightness-105"
      style={{
        background: active ? 'linear-gradient(180deg,#FF9ECF,#FF2E93)' : t.bg,
        color: active ? '#fff' : danger ? '#D4006E' : t.fg,
        borderColor: t.border,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,.9), 0 2px 0 rgba(0,0,0,.25)',
      }}
    >
      {children}
    </button>
  )
}

function CatChips({ value, onChange, cats }: { value: string; onChange: (v: string) => void; cats: { id: string; label: string; color: string }[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {[{ id: 'all', label: 'all', color: '#2B0A2E' }, ...cats].map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className="font-nunito font-bold text-[12px] px-2 py-0.5 rounded-full border-2 transition-colors"
          style={value === c.id ? { background: c.color, color: '#fff', borderColor: c.color } : { background: '#fff', color: c.color, borderColor: `${c.color}66` }}
        >
          {c.label}
        </button>
      ))}
    </div>
  )
}

function EmptyShelf() {
  return (
    <div className="rounded-xl border-2 border-dashed border-[#FF2E93]/50 bg-[#FFF0F7] p-3 text-center">
      <div className="font-chango text-[#FF2E93] text-sm">shelf restocking ✦</div>
      <p className="font-pixel text-base text-[#555] leading-tight mt-1">new realistic gems, charms and gadgets are on their way. use the doodles tab meanwhile!</p>
    </div>
  )
}

function PanelBtn({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full text-left rounded-lg border-2 border-[#2B0A2E] bg-white px-3 py-2 hover:bg-[#FFE4F0] hover:-rotate-1 transition-transform" style={{ boxShadow: '2px 2px 0 #2B0A2E' }}>
      {children}
    </button>
  )
}

function ColorPick({ value, onChange, label, letter, extra }: { value: string; onChange: (c: string) => void; label: string; letter?: string; extra?: string[] }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const close = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={label}
        aria-label={label}
        className="h-8 w-9 rounded-md border-2 border-[#2B0A2E] bg-white flex flex-col items-center justify-center"
        style={{ boxShadow: '1px 1px 0 #2B0A2E' }}
      >
        {letter && <span className="font-nunito font-black text-xs leading-none">{letter}</span>}
        <span className="block rounded-sm border border-[#2B0A2E]" style={{ background: value, width: letter ? 20 : 20, height: letter ? 6 : 18 }} />
      </button>
      {open && (
        <div className="absolute z-50 top-9 left-0 bg-white border-2 border-[#2B0A2E] rounded-lg p-2 w-[176px] shadow-lg">
          <div className="grid grid-cols-7 gap-1">
            {[...(extra ?? []), ...SWATCHES].map((c, i) => (
              <button key={c + i} type="button" onClick={() => { onChange(c); setOpen(false) }} className={`w-5 h-5 rounded-full border-2 ${c.toLowerCase() === value.toLowerCase() ? 'border-[#FF4FA3]' : 'border-[#2B0A2E]'}`} style={{ background: c }} aria-label={c} />
            ))}
          </div>
          <label className="flex items-center gap-2 mt-2 font-pixel text-base">
            custom
            <input type="color" value={value.length === 7 ? value : '#FF4FA3'} onChange={(e) => onChange(e.target.value)} className="w-8 h-6 border-0 bg-transparent" />
          </label>
        </div>
      )}
    </div>
  )
}

function FramePreview({ frame }: { frame: NonNullable<ElementProps['frame']> }) {
  return <ElementView el={{ id: 'f', type: 'image', x: 0, y: 0, w: 40, h: 40, z: 0, rotation: 0, content: '', props: { frame, caption: '' } }} />
}

function QuestionsPanel({ questions, used, onAdd }: { questions: string[]; used: Set<string | undefined>; onAdd: (q: string, style: ElementProps['cardStyle']) => void }) {
  const [own, setOwn] = useState('')
  const [style, setStyle] = useState<ElementProps['cardStyle']>('card')
  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {(['card', 'lined', 'sticky'] as const).map((s) => (
          <button key={s} onClick={() => setStyle(s)} className={`flex-1 font-pixel text-base rounded border-2 border-[#2B0A2E] ${style === s ? 'bg-[#FF4FA3] text-white' : 'bg-white'}`}>{s}</button>
        ))}
      </div>
      <form
        onSubmit={(e) => { e.preventDefault(); if (own.trim()) { onAdd(own.trim(), style); setOwn('') } }}
        className="flex gap-1"
      >
        <input value={own} onChange={(e) => setOwn(e.target.value)} placeholder="ask your own question…" className="input-mini flex-1 min-w-0" aria-label="your own question" />
        <button type="submit" className="btn-bevel !px-2 !py-1 text-xs">+</button>
      </form>
      {questions.length > 0 && <div className="font-silkscreen text-[12px] text-[#D4006E] pt-1">FROM YOUR TEMPLATE</div>}
      {questions.map((q) => (
        <button key={q} onClick={() => onAdd(q, style)} className={`w-full text-left font-caveat text-lg leading-tight rounded-lg border-2 px-2 py-1.5 hover:bg-[#FFE4F0] ${used.has(q) ? 'border-[#2B0A2E]/25 text-[#888]' : 'border-[#2B0A2E] bg-white'}`}>
          {used.has(q) ? '✓ ' : '+ '}{q}
        </button>
      ))}
      <div className="font-silkscreen text-[12px] text-[#D4006E] pt-1">MORE IDEAS</div>
      {['Song stuck in my head…', 'Today I felt…', 'My comfort food…', 'Current wallpaper…', 'Last thing that made me laugh…', 'Dream vacation…'].map((q) => (
        <button key={q} onClick={() => onAdd(q, style)} className="w-full text-left font-caveat text-lg leading-tight rounded-lg border-2 border-dashed border-[#2B0A2E]/60 bg-white px-2 py-1.5 hover:bg-[#FFE4F0]">
          + {q}
        </button>
      ))}
    </div>
  )
}

