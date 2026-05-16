// src/routes/__root.tsx
import { createRootRoute, Outlet, useRouterState } from '@tanstack/react-router'
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

function RouteTransition() {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  return (
    <div key={pathname} className="route-transition min-h-screen">
      <Outlet />
    </div>
  )
}

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen">
      <LightThemeInitializer />
      <RouteTransition />
      <Toaster position="top-right" richColors />
    </div>
  ),
})
