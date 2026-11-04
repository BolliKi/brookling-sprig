import type { Metadata, Viewport } from 'next'

import type { ChildrenType } from '@core/types'

import '@core/styles/animations.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Brookling · 灵宠禾禾',
  description:
    '宋韵山水水榭中的森野小灵：四种情绪、十二种专属动作变体、清脆童声与 2D / 3D 红枫化形。'
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FAF3E2'
}

const RootLayout = ({ children }: ChildrenType) => {
  return (
    <html lang='zh-CN'>
      <body className='h-full antialiased'>{children}</body>
    </html>
  )
}

export default RootLayout
