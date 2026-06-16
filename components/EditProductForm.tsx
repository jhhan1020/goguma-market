'use client'

import { useState } from 'react'
import Link from 'next/link'
import { updateProduct } from '@/app/actions/product'
import ImageUploader from '@/components/ImageUploader'

const CATEGORIES = [
  '디지털/가전', '의류/패션', '가구/인테리어', '도서/음반',
  '스포츠/레저', '생활/주방', '뷰티/미용', '유아/아동',
  '반려동물', '취미/게임', '기타',
]

interface Product {
  id: string
  title: string
  description: string
  price: number
  category: string
  trade_type: string
  status: string
  images?: string[] | null
}

export default function EditProductForm({ product }: { product: Product }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [price, setPrice] = useState(product.price.toLocaleString())
  const [tradeType, setTradeType] = useState(product.trade_type)
  const [status, setStatus] = useState(product.status)

  function formatPrice(val: string) {
    const num = val.replace(/[^0-9]/g, '')
    return num ? parseInt(num).toLocaleString() : ''
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateProduct(product.id, formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)' }}>
      <header className="sticky top-0 z-50 bg-white border-b border-violet-100 shadow-sm">
        <div className="max-w-screen-md mx-auto px-4 h-14 flex items-center gap-3">
          <Link href={`/products/${product.id}`} className="text-violet-400 hover:text-violet-600 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </Link>
          <h1 className="text-lg font-bold text-violet-800">판매글 수정</h1>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">사진</label>
            <ImageUploader existingImages={product.images ?? []} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">제목</label>
            <input name="title" type="text" required maxLength={40} defaultValue={product.title}
              className="border border-violet-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">카테고리</label>
            <select name="category" required defaultValue={product.category}
              className="border border-violet-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white text-gray-700">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">가격</label>
            <div className="relative">
              <input name="price" type="text" required inputMode="numeric"
                value={price} onChange={(e) => setPrice(formatPrice(e.target.value))}
                className="border border-violet-100 rounded-xl pl-4 pr-10 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white w-full" />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-400">원</span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">거래 방식</label>
            <div className="flex gap-2">
              {['직거래', '택배', '모두 가능'].map((t) => (
                <button key={t} type="button" onClick={() => setTradeType(t)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${tradeType === t ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-500 border-violet-100 hover:border-violet-300'}`}>
                  {t}
                </button>
              ))}
              <input type="hidden" name="trade_type" value={tradeType} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">판매 상태</label>
            <div className="flex gap-2">
              {['판매중', '예약중', '판매완료'].map((s) => (
                <button key={s} type="button" onClick={() => setStatus(s)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${status === s ? 'bg-violet-600 text-white border-violet-600' : 'bg-white text-gray-500 border-violet-100 hover:border-violet-300'}`}>
                  {s}
                </button>
              ))}
              <input type="hidden" name="status" value={status} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-violet-700">내용</label>
            <textarea name="description" required rows={8} defaultValue={product.description}
              className="border border-violet-100 rounded-xl px-4 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-white resize-none leading-relaxed" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-3.5 rounded-xl bg-violet-600 text-white font-bold text-base hover:bg-violet-700 disabled:opacity-60 transition-colors">
            {loading ? '저장 중...' : '수정 완료'}
          </button>
        </form>
      </main>
    </div>
  )
}
