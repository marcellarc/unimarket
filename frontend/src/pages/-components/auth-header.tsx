import logoImg from '@/assets/logo-unimarket-auth.png'
import { Link } from '@tanstack/react-router'

type AuthHeaderProps = {
    mode: 'login' | 'register' | 'info'
}

export function AuthHeader({ mode }: AuthHeaderProps) {
    const actionLabel = mode === 'login' ? 'Cadastre-se' : 'Entrar'
    const actionPath: '/register' | '/login' = mode === 'login' ? '/register' : '/login'

    return (
        <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-5 md:px-10">
            <Link to="/login" className="flex items-center gap-2.5">
                <img src={logoImg} alt="UniMarket" className="h-9 w-9 object-contain" />
                <span className="auth-wordmark text-lg font-semibold text-primary">
                    UniMarket
                </span>
            </Link>

            <nav className="flex items-center gap-5 text-sm text-muted-foreground md:gap-7">
                <Link to="/about" className="hidden transition hover:text-foreground sm:inline">
                    Sobre
                </Link>
                <Link to="/help" className="hidden transition hover:text-foreground sm:inline">
                    Ajuda
                </Link>
                <span className="hidden transition hover:text-foreground sm:inline">
                    PT-BR
                </span>
                <Link to={actionPath} className="font-medium transition hover:text-primary">
                    {actionLabel}
                </Link>
            </nav>
        </header>
    )
}
