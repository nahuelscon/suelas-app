import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Suelas App',
  description: 'Gestión de modelos y tendencias de suelas',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Suelas App',
  },
}

export const viewport: Viewport = {
  themeColor: '#6a1b9a',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="max-w-lg mx-auto min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-gradient-to-r from-purple-900 to-purple-600 text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
          <h1 className="text-xl font-bold">Suelas App</h1>
          <p className="text-purple-200 text-xs">Gestión de modelos y tendencias</p>
        </header>

        {/* Contenido */}
        <main className="pb-24">
          {children}
        </main>

        {/* Navbar inferior */}
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-white border-t border-gray-200 flex justify-around py-2 z-50 shadow-lg">
          <a href="/" className="flex flex-col items-center py-1 px-3 text-purple-800">
            <span className="text-2xl">🏠</span>
            <span className="text-xs mt-1">Inicio</span>
          </a>
          <a href="/galeria" className="flex flex-col items-center py-1 px-3 text-gray-500">
            <span className="text-2xl">👠</span>
            <span className="text-xs mt-1">Modelos</span>
          </a>
          <a href="/subir" className="flex flex-col items-center py-1 px-3 text-gray-500">
            <span className="text-2xl bg-purple-700 text-white rounded-full w-12 h-12 flex items-center justify-center -mt-4 shadow-lg">+</span>
            <span className="text-xs mt-1">Subir</span>
          </a>
          <a href="/reportes" className="flex flex-col items-center py-1 px-3 text-gray-500">
            <span className="text-2xl">📊</span>
            <span className="text-xs mt-1">Reportes</span>
          </a>
        </nav>
      </body>
    </html>
  )
}
