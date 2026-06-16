import Header from '@/components/Header'
import GogumaCharacter from '@/components/GogumaCharacter'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const FEATURES = [
  { icon: '💬', title: '1:1 채팅', badge: '준비중', href: null },
  { icon: '🏘️', title: '동네 인증', badge: '준비중', href: null },
  { icon: '⭐', title: '매너 온도', badge: '준비중', href: null },
]

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: products } = await supabase
    .from('products')
    .select('id, title, price, category, trade_type, status, created_at, images')
    .eq('status', '판매중')
    .order('created_at', { ascending: false })
    .limit(5)

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <Header />

      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-b from-violet-50 to-transparent py-10 px-4 text-center">
        <div className="flex justify-center mb-2">
          <GogumaCharacter size={80} />
        </div>
        <h1 className="text-2xl font-bold text-violet-800 mb-1">고구마마켓</h1>
        <p className="text-violet-400 text-sm mb-5">우리 동네 중고거래, 따뜻하게 나눠요</p>

        {!user && (
          <div className="flex gap-3 justify-center">
            <Link href="/login" className="px-5 py-2 rounded-xl border border-violet-300 text-violet-600 text-sm font-medium hover:bg-violet-50 transition-colors">
              로그인
            </Link>
            <Link href="/signup" className="px-5 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 transition-colors">
              무료로 시작하기
            </Link>
          </div>
        )}
      </section>

      <main className="max-w-screen-md mx-auto px-4 pb-16">

        {/* 상품 목록 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <Link href="/products" className="text-base font-bold text-violet-700 hover:text-violet-500 transition-colors">
              최근 등록된 상품 →
            </Link>
            {user && (
              <Link href="/sell" className="text-xs px-3 py-1.5 rounded-lg bg-amber-400 text-white font-medium hover:bg-amber-500 transition-colors">
                + 판매하기
              </Link>
            )}
          </div>

          {products && products.length > 0 ? (
            <div className="divide-y divide-violet-50 bg-white rounded-2xl border border-violet-100 overflow-hidden shadow-sm">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/products/${p.id}`}
                  className="flex items-center gap-4 px-4 py-4 hover:bg-violet-50 transition-colors"
                >
                  {/* 썸네일 */}
                  <div className="w-16 h-16 rounded-xl bg-violet-50 flex items-center justify-center flex-shrink-0 border border-violet-100 overflow-hidden text-2xl">
                    {p.images && (p.images as string[]).length > 0 ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={(p.images as string[])[0]} alt={p.title} className="w-full h-full object-cover" />
                    ) : (
                      '📦'
                    )}
                  </div>
                  {/* 상품 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{p.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {p.category} · {p.trade_type}
                    </p>
                    <p className="text-sm font-bold text-violet-700 mt-1">
                      {p.price.toLocaleString()}원
                    </p>
                  </div>
                  {/* 상태 뱃지 */}
                  <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-100 flex-shrink-0">
                    {p.status}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-violet-100 p-10 text-center shadow-sm">
              <div className="text-4xl mb-3">🍠</div>
              <p className="text-sm text-gray-400 mb-4">아직 등록된 상품이 없어요</p>
              {user ? (
                <Link href="/sell" className="inline-block text-sm px-5 py-2 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors">
                  첫 번째 상품 등록하기
                </Link>
              ) : (
                <Link href="/signup" className="inline-block text-sm px-5 py-2 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 transition-colors">
                  가입하고 판매 시작하기
                </Link>
              )}
            </div>
          )}
        </section>

        {/* 준비 중 기능 */}
        <section className="mt-8">
          <h2 className="text-base font-bold text-violet-700 mb-3">🚀 곧 추가될 기능</h2>
          <div className="grid grid-cols-2 gap-2">
            {FEATURES.map((f) => {
              const inner = (
                <>
                  <span className="text-2xl">{f.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-violet-800">{f.title}</p>
                    <span className={`text-xs ${f.href ? 'text-green-500' : 'text-amber-500'}`}>{f.badge}</span>
                  </div>
                </>
              )
              return f.href ? (
                <Link key={f.title} href={f.href} className="bg-white border border-violet-200 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm hover:shadow-md hover:border-violet-300 transition-all">
                  {inner}
                </Link>
              ) : (
                <div key={f.title} className="bg-white border border-violet-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm opacity-70">
                  {inner}
                </div>
              )
            })}
          </div>
        </section>

      </main>
    </div>
  )
}
