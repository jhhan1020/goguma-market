import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function ChatListPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rooms } = await supabase
    .from('chat_rooms')
    .select(`
      id, created_at,
      products(id, title, images),
      buyer:profiles!chat_rooms_buyer_id_fkey(nickname, avatar_url),
      seller:profiles!chat_rooms_seller_id_fkey(nickname, avatar_url)
    `)
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header className="sticky top-0 z-50 bg-white border-b border-violet-100 shadow-sm">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-violet-400 hover:text-violet-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-violet-800">채팅</h1>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-4">
        {rooms && rooms.length > 0 ? (
          <div className="flex flex-col divide-y divide-violet-50">
            {rooms.map((room) => {
              const product = room.products as unknown as { id: string; title: string; images: string[] | null } | null
              const buyer = room.buyer as unknown as { nickname: string | null; avatar_url: string | null } | null
              const seller = room.seller as unknown as { nickname: string | null; avatar_url: string | null } | null
              const other = user.id === (room as any).buyer_id ? seller : buyer
              const otherName = other?.nickname || '고구마 이웃'
              const thumb = product?.images?.[0]

              return (
                <Link key={room.id} href={`/chat/${room.id}`} className="flex items-center gap-4 py-4 hover:bg-violet-50/50 -mx-4 px-4 transition-colors">
                  {/* 상대방 아바타 */}
                  <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold overflow-hidden flex-shrink-0">
                    {other?.avatar_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={other.avatar_url} alt={otherName} className="w-full h-full object-cover" />
                    ) : otherName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800">{otherName}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{product?.title ?? '상품 없음'}</p>
                  </div>
                  {/* 상품 썸네일 */}
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-violet-50 flex-shrink-0 flex items-center justify-center">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={product?.title} className="w-full h-full object-cover" />
                    ) : <span className="text-xl">📦</span>}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <span className="text-6xl mb-4">💬</span>
            <p className="text-sm">아직 채팅 내역이 없어요.</p>
            <Link href="/products" className="mt-4 text-sm text-violet-500 hover:text-violet-700 underline transition-colors">
              상품 둘러보기
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
