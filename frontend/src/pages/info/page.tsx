import { useState, type ReactNode } from 'react'
import { AuthHeader } from '@/pages/-components/auth-header'
import { SiteFooter } from '@/pages/-components/site-footer'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import {
    ArrowRight,
    Check,
    CircleHelp,
    Info,
    Mail,
    Minus,
    Plus,
    Sparkles,
} from 'lucide-react'

type InfoPageProps = {
    variant: 'about' | 'help'
}

const team = [
    {
        initials: 'BS',
        name: 'Beatriz Duarte Sibilio',
        imageSrc: '/team/beatriz.jpg',
        role: 'Descrição...',
    },
    {
        initials: 'KC',
        name: 'Kayo Campos Silva',
        imageSrc: '/team/kayo.jpg',
        role: 'Descrição...',
    },
    {
        initials: 'MM',
        name: 'Marcella Ricoy Curci de Moura',
        imageSrc: '/team/marcella.jpg',
        role: 'Desenvolvedora frontend, responsável pela interface, experiência do usuário e integração com backend.',
    },
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
        <main className="app-gradient-bg flex min-h-screen flex-col text-foreground">
            <AuthHeader mode="info" />

            <section className="mx-auto w-full max-w-7xl px-6 pb-10 pt-14 md:px-10 md:pb-14 md:pt-20">
                <div className="max-w-3xl">
                    <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-primary">
                        <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
                        {page.eyebrow}
                    </p>
                    <h1 className="mt-3 text-4xl font-bold leading-tight text-foreground sm:text-5xl">
                        {page.title}
                    </h1>
                    <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                        {page.description}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Button asChild size="lg" className="shadow-sm">
                            <Link to="/login">Entrar</Link>
                        </Button>
                        <Button asChild size="lg" variant="outline">
                            <Link to="/register">Criar conta</Link>
                        </Button>
                    </div>
                </div>
            </section>

            <div className="flex-1">
                {variant === 'about' ? <AboutContent /> : <HelpContent />}
            </div>

            <SiteFooter />
        </main>
    )
}

