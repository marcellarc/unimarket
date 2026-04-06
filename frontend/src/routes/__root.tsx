// src/routes/__root.tsx
import { createRootRoute, Outlet } from '@tanstack/react-router'
import '../index.css'
import { Toaster } from 'sonner'

export const Route = createRootRoute({
  component: () => (
    <div className="min-h-screen">
      <Outlet />
      <Toaster position="top-right" richColors />
    </div>
  ),
})