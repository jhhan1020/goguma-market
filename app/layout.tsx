import type { Metadata } from 'next'
import { Jua, Noto_Sans_KR } from 'next/font/google'
import './globals.css'

const jua = Jua({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-jua',
})

const notoSansKR = Noto_Sans_KR({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-noto',
})

export const metadata: Metadata = {
  title: '🍠 고구마마켓',
  description: '우리 동네 중고거래, 고구마마켓',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`h-full ${jua.variable} ${notoSansKR.variable}`}>
      <body className={`${notoSansKR.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  )
}
