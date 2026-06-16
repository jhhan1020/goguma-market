'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'
import GogumaCharacter from './GogumaCharacter'

export default function Header() {
  const [user, setUser] = useState<User | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        supabase.from('profiles').select('avatar_url').eq('id', data.user.id).single()
          .then(({ data: profile }) => setAvatarUrl(profile?.avatar_url ?? null))
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        supabase.from('profiles').select('avatar_url').eq('id', session.user.id).single()
          .then(({ data: profile }) => setAvatarUrl(profile?.avatar_url ?? null))
      } else {
        setAvatarUrl(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-violet-100 shadow-sm">
      <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-1.5 font-bold text-violet-700 text-lg font-jua">
            <GogumaCharacter size={32} />
            고구마마켓
          </Link>
          <Link href="/products" className="text-sm text-gray-500 hover:text-violet-600 transition-colors hidden sm:block">
            상품목록
          </Link>
        </div>
        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href="/wishlist"
                className="text-sm text-gray-500 hover:text-violet-600 transition-colors hidden sm:block"
              >
                ❤️ 관심목록
              </Link>
              <Link
                href="/chat"
                className="text-sm text-gray-500 hover:text-violet-600 transition-colors hidden sm:block"
              >
                💬 채팅
              </Link>
              <Link
                href="/sell"
                className="text-sm px-3 py-1.5 rounded-lg bg-amber-400 text-white font-medium hover:bg-amber-500 transition-colors"
              >
                + 판매하기
              </Link>
              <Link
                href="/profile/edit"
                className="flex items-center gap-2 hover:opacity-80 transition-opacity hidden sm:flex"
              >
                <div className="w-7 h-7 rounded-full bg-violet-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="프로필" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs text-violet-500 font-bold">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-sm text-gray-400">{user.email}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-lg border border-violet-200 text-violet-600 hover:bg-violet-50 transition-colors"
              >
                로그아웃
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-gray-500 hover:text-violet-600 transition-colors"
              >
                로그인
              </Link>
              <Link
                href="/signup"
                className="text-sm px-3 py-1.5 rounded-lg bg-violet-600 text-white hover:bg-violet-700 transition-colors"
              >
                회원가입
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
