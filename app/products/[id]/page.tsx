import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import DeleteButton from '@/components/DeleteButton'
import ImageGallery from '@/components/ImageGallery'
import LikeButton from '@/components/LikeButton'
import Comments from '@/components/Comments'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*, profiles!products_user_id_profiles_fkey(nickname)')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === product.user_id

  const { count: likeCount } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', id)

  const { data: myLike } = user
    ? await supabase.from('likes').select('id').eq('product_id', id).eq('user_id', user.id).single()
    : { data: null }

  const { data: myProfile } = user
    ? await supabase.from('profiles').select('nickname').eq('id', user.id).single()
    : { data: null }

  const { data: comments } = await supabase
    .from('comments')
    .select('id, content, created_at, user_id, parent_id, profiles!comments_user_id_profiles_fkey(nickname)')
    .eq('product_id', id)
    .order('created_at', { ascending: true })
  const profile = (product.profiles as unknown as { nickname: string | null } | null)
  const sellerName = profile?.nickname || '고구마 이웃'
  const sellerInitial = sellerName.charAt(0).toUpperCase()
  const images: string[] = product.images ?? []

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header className="sticky top-0 z-50 bg-white border-b border-violet-100 shadow-sm">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/products" className="text-violet-400 hover:text-violet-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="text-base font-bold text-violet-800 truncate flex-1">{product.title}</h1>
          {/* 본인: 수정 버튼 헤더에 */}
          {isOwner && (
            <Link
              href={`/products/${id}/edit`}
              className="text-sm px-3 py-1.5 rounded-lg border border-violet-200 text-violet-600 hover:bg-violet-50 transition-colors flex-shrink-0"
            >
              수정
            </Link>
          )}
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-6 pb-28">
        {/* 이미지 갤러리 */}
        {images.length > 0 ? (
          <ImageGallery images={images} />
        ) : (
          <div className="w-full aspect-square bg-violet-50 rounded-2xl flex flex-col items-center justify-center mb-6 border border-violet-100">
            <span className="text-7xl mb-2">📦</span>
            <span className="text-sm text-violet-300">사진 없음</span>
          </div>
        )}

        {/* 판매자 정보 */}
        <div className="flex items-center gap-3 py-4 border-b border-violet-50 mb-5">
          <div className="w-11 h-11 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold">
            {sellerInitial}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">{sellerName}</p>
            <p className="text-xs text-gray-400">판매자</p>
          </div>
        </div>

        {/* 뱃지 */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-500 border border-violet-100">{product.category}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-500 border border-amber-100">{product.trade_type}</span>
          <span className="text-xs px-2.5 py-1 rounded-full bg-green-50 text-green-600 border border-green-100">{product.status}</span>
        </div>

        {/* 제목 + 날짜 */}
        <h2 className="text-xl font-bold text-gray-800 mb-1">{product.title}</h2>
        <p className="text-xs text-gray-400 mb-5">
          {new Date(product.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        {/* 본문 */}
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mb-6">{product.description}</p>

        {/* 구분선 */}
        <div className="border-t border-violet-50" />

        {/* 댓글 */}
        <Comments
          productId={id}
          initialComments={(comments ?? []) as Parameters<typeof Comments>[0]['initialComments']}
          currentUserId={user?.id ?? null}
          currentUserNickname={myProfile?.nickname ?? null}
        />
      </main>

      {/* 하단 고정 바 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-violet-100">
        <div className="max-w-screen-md mx-auto px-4 py-3 flex items-center gap-3">
          <LikeButton
            productId={id}
            initialLiked={!!myLike}
            initialCount={likeCount ?? 0}
            isLoggedIn={!!user}
          />

          <div className="flex-shrink-0">
            <p className="text-xs text-gray-400">가격</p>
            <p className="text-xl font-bold text-violet-800">{product.price.toLocaleString()}원</p>
          </div>

          {isOwner && (
            <div className="flex-1 flex justify-end">
              <DeleteButton id={id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
