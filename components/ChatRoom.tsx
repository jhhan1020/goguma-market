'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { sendMessage } from '@/app/actions/chat'

interface Message {
  id: string
  content: string
  created_at: string
  sender_id: string
}

interface Props {
  roomId: string
  currentUserId: string
  initialMessages: Message[]
}

export default function ChatRoom({ roomId, currentUserId, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Realtime 구독
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const msg = payload.new as Message
          setMessages((prev) => {
            // 낙관적 업데이트 중복 방지
            if (prev.some((m) => m.id === msg.id)) return prev
            return [...prev, msg]
          })
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [roomId, supabase])

  // 새 메시지 오면 맨 아래로
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || sending) return
    const content = text.trim()
    setText('')
    setSending(true)

    // 낙관적 추가
    const optimistic: Message = {
      id: crypto.randomUUID(),
      content,
      created_at: new Date().toISOString(),
      sender_id: currentUserId,
    }
    setMessages((prev) => [...prev, optimistic])

    await sendMessage(roomId, content)
    setSending(false)
  }

  function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* 메시지 영역 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 max-w-screen-md mx-auto w-full">
        {messages.length === 0 && (
          <p className="text-center text-xs text-gray-300 mt-8">첫 메시지를 보내보세요!</p>
        )}
        {messages.map((m) => {
          const isMine = m.sender_id === currentUserId
          return (
            <div key={m.id} className={`flex items-end gap-2 ${isMine ? 'flex-row-reverse' : 'flex-row'}`}>
              <div
                className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMine
                    ? 'bg-violet-600 text-white rounded-br-sm'
                    : 'bg-white text-gray-800 border border-violet-100 rounded-bl-sm'
                }`}
              >
                {m.content}
              </div>
              <span className="text-[10px] text-gray-300 flex-shrink-0 mb-0.5">{formatTime(m.created_at)}</span>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div className="bg-white border-t border-violet-100 flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-screen-md mx-auto px-4 py-3 flex gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="메시지를 입력하세요..."
            maxLength={1000}
            autoComplete="off"
            className="flex-1 border border-violet-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="px-4 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-40 transition-colors flex-shrink-0"
          >
            전송
          </button>
        </form>
      </div>
    </>
  )
}
