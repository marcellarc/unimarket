import { Link } from '@tanstack/react-router'

export function SiteFooter() {
    const year = new Date().getFullYear()

    return (
        <footer className="border-t border-border bg-background/80 backdrop-blur">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-6 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between md:px-10">
                <p>© {year} UniMarket. Todos os direitos reservados.</p>
                <nav className="flex flex-wrap gap-x-5 gap-y-2">
                    <Link to="/terms" className="transition hover:text-foreground">
                        Termos de uso
                    </Link>
                    <Link to="/privacy" className="transition hover:text-foreground">
                        Privacidade
                    </Link>
                    <Link to="/help" className="transition hover:text-foreground">
                        Ajuda
                    </Link>
                </nav>
            </div>
        </footer>
    )
}
