'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signUp } from '@/app/actions/auth'
import GogumaCharacter from '@/components/GogumaCharacter'

export default function SignupPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirm = formData.get('confirm') as string

    if (password !== confirm) {
      setError('비밀번호가 일치하지 않아요.')
      setLoading(false)
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.')
      setLoading(false)
      return
    }

    const result = await signUp(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--background)' }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block"><GogumaCharacter size={72} /></Link>
          <h1 className="mt-3 text-2xl font-bold text-violet-800">고구마마켓 회원가입</h1>
          <p className="mt-1 text-sm text-violet-400">함께해요, 고구마 이웃!</p>
        </div>

        {success ? (
          <div className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 text-center">
            <div className="text-4xl mb-3">📬</div>
            <p className="text-gray-700 font-medium mb-1">이메일을 확인해주세요!</p>
            <p className="text-sm text-gray-500 mb-4">{success}</p>
            <Link href="/login" className="text-sm text-violet-600 font-medium hover:underline">
              로그인 하러 가기
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-violet-100 p-6 flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-violet-700">닉네임</label>
              <input
                name="nickname"
                type="text"
                required
                placeholder="동네 이웃들에게 보여질 이름"
                className="border border-violet-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-violet-700">이메일</label>
              <input
                name="email"
                type="email"
                required
                placeholder="example@email.com"
                className="border border-violet-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-violet-700">비밀번호</label>
              <input
                name="password"
                type="password"
                required
                placeholder="6자 이상"
                className="border border-violet-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-violet-700">비밀번호 확인</label>
              <input
                name="confirm"
                type="password"
                required
                placeholder="비밀번호를 다시 입력하세요"
                className="border border-violet-100 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full py-2.5 rounded-xl bg-violet-600 text-white font-medium hover:bg-violet-700 disabled:opacity-60 transition-colors"
            >
              {loading ? '가입 중...' : '가입하기'}
            </button>
          </form>
        )}

        <p className="mt-4 text-center text-sm text-gray-400">
          이미 계정이 있나요?{' '}
          <Link href="/login" className="text-violet-600 font-medium hover:underline">
            로그인
          </Link>
        </p>
      </div>
    </div>
  )
}
