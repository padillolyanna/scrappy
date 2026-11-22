export type HomeAsset = { src: string; w: number; h: number; alt: string }

export const HOME_ASSETS = {
  nbPink:   { src: '/home/nb-pink-glitter.webp', w: 871,  h: 1113, alt: '' },
  nbZebra:  { src: '/home/nb-zebra.webp',        w: 888,  h: 1146, alt: '' },
  nbHolo:   { src: '/home/nb-holo.webp',         w: 853,  h: 1137, alt: '' },
  nbLeopard:{ src: '/home/nb-leopard.webp',      w: 741,  h: 1137, alt: '' },
  booth:    { src: '/home/booth.webp',           w: 842,  h: 1157, alt: 'A pastel pink purikura photo booth' },
  strip:    { src: '/home/strip.webp',           w: 453,  h: 1017, alt: 'A photo strip with four poses' },
  gemHeart: { src: '/home/gem-heart.webp',       w: 536,  h: 535,  alt: '' },
  gemLilac: { src: '/home/gem-lilac.webp',       w: 536,  h: 529,  alt: '' },
} satisfies Record<string, HomeAsset>
