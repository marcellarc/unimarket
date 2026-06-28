import { AuthHeader } from '@/components/auth/auth-header'
import { SiteFooter } from '@/components/auth/site-footer'

type LegalPageProps = {
    variant: 'terms' | 'privacy'
}

const content = {
    terms: {
        eyebrow: 'Termos',
        title: 'Termos de uso',
        intro: 'Estes termos resumem as condições gerais para uso do UniMarket durante sua fase acadêmica e evolução como produto.',
        sections: [
            {
                title: 'Uso da plataforma',
                text: 'O UniMarket deve ser usado para consultar, cadastrar e organizar informações de produtos, mercados, preços e listas de compra. Dados incorretos podem ser revisados pela equipe do projeto.',
            },
            {
                title: 'Responsabilidade sobre informações',
                text: 'Supermercados são responsáveis por manter preços, estoque e dados cadastrais atualizados. Clientes devem revisar as informações antes de tomar decisões de compra.',
            },
            {
                title: 'Evolução do produto',
                text: 'Como o projeto ainda está em desenvolvimento, funcionalidades, telas e regras de negócio podem ser ajustadas para melhorar estabilidade, segurança e experiência de uso.',
            },
        ],
    },
    privacy: {
        eyebrow: 'Privacidade',
        title: 'Política de privacidade',
        intro: 'Esta política explica, de forma objetiva, como o UniMarket trata dados necessários para autenticação, localização e funcionamento da plataforma.',
        sections: [
            {
                title: 'Dados utilizados',
                text: 'Podem ser usados dados de cadastro, login, endereço, CEP, localização aproximada, produtos, listas, alertas e informações comerciais informadas por mercados.',
            },
            {
                title: 'Finalidade',
                text: 'Os dados são usados para autenticar usuários, aproximar resultados por região, comparar produtos, manter cadastros e melhorar a experiência dentro do UniMarket.',
            },
            {
                title: 'Segurança e contato',
                text: 'A equipe busca proteger informações sensíveis e reduzir exposição desnecessária. Solicitações sobre dados podem ser enviadas para unimarketsup@gmail.com.',
            },
        ],
    },
} as const

export function LegalPage({ variant }: LegalPageProps) {
    const page = content[variant]

    return (
        <main className="app-gradient-bg min-h-screen text-foreground">
            <AuthHeader mode="info" />

            <section className="mx-auto w-full max-w-4xl px-6 py-12 md:px-10 md:py-16">
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">{page.eyebrow}</p>
                <h1 className="mt-3 text-4xl font-bold text-foreground">{page.title}</h1>
                <p className="mt-5 text-base leading-relaxed text-muted-foreground">{page.intro}</p>

                <div className="mt-10 grid gap-5">
                    {page.sections.map((section) => (
                        <section key={section.title} className="rounded-lg border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
                            <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
                            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{section.text}</p>
                        </section>
                    ))}
                </div>
            </section>

            <SiteFooter />
        </main>
    )
}
