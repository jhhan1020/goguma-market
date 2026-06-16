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

  const images = formData.getAll('images') as string[]

  const { data, error } = await supabase
    .from('products')
    .insert({ user_id: user.id, title, description, price, category, trade_type, images })
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
  const images = formData.getAll('images') as string[]

  const { error } = await supabase
    .from('products')
    .update({ title, description, price, category, trade_type, status, images })
    .eq('id', id)

  if (error) return { error: '수정 중 오류가 발생했어요.' }

  redirect(`/products/${id}`)
}

export async function addComment(productId: string, content: string, parentId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }
  if (!content.trim()) return { error: '댓글 내용을 입력해주세요.' }

  const { error } = await supabase
    .from('comments')
    .insert({ product_id: productId, user_id: user.id, content: content.trim(), parent_id: parentId ?? null })

  if (error) return { error: '댓글 등록 중 오류가 발생했어요.' }
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id)

  if (error) return { error: '댓글 삭제 중 오류가 발생했어요.' }
  return { success: true }
}

export async function toggleLike(productId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }

  const { data: existing } = await supabase
    .from('likes')
    .select('id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .single()

  if (existing) {
    await supabase.from('likes').delete().eq('id', existing.id)
    return { liked: false }
  } else {
    await supabase.from('likes').insert({ user_id: user.id, product_id: productId })
    return { liked: true }
  }
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
