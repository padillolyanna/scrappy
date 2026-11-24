import type { Metadata } from 'next'
import PetStudio from '@/components/pet/PetStudio'

export const metadata: Metadata = {
  title: 'My Little Pet ♡ | Scrappy',
  description: 'Dress up your own Scrappy virtual pet with bows, glasses, outfits and sparkly effects, and collect new accessories as you make scrapbooks.',
}

export default function PetPage() {
  return <PetStudio />
}
