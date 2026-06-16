import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import ChatRoom from '@/components/ChatRoom'

export default async function ChatRoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: room } = await supabase
    .from('chat_rooms')
    .select(`
      id, buyer_id, seller_id,
      products(id, title, images),
      buyer:profiles!chat_rooms_buyer_id_profiles_fkey(nickname, avatar_url),
      seller:profiles!chat_rooms_seller_id_profiles_fkey(nickname, avatar_url)
    `)
    .eq('id', roomId)
    .single()

  if (!room) notFound()

  const isBuyer = user.id === room.buyer_id
  const isSeller = user.id === room.seller_id
  if (!isBuyer && !isSeller) notFound()

  const { data: messages } = await supabase
    .from('chat_messages')
    .select('id, content, created_at, sender_id')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true })

  const product = room.products as unknown as { id: string; title: string; images: string[] | null } | null
  const buyer = room.buyer as unknown as { nickname: string | null; avatar_url: string | null } | null
  const seller = room.seller as unknown as { nickname: string | null; avatar_url: string | null } | null
  const other = isBuyer ? seller : buyer
  const otherName = other?.nickname || '고구마 이웃'

  return (
    <div className="h-screen flex flex-col" style={{ background: 'var(--background)' }}>
      {/* 헤더 */}
      <header className="bg-white border-b border-violet-100 shadow-sm flex-shrink-0">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/chat" className="text-violet-400 hover:text-violet-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-sm overflow-hidden flex-shrink-0">
            {other?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={other.avatar_url} alt={otherName} className="w-full h-full object-cover" />
            ) : otherName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-violet-800 text-sm leading-tight">{otherName}</p>
            {product && (
              <Link href={`/products/${product.id}`} className="text-xs text-gray-400 hover:text-violet-500 truncate block transition-colors">
                {product.title}
              </Link>
            )}
          </div>
          {product?.images?.[0] && (
            <Link href={`/products/${product.id}`}>
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-violet-50 flex-shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.images[0]} alt={product.title} className="w-full h-full object-cover" />
              </div>
            </Link>
          )}
        </div>
      </header>

      {/* 실시간 채팅 */}
      <ChatRoom
        roomId={roomId}
        currentUserId={user.id}
        initialMessages={messages ?? []}
      />
    </div>
  )
}
