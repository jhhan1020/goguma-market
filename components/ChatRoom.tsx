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
  // supabase 클라이언트를 ref로 고정 — 매 렌더마다 새 인스턴스 생성 방지
  const supabaseRef = useRef(createClient())

  function addMessage(msg: Message) {
    setMessages((prev) => prev.some((m) => m.id === msg.id) ? prev : [...prev, msg])
  }

  // 최신 메시지 fetch (전송 후 폴백)
  async function fetchLatest() {
    const { data } = await supabaseRef.current
      .from('chat_messages')
      .select('id, content, created_at, sender_id')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data)
  }

  // Realtime 구독
  useEffect(() => {
    const supabase = supabaseRef.current
    const channel = supabase
      .channel(`chat-room-${roomId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages', filter: `room_id=eq.${roomId}` },
        (payload) => addMessage(payload.new as Message)
      )
      .subscribe((status) => {
        // 구독 실패 시 폴링으로 대체
        if (status === 'CHANNEL_ERROR') fetchLatest()
      })

    return () => { supabase.removeChannel(channel) }
  }, [roomId]) // eslint-disable-line react-hooks/exhaustive-deps

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
    const result = await sendMessage(roomId, content)
    setSending(false)
    // Realtime이 느릴 경우를 대비해 직접 fetch
    if (!result.error) fetchLatest()
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
            {sending ? '...' : '전송'}
          </button>
        </form>
      </div>
    </>
  )
}
