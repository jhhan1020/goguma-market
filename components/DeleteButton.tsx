'use client'

import { useState } from 'react'
import { deleteProduct } from '@/app/actions/product'

export default function DeleteButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm('정말 삭제할까요?')) return
    setLoading(true)
    await deleteProduct(id)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex-1 py-3 rounded-xl border border-red-200 text-red-500 font-medium text-sm hover:bg-red-50 disabled:opacity-60 transition-colors"
    >
      {loading ? '삭제 중...' : '삭제'}
    </button>
  )
}
