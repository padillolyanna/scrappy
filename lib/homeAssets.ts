export interface HomeAsset {
  src: string
  alt: string
  fallback: string
}

export const HOME_ASSETS = {
  hero: {
    nb1: { src: '/home/hf-01-pink-glitter.png', alt: 'pink glitter scrapbook', fallback: '#FFB6D9' },
    nb2: { src: '/home/hf-02-zebra.png', alt: 'zebra print scrapbook', fallback: '#E0E0E0' },
    nb3: { src: '/home/hf-03-holo.png', alt: 'holographic scrapbook', fallback: '#C9A2FF' },
    nb4: { src: '/home/hf-04-leopard.png', alt: 'leopard print scrapbook', fallback: '#FFF0A8' },
  },
  photobooth: {
    booth: { src: '/home/hf-05-photobooth.png', alt: 'photobooth machine', fallback: '#A8DFFF' },
    strip1: { src: '/home/hf-06-strip-1.png', alt: 'photo strip example', fallback: '#FFB6D9' },
    strip2: { src: '/home/hf-07-strip-2.png', alt: 'decorated photo strip', fallback: '#C9A2FF' },
  },
  features: {
    scrapbook: { src: '/home/hf-08-feature-scrapbook.png', alt: 'scrapbook feature', fallback: '#FFE4F0' },
    photobooth: { src: '/home/hf-09-feature-photobooth.png', alt: 'photobooth feature', fallback: '#E4F0FF' },
    profile: { src: '/home/hf-10-feature-profile.png', alt: 'profile feature', fallback: '#F0E4FF' },
    exchange: { src: '/home/hf-11-feature-exchange.png', alt: 'exchange feature', fallback: '#E4FFF0' },
  },
  cta: {
    main: { src: '/home/hf-12-cta.png', alt: 'join scrappy', fallback: '#3A0030' },
    confetti: { src: '/home/hf-13-confetti.png', alt: 'confetti', fallback: 'transparent' },
  },
} as const
