'use client'

import Link from 'next/link'

export default function ProfileEditButton({ username }: { username: string }) {
  return (
    <Link
      href={`/profile/${username}/edit`}
      className="btn-y2k text-xs py-1 px-3"
      style={{ fontSize: '12px' }}
    >
      edit profile
    </Link>
  )
}
