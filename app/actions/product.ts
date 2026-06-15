'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createProduct(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const priceRaw = formData.get('price') as string
  const category = formData.get('category') as string
  const trade_type = formData.get('trade_type') as string
  const price = parseInt(priceRaw.replace(/,/g, ''), 10)

  if (!title || !description || !category || isNaN(price) || price < 0) {
    return { error: '모든 항목을 올바르게 입력해주세요.' }
  }

  const { data, error } = await supabase
    .from('products')
    .insert({ user_id: user.id, title, description, price, category, trade_type })
    .select('id')
    .single()

  if (error) return { error: '등록 중 오류가 발생했어요.' }

  redirect(`/products/${data.id}`)
}

export async function updateProduct(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }

  const title = (formData.get('title') as string).trim()
  const description = (formData.get('description') as string).trim()
  const priceRaw = formData.get('price') as string
  const category = formData.get('category') as string
  const trade_type = formData.get('trade_type') as string
  const status = formData.get('status') as string
  const price = parseInt(priceRaw.replace(/,/g, ''), 10)

  if (!title || !description || !category || isNaN(price) || price < 0) {
    return { error: '모든 항목을 올바르게 입력해주세요.' }
  }

  // RLS가 본인 글만 허용 — user_id 조건 없어도 DB 레벨에서 차단됨
  const { error } = await supabase
    .from('products')
    .update({ title, description, price, category, trade_type, status })
    .eq('id', id)

  if (error) return { error: '수정 중 오류가 발생했어요.' }

  redirect(`/products/${id}`)
}

export async function deleteProduct(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }

  // RLS가 본인 글만 허용
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)

  if (error) return { error: '삭제 중 오류가 발생했어요.' }

  redirect('/products')
}
