import { Button } from '@/components/ui'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

type GoogleCredentialResponse = {
    credential?: string
    select_by?: string
}

type GoogleButtonText = 'signin_with' | 'signup_with' | 'continue_with' | 'signin'

type GoogleAccounts = {
    id: {
        initialize: (options: {
            client_id: string
            callback: (response: GoogleCredentialResponse) => void
            ux_mode?: 'popup' | 'redirect'
            auto_select?: boolean
            cancel_on_tap_outside?: boolean
        }) => void
        renderButton: (
            parent: HTMLElement,
            options: {
                theme?: 'outline' | 'filled_blue' | 'filled_black'
                size?: 'large' | 'medium' | 'small'
                text?: GoogleButtonText
                shape?: 'rectangular' | 'pill' | 'circle' | 'square'
                width?: number
                locale?: string
            }
        ) => void
    }
}

declare global {
    interface Window {
        google?: {
            accounts: GoogleAccounts
        }
    }
}

type GoogleSignInButtonProps = {
    role: 'USER' | 'MARKET'
    mode: 'login' | 'register'
    className?: string
}

const GOOGLE_SCRIPT_ID = 'google-identity-services'
let initializedGoogleClientId: string | null = null
let activeCredentialHandler: ((credential: string) => void) | null = null

function GoogleLogo() {
    return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.31 9.14 5.38 12 5.38z" />
        </svg>
    )
}

export function GoogleSignInButton({ role, mode, className }: GoogleSignInButtonProps) {
    const buttonRef = useRef<HTMLDivElement>(null)
    const [scriptReady, setScriptReady] = useState(false)
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined
    const { loginWithGoogle, isLoggingInWithGoogle } = useAuth()
    const visibleLabel = mode === 'register' ? 'Cadastrar com Google' : 'Continuar com Google'

    useEffect(() => {
        activeCredentialHandler = (credential: string) => loginWithGoogle(credential)

        return () => {
            activeCredentialHandler = null
        }
    }, [loginWithGoogle])

    useEffect(() => {
        if (!clientId || role !== 'USER') {
            return
        }

        if (window.google?.accounts?.id) {
            setScriptReady(true)
            return
        }

        const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null
        if (existingScript) {
            existingScript.addEventListener('load', () => setScriptReady(true), { once: true })
            return
        }

        const script = document.createElement('script')
        script.id = GOOGLE_SCRIPT_ID
        script.src = 'https://accounts.google.com/gsi/client'
        script.async = true
        script.defer = true
        script.onload = () => setScriptReady(true)
        script.onerror = () => toast.error('Nao foi possivel carregar o login com Google.')

        document.body.appendChild(script)
    }, [clientId, role])

    useEffect(() => {
        if (!clientId || role !== 'USER' || !scriptReady || !window.google?.accounts?.id || !buttonRef.current) {
            return
        }

        const currentButton = buttonRef.current
        currentButton.innerHTML = ''

        if (initializedGoogleClientId !== clientId) {
            window.google.accounts.id.initialize({
                client_id: clientId,
                callback: (response) => {
                    if (!response.credential) {
                    toast.error('O Google não retornou um token de login.')
                        return
                    }

                    activeCredentialHandler?.(response.credential)
                },
                ux_mode: 'popup',
                auto_select: false,
                cancel_on_tap_outside: true,
            })
            initializedGoogleClientId = clientId
        }

        window.google.accounts.id.renderButton(currentButton, {
            theme: 'outline',
            size: 'large',
            text: mode === 'register' ? 'signup_with' : 'continue_with',
            shape: 'pill',
            width: Math.min(currentButton.offsetWidth || 384, 400),
            locale: 'pt-BR',
        })

        return () => {
            currentButton.innerHTML = ''
        }
    }, [clientId, mode, role, scriptReady])

    if (role === 'MARKET') {
        return (
            <Button
                type="button"
                variant="outline"
                className={cn('w-full rounded-full border-primary/20 bg-white/80 font-semibold text-foreground hover:border-primary/40 dark:bg-white/10', className)}
                onClick={() => toast.info('Login com Google disponível apenas para usuários. Supermercados precisam entrar com e-mail e senha.')}
            >
                <GoogleLogo />
                {visibleLabel}
            </Button>
        )
    }

    if (!clientId) {
        return (
            <Button
                type="button"
                variant="outline"
                className={cn('w-full rounded-full border-primary/20 bg-white/80 font-semibold text-foreground dark:bg-white/10', className)}
                disabled
            >
                Google não configurado
            </Button>
        )
    }

    if (!scriptReady || isLoggingInWithGoogle) {
        return (
            <Button
                type="button"
                variant="outline"
                className={cn('w-full rounded-full border-primary/20 bg-white/80 font-semibold text-foreground dark:bg-white/10', className)}
                disabled
            >
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isLoggingInWithGoogle ? 'Entrando...' : 'Carregando Google...'}
            </Button>
        )
    }

    return (
        <div className={cn('relative flex h-10 w-full items-center justify-center overflow-hidden rounded-full', className)}>
            <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-white/90 text-sm font-semibold text-foreground shadow-sm transition dark:bg-white/10">
                <GoogleLogo />
                {visibleLabel}
            </div>
            <div ref={buttonRef} className="absolute inset-0 z-20 flex w-full justify-center opacity-[0.01]" />
        </div>
    )
}
