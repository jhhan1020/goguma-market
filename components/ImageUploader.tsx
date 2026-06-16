'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Props {
  existingImages?: string[]
  maxImages?: number
  onImagesChange?: (urls: string[]) => void
}

export default function ImageUploader({ existingImages = [], maxImages = 5, onImagesChange }: Props) {
  const [images, setImages] = useState<string[]>(existingImages)

  function updateImages(newImages: string[]) {
    setImages(newImages)
    onImagesChange?.(newImages)
  }
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    const remaining = maxImages - images.length
    const toUpload = Array.from(files).slice(0, remaining)
    if (toUpload.length === 0) return

    setUploading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setUploading(false); return }

    const uploaded: string[] = []
    for (const file of toUpload) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage
        .from('product-images')
        .upload(path, file, { cacheControl: '3600', upsert: false })
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path)
        uploaded.push(data.publicUrl)
      }
    }

    updateImages([...images, ...uploaded])
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function removeImage(url: string) {
    const path = url.split('/product-images/')[1]
    if (path) {
      await supabase.storage.from('product-images').remove([decodeURIComponent(path)])
    }
    updateImages(images.filter((u) => u !== url))
  }

  return (
    <div className="flex flex-col gap-2">
      {images.map((url, i) => (
        <input key={i} type="hidden" name="images" value={url} />
      ))}

      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((url, i) => (
            <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden border border-violet-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`이미지 ${i + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/50 rounded-full text-white text-xs flex items-center justify-center hover:bg-black/70"
              >
                ×
              </button>
              {i === 0 && (
                <span className="absolute bottom-0 left-0 right-0 text-center text-[10px] bg-violet-600/80 text-white py-0.5">
                  대표
                </span>
              )}
            </div>
          ))}

          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="w-24 h-24 rounded-xl border-2 border-dashed border-violet-200 flex flex-col items-center justify-center text-violet-300 hover:border-violet-400 hover:text-violet-400 transition-colors disabled:opacity-50"
            >
              <span className="text-2xl leading-none">+</span>
              <span className="text-[10px] mt-1">추가</span>
            </button>
          )}
        </div>
      )}

      {images.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full aspect-video rounded-xl border-2 border-dashed border-violet-200 flex flex-col items-center justify-center gap-2 text-violet-300 hover:border-violet-400 hover:text-violet-400 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <span className="text-sm">업로드 중...</span>
          ) : (
            <>
              <span className="text-4xl">📷</span>
              <span className="text-sm">사진 추가 (최대 {maxImages}장)</span>
            </>
          )}
        </button>
      )}

      {uploading && images.length > 0 && (
        <p className="text-xs text-violet-400">업로드 중...</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}
