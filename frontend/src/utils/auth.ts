import { redirect } from '@tanstack/react-router'
import Cookies from 'js-cookie'

export const requireAuth = () => {
    const token = Cookies.get('accessToken')
    const userRole = Cookies.get('userRole')

    if (!token && userRole !== 'GUEST') {
        throw redirect({ to: '/login' })
    }
}

export const isAuthenticated = () => {
    const token = Cookies.get('accessToken')

    if (token) {
        throw redirect({ to: '/dashboard' })
    }
}