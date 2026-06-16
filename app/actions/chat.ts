'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function getOrCreateChatRoom(productId: string, sellerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }
  if (user.id === sellerId) return { error: '본인 상품에는 채팅할 수 없어요.' }

  // 기존 방 조회
  const { data: existing } = await supabase
    .from('chat_rooms')
    .select('id')
    .eq('product_id', productId)
    .eq('buyer_id', user.id)
    .single()

  if (existing) return { roomId: existing.id }

  // 새 방 생성
  const { data, error } = await supabase
    .from('chat_rooms')
    .insert({ product_id: productId, buyer_id: user.id, seller_id: sellerId })
    .select('id')
    .single()

  if (error) return { error: '채팅방 생성 중 오류가 발생했어요.' }
  return { roomId: data.id }
}

export async function sendMessage(roomId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '로그인이 필요해요.' }

  const { error } = await supabase
    .from('chat_messages')
    .insert({ room_id: roomId, sender_id: user.id, content: content.trim() })

  if (error) return { error: '전송 중 오류가 발생했어요.' }
  return { success: true }
}

export async function redirectToChat(productId: string, sellerId: string) {
  const result = await getOrCreateChatRoom(productId, sellerId)
  if (result.error) return result
  redirect(`/chat/${result.roomId}`)
}
