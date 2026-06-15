'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createProduct } from '@/app/actions/product'

const CATEGORIES = [
  '디지털/가전', '의류/패션', '가구/인테리어', '도서/음반',
  '스포츠/레저', '생활/주방', '뷰티/미용', '유아/아동',
  '반려동물', '취미/게임', '기타',
]

export default function SellPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState('')
  const [tradeType, setTradeType] = useState('직거래')
  const router = useRouter()

  function formatPrice(val: string) {
    const num = val.replace(/[^0-9]/g, '')
    return num ? parseInt(num).toLocaleString() : ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await createProduct(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      {/* 상단 헤더 */}
      <header className="sticky top-0 z-50 bg-white border-b border-violet-100 shadow-sm">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href="/" className="text-violet-400 hover:text-violet-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-violet-800">판매글 작성</h1>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* 제목 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">제목</label>
            <input
              name="title"
              type="text"
              required
              maxLength={40}
              placeholder="글 제목"
              className="border border-violet-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white"
            />
          </div>

          {/* 카테고리 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">카테고리</label>
            <select
              name="category"
              required
              className="border border-violet-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white text-gray-700"
            >
              <option value="">카테고리 선택</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* 가격 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">가격</label>
            <div className="relative">
              <input
                name="price"
                type="text"
                required
                inputMode="numeric"
                placeholder="0"
                value={price}
                onChange={(e) => setPrice(formatPrice(e.target.value))}
                className="border border-violet-100 rounded-xl pl-4 pr-10 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white w-full"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
            </div>
          </div>

          {/* 거래 방식 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">거래 방식</label>
            <div className="flex gap-2">
              {['직거래', '택배', '모두 가능'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTradeType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                    tradeType === t
                      ? 'bg-violet-600 text-white border-violet-600'
                      : 'bg-white text-gray-500 border-violet-100 hover:border-violet-300'
                  }`}
                >
                  {t}
                </button>
              ))}
              <input type="hidden" name="trade_type" value={tradeType} />
            </div>
          </div>

          {/* 설명 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">내용</label>
            <textarea
              name="description"
              required
              rows={8}
              placeholder="물건에 대해 자세히 설명해주세요.&#10;(상태, 구매 시기, 브랜드 등)"
              className="border border-violet-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white resize-none leading-relaxed"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-bold text-base hover:bg-violet-700 disabled:opacity-60 transition-colors"
          >
            {loading ? '등록 중...' : '완료'}
          </button>
        </form>
      </main>
    </div>
  )
}
