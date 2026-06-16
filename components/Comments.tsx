'use client'

import { useState, useTransition } from 'react'
import { addComment, deleteComment } from '@/app/actions/product'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  profiles: { nickname: string | null } | null
}

interface Props {
  productId: string
  initialComments: Comment[]
  currentUserId: string | null
}

export default function Comments({ productId, initialComments, currentUserId }: Props) {
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId) {
      setError('로그인 후 댓글을 달 수 있어요.')
      return
    }
    setError('')
    startTransition(async () => {
      const result = await addComment(productId, text)
      if (result.error) {
        setError(result.error)
      } else {
        setComments(prev => [...prev, {
          id: crypto.randomUUID(),
          content: text.trim(),
          created_at: new Date().toISOString(),
          user_id: currentUserId,
          profiles: null,
        }])
        setText('')
      }
    })
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      const result = await deleteComment(commentId)
      if (!result.error) {
        setComments(prev => prev.filter(c => c.id !== commentId))
      }
    })
  }

  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold text-violet-800 mb-3">댓글 {comments.length}개</h3>

      {/* 댓글 목록 */}
      <div className="flex flex-col gap-3 mb-4">
        {comments.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">첫 번째 댓글을 남겨보세요!</p>
        )}
        {comments.map((c) => {
          const nickname = c.profiles?.nickname || '고구마 이웃'
          const initial = nickname.charAt(0).toUpperCase()
          const isMe = c.user_id === currentUserId
          return (
            <div key={c.id} className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xs flex-shrink-0">
                {initial}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-medium text-gray-700">{nickname}</span>
                  <span className="text-xs text-gray-300">
                    {new Date(c.created_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{c.content}</p>
              </div>
              {isMe && (
                <button
                  onClick={() => handleDelete(c.id)}
                  disabled={pending}
                  className="text-xs text-gray-300 hover:text-red-400 transition-colors flex-shrink-0 self-start mt-0.5"
                >
                  삭제
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* 입력창 */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={currentUserId ? '댓글을 입력해주세요...' : '로그인 후 댓글을 달 수 있어요'}
          maxLength={500}
          disabled={!currentUserId || pending}
          className="flex-1 border border-violet-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400"
        />
        <button
          type="submit"
          disabled={!currentUserId || !text.trim() || pending}
          className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 transition-colors flex-shrink-0"
        >
          등록
        </button>
      </form>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
