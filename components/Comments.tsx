'use client'

import { useState, useTransition } from 'react'
import { addComment, deleteComment } from '@/app/actions/product'

interface Comment {
  id: string
  content: string
  created_at: string
  user_id: string
  parent_id: string | null
  profiles: { nickname: string | null } | null
}

interface Props {
  productId: string
  initialComments: Comment[]
  currentUserId: string | null
  currentUserNickname: string | null
}

export default function Comments({ productId, initialComments, currentUserId, currentUserNickname }: Props) {
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState<string | null>(null) // parent comment id
  const [replyText, setReplyText] = useState('')
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()

  function makeOptimistic(content: string, parentId?: string): Comment {
    return {
      id: crypto.randomUUID(),
      content: content.trim(),
      created_at: new Date().toISOString(),
      user_id: currentUserId!,
      parent_id: parentId ?? null,
      profiles: { nickname: currentUserNickname },
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!currentUserId) { setError('로그인 후 댓글을 달 수 있어요.'); return }
    setError('')
    startTransition(async () => {
      const result = await addComment(productId, text)
      if (result.error) { setError(result.error) }
      else { setComments(prev => [...prev, makeOptimistic(text)]); setText('') }
    })
  }

  function handleReplySubmit(e: React.FormEvent, parentId: string) {
    e.preventDefault()
    if (!currentUserId) return
    startTransition(async () => {
      const result = await addComment(productId, replyText, parentId)
      if (!result.error) {
        setComments(prev => [...prev, makeOptimistic(replyText, parentId)])
        setReplyText('')
        setReplyTo(null)
      }
    })
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      const result = await deleteComment(commentId)
      if (!result.error) {
        setComments(prev => prev.filter(c => c.id !== commentId && c.parent_id !== commentId))
      }
    })
  }

  const topLevel = comments.filter(c => !c.parent_id)
  const replies = (parentId: string) => comments.filter(c => c.parent_id === parentId)

  function renderComment(c: Comment, isReply = false) {
    const nickname = c.profiles?.nickname || '고구마 이웃'
    const initial = nickname.charAt(0).toUpperCase()
    const isMe = c.user_id === currentUserId
    const childReplies = replies(c.id)

    return (
      <div key={c.id} className={isReply ? 'ml-10' : ''}>
        <div className="flex gap-2.5">
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
            {!isReply && currentUserId && (
              <button
                onClick={() => setReplyTo(replyTo === c.id ? null : c.id)}
                className="text-xs text-violet-400 hover:text-violet-600 mt-1 transition-colors"
              >
                {replyTo === c.id ? '취소' : '답글'}
              </button>
            )}
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

        {/* 답글 목록 */}
        {childReplies.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {childReplies.map(r => renderComment(r, true))}
          </div>
        )}

        {/* 답글 입력창 */}
        {replyTo === c.id && (
          <form onSubmit={e => handleReplySubmit(e, c.id)} className="mt-2 ml-10 flex gap-2">
            <input
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              placeholder="답글을 입력해주세요..."
              maxLength={500}
              autoFocus
              disabled={pending}
              className="flex-1 border border-violet-100 rounded-xl px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || pending}
              className="px-3 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 transition-colors flex-shrink-0"
            >
              등록
            </button>
          </form>
        )}
      </div>
    )
  }

  const totalCount = comments.length

  return (
    <div className="mt-6">
      <h3 className="text-sm font-bold text-violet-800 mb-3">댓글 {totalCount}개</h3>

      <div className="flex flex-col gap-4 mb-4">
        {topLevel.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-4">첫 번째 댓글을 남겨보세요!</p>
        )}
        {topLevel.map(c => renderComment(c))}
      </div>

      {/* 최상위 댓글 입력창 */}
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