function AboutContent() {
    return (
        <section className="mx-auto grid w-full max-w-7xl gap-10 px-6 pb-24 pt-4 md:px-10 lg:grid-cols-[0.9fr_1fr] lg:items-start">
            <div className="space-y-10">
                <section>
                    <h2 className="text-2xl font-semibold text-foreground">Proposta</h2>
                    <div className="mt-4 h-0.5 w-16 rounded-full bg-primary/45" />
                    <p className="mt-6 leading-relaxed text-muted-foreground">
                        O UniMarket busca tornar a compra de mercado mais previsível: clientes comparam preços antes de sair de casa e supermercados ganham um canal para manter catálogo, preço e disponibilidade visíveis.
                    </p>
                    <p className="mt-5 leading-relaxed text-muted-foreground">
                        A evolução do projeto prioriza dados confiáveis, interface simples, integrações úteis e uma experiência adequada para uso recorrente, não apenas para apresentação acadêmica.
                    </p>
                </section>
            </div>

            <div className="grid gap-6">
                <section className="rounded-lg border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
                    <CardHeading icon={<Sparkles className="size-4" />} title="O que a plataforma já cobre" />
                    <ul className="mt-6 grid gap-4 text-sm leading-relaxed text-muted-foreground">
                        {productPoints.map((point) => (
                            <li key={point} className="flex gap-3">
                                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="rounded-lg border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
                    <CardHeading icon={<Info className="size-4" />} title="Equipe de desenvolvimento" />
                    <div className="mt-6 grid gap-5">
                        {team.map((member) => (
                            <article key={member.name} className="flex gap-4 border-b border-border pb-5 last:border-b-0 last:pb-0">
                                <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/15 bg-primary text-sm font-bold text-primary-foreground shadow-sm">
                                    <span aria-hidden="true">{member.initials}</span>
                                    <img
                                        src={member.imageSrc}
                                        alt={`Foto de ${member.name}`}
                                        className="absolute inset-0 size-full object-cover"
                                        onError={(event) => {
                                            event.currentTarget.style.display = 'none'
                                        }}
                                    />
                                </div>
                                <div>
                                    <h3 className="font-semibold leading-6 text-foreground">{member.name}</h3>
                                    <p className="mt-1 text-sm leading-6 text-muted-foreground">{member.role}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                    <p className="mt-6 text-sm leading-7 text-muted-foreground">
                        Trabalho de Conclusão de Curso desenvolvido na Fatec Rubens Lara, com orientação de Rui Silvestrin. A equipe atuou em análise de requisitos, experiência do usuário, frontend, backend, banco de dados e integrações externas.
                    </p>
                </section>
            </div>
        </section>
    )
}

function HelpContent() {
    return (
        <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 pb-24 pt-4 md:px-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
            <FaqPanel />

            <aside className="grid gap-6">
                <section className="rounded-lg border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
                    <CardHeading icon={<Mail className="size-4" />} title="Suporte" />
                    <p className="mt-5 text-sm leading-7 text-muted-foreground">
                        Para dúvidas, sugestões ou problemas de acesso, fale com a equipe pelo e-mail:
                    </p>
                    <a className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80" href="mailto:unimarketsup@gmail.com">
                        unimarketsup@gmail.com
                        <ArrowRight className="size-4" />
                    </a>
                </section>

                <section className="rounded-lg border border-border bg-card/90 p-6 shadow-sm backdrop-blur">
                    <CardHeading icon={<Check className="size-4" />} title="Boas práticas de uso" />
                    <p className="mt-5 text-sm leading-7 text-muted-foreground">
                        Mantenha endereço, preço, estoque e dados de produto atualizados. Isso melhora a comparação para clientes e reduz informação duplicada para supermercados.
                    </p>
                </section>

                <section className="rounded-lg bg-primary p-6 text-primary-foreground shadow-sm">
                    <p className="text-sm font-medium text-primary-foreground/85">Não encontrou o que procura?</p>
                    <h2 className="mt-2 text-2xl font-semibold">Conte sua necessidade.</h2>
                    <a className="mt-5 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 hover:underline" href="mailto:unimarketsup@gmail.com">
                        Falar com a equipe
                        <ArrowRight className="size-4" />
                    </a>
                </section>
            </aside>
        </section>
    )
}

function FaqPanel() {
    const [openQuestion, setOpenQuestion] = useState<string>(faqs[0].question)

    return (
        <section className="min-h-[30rem] rounded-lg border border-border bg-card/90 p-6 shadow-sm backdrop-blur sm:p-8">
            <CardHeading icon={<CircleHelp className="size-4" />} title="Dúvidas frequentes" titleClassName="text-2xl" />
            <div className="mt-7 divide-y divide-border">
                {faqs.map((faq) => {
                    const isOpen = openQuestion === faq.question

                    return (
                        <article key={faq.question} className="py-5 first:pt-0 last:pb-0">
                            <button
                                type="button"
                                aria-expanded={isOpen}
                                className="flex w-full items-center justify-between gap-4 text-left"
                                onClick={() => setOpenQuestion(isOpen ? '' : faq.question)}
                            >
                                <span className="font-semibold leading-6 text-foreground">{faq.question}</span>
                                <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-border text-primary">
                                    {isOpen ? <Minus className="size-3.5" /> : <Plus className="size-3.5" />}
                                </span>
                            </button>
                            {isOpen ? (
                                <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">
                                    {faq.answer}
                                </p>
                            ) : null}
                        </article>
                    )
                })}
            </div>
        </section>
    )
}

function CardHeading({
    icon,
    title,
    titleClassName = 'text-lg',
}: {
    icon: ReactNode
    title: string
    titleClassName?: string
}) {
    return (
        <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                {icon}
            </span>
            <h2 className={`${titleClassName} font-semibold text-foreground`}>{title}</h2>
        </div>
    )
}
