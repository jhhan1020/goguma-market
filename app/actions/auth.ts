'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signUp(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const nickname = formData.get('nickname') as string

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname } },
  })

  if (error) return { error: error.message }
  return { success: '가입 확인 이메일을 보냈어요. 메일함을 확인해주세요! 📬' }
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: '이메일 또는 비밀번호가 올바르지 않아요.' }
  redirect('/')
}
