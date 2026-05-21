import { redirect } from '@tanstack/react-router'
import Cookies from 'js-cookie'
import { clearSessionState } from './session'

function decodeJwtPayload(token: string): { exp?: number } | null {
    try {
        const payload = token.split('.')[1]

        if (!payload) {
            return null
        }

        const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
        const paddedPayload = normalizedPayload.padEnd(
            normalizedPayload.length + ((4 - (normalizedPayload.length % 4)) % 4),
            '=',
        )

        return JSON.parse(atob(paddedPayload))
    } catch {
        return null
    }
}

export function hasActiveAccessToken() {
    const token = Cookies.get('accessToken')

    if (!token) {
        return false
    }

    const payload = decodeJwtPayload(token)
    const expiresAt = payload?.exp

    if (!expiresAt) {
        clearSessionState()
        return false
    }

    const isActive = expiresAt * 1000 > Date.now()

    if (!isActive) {
        clearSessionState()
    }

    return isActive
}

export const requireAuth = () => {
    const userRole = Cookies.get('userRole')

    if (!hasActiveAccessToken() && userRole !== 'GUEST') {
        throw redirect({ to: '/login' })
    }
}

export const isAuthenticated = () => {
    if (hasActiveAccessToken()) {
        throw redirect({ to: '/dashboard' })
    }
}
