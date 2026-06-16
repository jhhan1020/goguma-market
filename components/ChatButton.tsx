'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { redirectToChat } from '@/app/actions/chat'

interface Props {
  productId: string
  sellerId: string
  isLoggedIn: boolean
}

export default function ChatButton({ productId, sellerId, isLoggedIn }: Props) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleClick() {
    if (!isLoggedIn) { router.push('/login'); return }
    setLoading(true)
    const result = await redirectToChat(productId, sellerId)
    if (result?.error) {
      alert(result.error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 disabled:opacity-60 transition-colors"
    >
      {loading ? '연결 중...' : '채팅하기'}
    </button>
  )
}
