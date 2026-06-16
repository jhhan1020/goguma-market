'use client'

import { useState, useTransition } from 'react'
import { toggleLike } from '@/app/actions/product'

interface Props {
  productId: string
  initialLiked: boolean
  initialCount: number
  isLoggedIn: boolean
}

export default function LikeButton({ productId, initialLiked, initialCount, isLoggedIn }: Props) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!isLoggedIn) {
      alert('로그인 후 좋아요를 누를 수 있어요!')
      return
    }
    startTransition(async () => {
      const result = await toggleLike(productId)
      if ('liked' in result) {
        setLiked(result.liked)
        setCount(prev => result.liked ? prev + 1 : prev - 1)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
      aria-label="좋아요"
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill={liked ? '#7c3aed' : 'none'}
        stroke={liked ? '#7c3aed' : '#9ca3af'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span className={`text-xs font-medium ${liked ? 'text-violet-600' : 'text-gray-400'}`}>
        {count}
      </span>
    </button>
  )
}
