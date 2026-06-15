import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Header from '@/components/Header'

const CATEGORIES = ['전체', '디지털/가전', '의류/패션', '가구/인테리어', '도서/음반', '스포츠/레저', '생활/주방', '뷰티/미용', '유아/아동', '반려동물', '취미/게임', '기타']

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>
}) {
  const { category, q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('products')
    .select('id, title, price, category, trade_type, status, created_at, user_id, profiles!products_user_id_profiles_fkey(nickname)')
    .eq('status', '판매중')
    .order('created_at', { ascending: false })

  if (category && category !== '전체') {
    query = query.eq('category', category)
  }
  if (q) {
    query = query.ilike('title', `%${q}%`)
  }

  const { data: products } = await query

  const activeCategory = category || '전체'

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />

      {/* 검색창 */}
      <div className="bg-white border-b border-violet-100">
        <div className="max-w-screen-md mx-auto px-4 py-3">
          <form method="GET">
            {activeCategory !== '전체' && (
              <input type="hidden" name="category" value={activeCategory} />
            )}
            <div className="relative">
              <input
                name="q"
                type="search"
                defaultValue={q}
                placeholder="어떤 물건을 찾고 있나요?"
                className="w-full border border-violet-100 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-violet-50"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-violet-300 text-base">🔍</span>
            </div>
          </form>
        </div>

        {/* 카테고리 탭 */}
        <div className="max-w-screen-md mx-auto px-4 pb-3 flex gap-2 overflow-x-auto scrollbar-none">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={cat === '전체' ? '/products' : `/products?category=${encodeURIComponent(cat)}`}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full border transition-all ${
                activeCategory === cat
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'bg-white text-gray-500 border-violet-100 hover:border-violet-300'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <main className="max-w-screen-md mx-auto px-4 py-4">
        {/* 결과 수 */}
        <p className="text-xs text-gray-400 mb-3">
          {q ? `"${q}" 검색 결과 ` : ''}{products?.length ?? 0}개의 상품
        </p>

        {products && products.length > 0 ? (
          <div className="divide-y divide-violet-50 bg-white rounded-2xl border border-violet-100 overflow-hidden shadow-sm">
            {products.map((p) => {
              const profile = p['profiles!products_user_id_profiles_fkey'] as { nickname: string | null } | null
              const seller = profile?.nickname || '고구마 이웃'
              return (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-violet-50 transition-colors"
                >
                  {/* 썸네일 */}
                  <div className="w-20 h-20 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 border border-violet-100 text-3xl">
                    📦
                  </div>
                  {/* 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{seller} · {timeAgo(p.created_at)}</p>
                    <p className="text-xs text-gray-400">{p.category} · {p.trade_type}</p>
                    <p className="text-sm font-bold text-violet-700 mt-1">
                      {p.price.toLocaleString()}원
                    </p>
                  </div>
                  {/* 상태 */}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 flex-shrink-0 self-start">
                    {p.status}
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-violet-100 p-12 text-center shadow-sm">
            <div className="text-4xl mb-3">🍠</div>
            <p className="text-sm text-gray-400">
              {q ? `"${q}"에 해당하는 상품이 없어요` : '아직 등록된 상품이 없어요'}
            </p>
          </div>
        )}
      </main>

      {/* 하단 판매하기 플로팅 버튼 */}
      <Link
        href="/sell"
        className="fixed bottom-6 right-4 sm:right-[calc(50%-384px+16px)] bg-violet-600 text-white font-bold px-5 py-3 rounded-2xl shadow-lg hover:bg-violet-700 transition-colors flex items-center gap-2"
      >
        <span className="text-lg">+</span> 판매하기
      </Link>
    </div>
  )
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return new Date(dateStr).toLocaleDateString('ko-KR')
}
