'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  currentUrl: string | null
  onUploaded: (url: string) => void
}

export default function AvatarUploader({ currentUrl, onUploaded }: Props) {
  const [preview, setPreview] = useState<string | null>(currentUrl)
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFile(file: File) {
    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`

    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { cacheControl: '3600', upsert: true })

    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      const url = `${data.publicUrl}?t=${Date.now()}`
      setPreview(url)
      onUploaded(data.publicUrl)
    }
    setUploading(false)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onClick={() => inputRef.current?.click()}
        className="w-24 h-24 rounded-full bg-violet-100 flex items-center justify-center overflow-hidden border-2 border-violet-200 cursor-pointer hover:border-violet-400 transition-colors relative"
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="프로필" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl text-violet-300">👤</span>
        )}
        {uploading && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
            <span className="text-white text-xs">업로드중</span>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="text-xs text-violet-500 hover:text-violet-700 transition-colors"
      >
        사진 변경
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  )
}
