import { AuthHeader } from '@/pages/-components/auth-header'
import { Link } from '@tanstack/react-router'
import {
    CircleHelp,
    GraduationCap,
    Mail,
    MapPin,
    MessageCircle,
    ShieldCheck,
    ShoppingCart,
    Sparkles,
    Users,
} from 'lucide-react'

type InfoPageProps = {
    variant: 'about' | 'help'
}

const creators = [
    'Beatriz Duarte Sibilio',
    'Kayo Campos Silva',
    'Marcella Ricoy Curci de Moura',
] as const

const faqs = [
    {
        question: 'Como o UniMarket usa minha localização?',
        answer: 'A localização ajuda a destacar supermercados próximos e calcular distâncias. Você pode informar CEP/endereço no perfil para melhorar a precisão.',
    },
    {
        question: 'Como comparo preços de um produto?',
        answer: 'No dashboard do cliente, selecione um produto para ver mercados disponíveis, preços e distância em relação à sua localização.',
    },
    {
        question: 'Sou supermercado. Como meus dados são preenchidos?',
        answer: 'O cadastro usa o CNPJ como base para recuperar dados institucionais e endereço, mantendo a configuração do mercado mais consistente.',
    },
] as const

const pages = {
    about: {
        eyebrow: 'Projeto acadêmico',
        title: 'Sobre o UniMarket',
        description:
            'O UniMarket é uma aplicação web criada para facilitar a comparação de preços em supermercados, conectando clientes a mercados próximos por meio de uma experiência simples, acessível e orientada por localização.',
        icon: GraduationCap,
        highlights: [
            {
                icon: MapPin,
                title: 'Localização como eixo central',
                text: 'A busca considera a região do cliente para tornar a comparação de mercados mais útil e próxima da realidade de compra.',
            },
            {
                icon: ShoppingCart,
                title: 'Economia e planejamento',
                text: 'Produtos, preços e listas de compras ajudam o usuário a organizar decisões antes de sair de casa.',
            },
            {
                icon: ShieldCheck,
                title: 'Usabilidade e confiança',
                text: 'A interface prioriza clareza, acessibilidade, segurança e informações realmente úteis para clientes e mercados.',
            },
        ],
    },
    help: {
        eyebrow: 'Central de ajuda',
        title: 'Ajuda',
        description:
            'Encontre respostas rápidas para usar o UniMarket, configurar localização, comparar produtos e entrar em contato com o suporte.',
        icon: CircleHelp,
        highlights: [
            {
                icon: MapPin,
                title: 'Configure sua localização',
                text: 'Informe seu CEP ou endereço no perfil para permitir recomendações de supermercados próximos.',
            },
            {
                icon: ShoppingCart,
                title: 'Compare antes de comprar',
                text: 'Abra um produto para visualizar mercados, preços e distância em relação ao seu endereço.',
            },
            {
                icon: MessageCircle,
                title: 'Fale com o UniMarket',
                text: 'Em caso de dúvidas, sugestões ou problemas de acesso, entre em contato pelo e-mail de suporte.',
            },
        ],
    },
} as const

export function InfoPage({ variant }: InfoPageProps) {
    const page = pages[variant]
    const Icon = page.icon

    return (
        <main className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_34%_38%,#e8f5ff_0%,#f7fbff_38%,#ffffff_76%)] text-foreground">
            <AuthHeader mode="info" />

            <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 px-6 pb-16 pt-8 md:px-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                <div>
                    <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-4 py-2 text-xs font-semibold text-primary shadow-sm">
                        <Icon className="h-4 w-4" />
                        {page.eyebrow}
                    </div>
                    <h1 className="auth-title text-[2.4rem] font-extrabold leading-tight text-primary sm:text-[3rem]">
                        {page.title}
                    </h1>
                    <p className="auth-support mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
                        {page.description}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            to="/login"
                            className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:bg-primary/90"
                        >
                            Entrar
                        </Link>
                        <Link
                            to="/register"
                            className="inline-flex h-11 items-center justify-center rounded-full border border-primary/20 bg-white/70 px-6 text-sm font-semibold text-foreground transition hover:border-primary/40"
                        >
                            Criar conta
                        </Link>
                    </div>
                </div>

                <div className="grid gap-4">
                    {page.highlights.map((item) => {
                        const HighlightIcon = item.icon

                        return (
                            <article
                                key={item.title}
                                className="rounded-lg border border-primary/10 bg-white/75 p-5 shadow-sm backdrop-blur"
                            >
                                <div className="flex items-start gap-4">
                                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                                        <HighlightIcon className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <h2 className="auth-support text-base font-semibold text-foreground">
                                            {item.title}
                                        </h2>
                                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                            {item.text}
                                        </p>
                                    </div>
                                </div>
                            </article>
                        )
                    })}

                    {variant === 'about' && (
                        <section className="rounded-lg border border-primary/10 bg-primary/5 p-5">
                            <div className="mb-4 flex items-center gap-2 font-semibold text-primary">
                                <Users className="h-4 w-4" />
                                Criadores do projeto
                            </div>
                            <div className="grid gap-2">
                                {creators.map((creator) => (
                                    <div key={creator} className="rounded-lg bg-white/70 px-4 py-3 text-sm font-medium text-foreground">
                                        {creator}
                                    </div>
                                ))}
                            </div>
                            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                                Trabalho de Conclusão de Curso desenvolvido na Fatec Rubens Lara, com orientação de Rui Silvestrin.
                            </p>
                        </section>
                    )}

                    {variant === 'help' && (
                        <>
                            <section className="rounded-lg border border-primary/10 bg-white/75 p-5 shadow-sm backdrop-blur">
                                <div className="mb-4 flex items-center gap-2 font-semibold text-primary">
                                    <CircleHelp className="h-4 w-4" />
                                    Dúvidas frequentes
                                </div>
                                <div className="grid gap-4">
                                    {faqs.map((faq) => (
                                        <div key={faq.question}>
                                            <h2 className="text-sm font-semibold text-foreground">{faq.question}</h2>
                                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-lg border border-primary/10 bg-primary/5 p-5">
                                <div className="mb-2 flex items-center gap-2 font-semibold text-primary">
                                    <Mail className="h-4 w-4" />
                                    Contato
                                </div>
                                <p className="text-sm leading-relaxed text-muted-foreground">
                                    Para suporte, sugestões ou dúvidas sobre o UniMarket, envie um e-mail para{' '}
                                    <a className="font-semibold text-primary hover:underline" href="mailto:unimarketsup@gmail.com">
                                        unimarketsup@gmail.com
                                    </a>
                                    .
                                </p>
                            </section>
                        </>
                    )}

                    <div className="rounded-lg border border-primary/10 bg-primary/5 p-5 text-sm leading-relaxed text-muted-foreground">
                        <div className="mb-2 flex items-center gap-2 font-semibold text-primary">
                            <Sparkles className="h-4 w-4" />
                            Foco do projeto
                        </div>
                        A proposta valoriza usabilidade, acessibilidade, organização das informações e localização como eixo central da experiência.
                    </div>
                </div>
            </section>
        </main>
    )
}
