import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function WishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: likes } = await supabase
    .from('likes')
    .select('product_id, products(id, title, price, category, trade_type, status, created_at, images)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const products = ((likes ?? [])
    .map((l) => l.products)
    .filter(Boolean) as unknown) as {
      id: string; title: string; price: number; category: string
      trade_type: string; status: string; created_at: string; images: string[] | null
    }[]

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header className="sticky top-0 z-50 bg-white border-b border-violet-100 shadow-sm">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-violet-400 hover:text-violet-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-violet-800">관심목록</h1>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-6">
        {products.length > 0 ? (
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
                  <span className="text-red-400 self-start mt-0.5 flex-shrink-0">❤️</span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-gray-300">
            <span className="text-6xl mb-4">🤍</span>
            <p className="text-sm">관심 등록한 상품이 없어요.</p>
            <Link href="/products" className="mt-4 text-sm text-violet-500 hover:text-violet-700 underline transition-colors">
              상품 둘러보기
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
