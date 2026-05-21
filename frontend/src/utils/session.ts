import Cookies from 'js-cookie'

export const SESSION_COOKIE_NAMES = [
    'accessToken',
    'refreshToken',
    'marketName',
    'userName',
    'marketEmail',
    'userEmail',
    'marketId',
    'userId',
    'userRole',
] as const

const SESSION_STORAGE_PREFIXES = [
    'unimarket.profile.',
]

const SESSION_STORAGE_KEYS = [
    'unimarket.priceAlertsEnabled',
    'unimarket.weeklySummaryEnabled',
    'unimarket.browserPushEnabled',
]

export function clearSessionCookies() {
    SESSION_COOKIE_NAMES.forEach((cookieName) => Cookies.remove(cookieName))
}

export function clearSessionStorage() {
    if (typeof window === 'undefined') {
        return
    }

    Object.keys(window.localStorage).forEach((key) => {
        if (SESSION_STORAGE_KEYS.includes(key) || SESSION_STORAGE_PREFIXES.some(prefix => key.startsWith(prefix))) {
            window.localStorage.removeItem(key)
        }
    })
}

export function clearSessionState() {
    clearSessionCookies()
    clearSessionStorage()
}
