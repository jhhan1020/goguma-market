import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import BackButton from '@/components/BackButton'

export default async function UserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('nickname, avatar_url, bio')
    .eq('id', id)
    .single()

  if (!profile) notFound()

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, category, trade_type, status, created_at, images')
    .eq('user_id', id)
    .order('created_at', { ascending: false })

  const nickname = profile.nickname || '고구마 이웃'
  const initial = nickname.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header className="sticky top-0 z-50 bg-white border-b border-violet-100 shadow-sm">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <BackButton />
          <h1 className="text-lg font-bold text-violet-800">{nickname}님의 판매 글</h1>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-6">
        {/* 프로필 요약 */}
        <div className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-violet-100 shadow-sm mb-6">
          <div className="w-16 h-16 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xl overflow-hidden flex-shrink-0">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={nickname} className="w-full h-full object-cover" />
            ) : initial}
          </div>
          <div>
            <p className="font-bold text-gray-800">{nickname}</p>
            {profile.bio && <p className="text-sm text-gray-500 mt-0.5">{profile.bio}</p>}
            <p className="text-xs text-violet-400 mt-1">판매 글 {products?.length ?? 0}개</p>
          </div>
        </div>

        {/* 상품 목록 */}
        {products && products.length > 0 ? (
          <div className="flex flex-col gap-3">
            {products.map((p) => {
              const thumb = p.images?.[0]
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="flex gap-4 bg-white rounded-2xl p-4 border border-violet-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-violet-50 flex-shrink-0 flex items-center justify-center">
                    {thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumb} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{p.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-500 border border-violet-100">{p.category}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-500 border border-amber-100">{p.trade_type}</span>
                      {p.status !== '판매중' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200">{p.status}</span>
                      )}
                    </div>
                    <p className="text-base font-bold text-violet-700 mt-1.5">{p.price.toLocaleString()}원</p>
                    <p className="text-xs text-gray-300 mt-0.5">
                      {new Date(p.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-300">
            <span className="text-5xl mb-3">🛒</span>
            <p className="text-sm">아직 등록된 상품이 없어요.</p>
          </div>
        )}
      </main>
    </div>
  )
}
