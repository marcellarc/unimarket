import { AuthHeader } from '@/pages/-components/auth-header'
import { SiteFooter } from '@/pages/-components/site-footer'
import { Link } from '@tanstack/react-router'

type InfoPageProps = {
    variant: 'about' | 'help'
}

const creators = [
    'Beatriz Duarte Sibilio',
    'Kayo Campos Silva',
    'Marcella Ricoy Curci de Moura',
] as const

const productPoints = [
    'Comparação de preços por produto e supermercado.',
    'Cadastro de mercados, produtos, estoque e preços.',
    'Uso de localização para aproximar a busca da realidade do cliente.',
    'Alertas e listas para apoiar o planejamento de compras.',
] as const

const faqs = [
    {
        question: 'Como o UniMarket usa minha localização?',
        answer: 'A localização ajuda a encontrar supermercados próximos e estimar distância. O usuário pode informar CEP e endereço no perfil para melhorar a precisão.',
    },
    {
        question: 'Como comparo preços de um produto?',
        answer: 'No dashboard do cliente, busque um produto para visualizar mercados disponíveis, preço cadastrado e informações de distância quando houver endereço válido.',
    },
    {
        question: 'Sou supermercado. Como cadastro produtos?',
        answer: 'A área do mercado permite cadastrar produtos pelo código de barras ou manualmente, mantendo categoria, preço e estoque atualizados.',
    },
    {
        question: 'O projeto está pronto para uso comercial?',
        answer: 'O UniMarket nasceu como TCC, mas a base foi pensada para evoluir: autenticação, catálogo, dashboards e dados estruturados já seguem uma direção profissional.',
    },
] as const

const pageCopy = {
    about: {
        eyebrow: 'Sobre o projeto',
        title: 'UniMarket',
        description:
            'Uma plataforma para aproximar consumidores e supermercados por meio de comparação de preços, localização e gestão de produtos. O projeto começou como Trabalho de Conclusão de Curso e está sendo organizado para crescer como um produto real.',
    },
    help: {
        eyebrow: 'Central de ajuda',
        title: 'Como podemos ajudar?',
        description:
            'Respostas rápidas para usar o UniMarket, cadastrar produtos, configurar localização e entender os principais fluxos da plataforma.',
    },
} as const

export function InfoPage({ variant }: InfoPageProps) {
    const page = pageCopy[variant]

    return (
        <main className="app-gradient-bg min-h-screen text-foreground">
            <AuthHeader mode="info" />

            <section className="mx-auto w-full max-w-7xl px-6 pb-14 pt-10 md:px-10 md:pt-16">
                <div className="max-w-3xl">
                    <p className="text-sm font-semibold uppercase tracking-wide text-primary">{page.eyebrow}</p>
                    <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                        {page.title}
                    </h1>
                    <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
                        {page.description}
                    </p>
                    <div className="mt-7 flex flex-wrap gap-3">
                        <Link
                            to="/login"
                            className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                        >
                            Entrar
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex h-10 items-center justify-center rounded-md border border-border bg-background px-5 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary"
                        >
                            Criar conta
                        </Link>
                    </div>
                </div>
            </section>

            {variant === 'about' ? <AboutContent /> : <HelpContent />}

            <SiteFooter />
        </main>
    )
}

function AboutContent() {
    return (
        <section className="border-t border-border bg-white/35 backdrop-blur-sm dark:bg-slate-950/20">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 md:px-10 lg:grid-cols-[0.95fr_1.05fr]">
                <div>
                    <h2 className="text-2xl font-semibold text-foreground">Proposta</h2>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                        O UniMarket busca tornar a compra de mercado mais previsível: clientes comparam preços antes de sair de casa e supermercados ganham um canal para manter catálogo, preço e disponibilidade visíveis.
                    </p>
                    <p className="mt-4 leading-relaxed text-muted-foreground">
                        A evolução do projeto prioriza dados confiáveis, interface simples, integrações úteis e uma experiência adequada para uso recorrente, não apenas para apresentação acadêmica.
                    </p>
                </div>

                <div className="grid gap-6">
                    <section className="rounded-lg border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
                        <h2 className="text-lg font-semibold text-foreground">O que a plataforma já cobre</h2>
                        <ul className="mt-4 grid gap-3 text-sm leading-relaxed text-muted-foreground">
                            {productPoints.map((point) => (
                                <li key={point} className="border-l-2 border-primary/40 pl-3">
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-lg border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
                        <h2 className="text-lg font-semibold text-foreground">Equipe de desenvolvimento</h2>
                        <div className="mt-4 grid gap-2 sm:grid-cols-3">
                            {creators.map((creator) => (
                                <p key={creator} className="rounded-md border border-border px-3 py-3 text-sm font-medium text-foreground">
                                    {creator}
                                </p>
                            ))}
                        </div>
                        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                            Trabalho de Conclusão de Curso desenvolvido na Fatec Rubens Lara, com orientação de Rui Silvestrin. A equipe atuou em análise de requisitos, experiência do usuário, frontend, backend, banco de dados e integrações externas.
                        </p>
                    </section>
                </div>
            </div>
        </section>
    )
}

function HelpContent() {
    return (
        <section className="border-t border-border bg-white/35 backdrop-blur-sm dark:bg-slate-950/20">
            <div className="mx-auto grid w-full max-w-7xl gap-10 px-6 py-12 md:px-10 lg:grid-cols-[1.1fr_0.9fr]">
                <section className="rounded-lg border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
                    <h2 className="text-2xl font-semibold text-foreground">Dúvidas frequentes</h2>
                    <div className="mt-6 grid gap-6">
                        {faqs.map((faq) => (
                            <article key={faq.question}>
                                <h3 className="text-base font-semibold text-foreground">{faq.question}</h3>
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                            </article>
                        ))}
                    </div>
                </section>

                <aside className="space-y-6">
                    <section className="rounded-lg border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
                        <h2 className="text-lg font-semibold text-foreground">Suporte</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Para dúvidas, sugestões ou problemas de acesso, fale com a equipe pelo e-mail:
                        </p>
                        <a className="mt-3 inline-block text-sm font-semibold text-primary hover:underline" href="mailto:unimarketsup@gmail.com">
                            unimarketsup@gmail.com
                        </a>
                    </section>

                    <section className="rounded-lg border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
                        <h2 className="text-lg font-semibold text-foreground">Boas práticas de uso</h2>
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Mantenha endereço, preço, estoque e dados de produto atualizados. Isso melhora a comparação para clientes e reduz informação duplicada para supermercados.
                        </p>
                    </section>
                </aside>
            </div>
        </section>
    )
}
