'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AvatarUploader from '@/components/AvatarUploader'
import { updateProfile } from '@/app/actions/profile'

interface Props {
  profile: { nickname: string | null; avatar_url: string | null; bio: string | null } | null
}

export default function ProfileEditForm({ profile }: Props) {
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile?.avatar_url ?? null)
  const [error, setError] = useState('')
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    startTransition(async () => {
      const result = await updateProfile(bio, avatarUrl)
      if (result.error) { setError(result.error) }
      else { router.push('/') }
    })
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header className="sticky top-0 z-50 bg-white border-b border-violet-100 shadow-sm">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-violet-400 hover:text-violet-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-violet-800">프로필 수정</h1>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {/* 프로필 사진 */}
          <div className="flex flex-col items-center">
            <AvatarUploader currentUrl={avatarUrl} onUploaded={url => setAvatarUrl(url)} />
          </div>

          {/* 닉네임 (읽기 전용 표시) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">닉네임</label>
            <div className="border border-violet-100 rounded-xl px-4 py-3 text-sm text-gray-500 bg-gray-50">
              {profile?.nickname || '설정된 닉네임 없음'}
            </div>
          </div>

          {/* 자기소개 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">자기소개</label>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={200}
              rows={4}
              placeholder="자신을 간단히 소개해주세요 (최대 200자)"
              className="border border-violet-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white resize-none leading-relaxed"
            />
            <p className="text-xs text-gray-400 text-right">{bio.length}/200</p>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={pending}
            className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-bold text-base hover:bg-violet-700 disabled:opacity-60 transition-colors"
          >
            {pending ? '저장 중...' : '저장'}
          </button>
        </form>
      </main>
    </div>
  )
}
