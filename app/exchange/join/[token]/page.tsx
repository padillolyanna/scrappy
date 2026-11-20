export const instant = false

import ExchangeJoinClient from './ExchangeJoinClient'

export default async function ExchangeJoinPage({ params }: PageProps<'/exchange/join/[token]'>) {
  const { token } = await params
  return <ExchangeJoinClient token={token} />
}
