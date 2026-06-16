'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateProfile(bio: string, avatarUrl: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: '로그인이 필요해요.' }

  const { error } = await supabase
    .from('profiles')
    .update({ bio: bio.trim(), ...(avatarUrl !== undefined && { avatar_url: avatarUrl }) })
    .eq('id', user.id)

  if (error) return { error: '저장 중 오류가 발생했어요.' }
  return { success: true }
}
