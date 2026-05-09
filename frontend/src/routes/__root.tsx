// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import '../index.css'
import { Toaster } from 'sonner'
import { useEffect } from 'react'

function LightThemeInitializer() {
  useEffect(() => {
    localStorage.removeItem('unimarket-theme')
    document.documentElement.classList.remove('dark')
  }, [])

  return null
}

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen">
      <LightThemeInitializer />
      <Outlet />
      <Toaster position="top-right" richColors />
    </div>
  ),
})
