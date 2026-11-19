'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  id: number
  x: number
  y: number
  el: HTMLDivElement
}

let counter = 0

export default function CursorTrail() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const particlesRef = useRef<Particle[]>([])

  useEffect(() => {
    // Skip on reduced motion or touch-only devices
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(pointer: fine)').matches
    ) return

    const container = document.createElement('div')
    container.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;'
    document.body.appendChild(container)
    containerRef.current = container

    function spawn(x: number, y: number) {
      if (particlesRef.current.length >= 20) {
        const old = particlesRef.current.shift()!
        old.el.remove()
      }

      const el = document.createElement('div')
      const size = 6 + Math.random() * 6
      const symbols = ['✦', '★', '♡', '✿', '◆']
      const sym = symbols[Math.floor(Math.random() * symbols.length)]

      el.textContent = sym
      el.style.cssText = `
        position: absolute;
        left: ${x - size / 2}px;
        top: ${y - size / 2}px;
        font-size: ${size}px;
        color: #FF4FA3;
        line-height: 1;
        opacity: 1;
        pointer-events: none;
        transition: opacity 600ms ease-out, transform 600ms ease-out;
        will-change: opacity, transform;
      `
      container.appendChild(el)

      const id = ++counter
      particlesRef.current.push({ id, x, y, el })

      requestAnimationFrame(() => {
        el.style.opacity = '0'
        el.style.transform = `translateY(-${10 + Math.random() * 14}px) rotate(${Math.random() * 60 - 30}deg) scale(0.5)`
      })

      setTimeout(() => {
        el.remove()
        particlesRef.current = particlesRef.current.filter((p) => p.id !== id)
      }, 650)
    }

    let lastTime = 0
    function onMove(e: MouseEvent) {
      const now = Date.now()
      if (now - lastTime < 40) return  // throttle ~25fps
      lastTime = now
      spawn(e.clientX, e.clientY)
    }

    document.addEventListener('mousemove', onMove, { passive: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      container.remove()
    }
  }, [])

  return null
}
