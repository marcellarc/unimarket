import logoImg from '@/assets/logo-unimarket-auth.png'
import { Badge, Button, Card, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton } from '@/components/ui'
import { listFeedbacks } from '@/services/feedback'
import { listAllMarketProducts } from '@/services/product'
import type { FeedbackResponse } from '@/types/feedback'
import type { MarketProductResponse } from '@/types/product'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import Cookies from 'js-cookie'
import { ArrowLeft, MessageSquare, Search, Star, Store, TrendingUp } from 'lucide-react'
import { useMemo, useState } from 'react'

type RatingFilter = 'all' | '5' | '4' | '3' | '2' | '1'
type ReplyFilter = 'all' | 'answered' | 'pending'
type ScopeFilter = 'all' | 'mine'

const ratingOptions: Array<{ id: RatingFilter; label: string }> = [
    { id: 'all', label: 'Todas as notas' },
    { id: '5', label: '5 estrelas' },
    { id: '4', label: '4 estrelas' },
    { id: '3', label: '3 estrelas' },
    { id: '2', label: '2 estrelas' },
    { id: '1', label: '1 estrela' },
]

const replyOptions: Array<{ id: ReplyFilter; label: string }> = [
    { id: 'all', label: 'Todos' },
    { id: 'answered', label: 'Com resposta' },
    { id: 'pending', label: 'Sem resposta' },
]

const scopeOptions: Array<{ id: ScopeFilter; label: string }> = [
    { id: 'all', label: 'Comunidade' },
    { id: 'mine', label: 'Meus feedbacks' },
]

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function hasReply(feedback: FeedbackResponse) {
    return Boolean(feedback.marketReply?.trim())
}

function formatDate(dateString?: string | null) {
    if (!dateString) return 'Sem data'

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return 'Sem data'

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function getInitials(value: string) {
    return value
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'U'
}

function getPriceContext(feedback: FeedbackResponse, marketProducts: MarketProductResponse[]) {
    const sameProductRows = marketProducts.filter(product => product.productId === feedback.productId)
    const marketRow = sameProductRows.find(product => product.marketId === feedback.marketId)
    const validPrices = sameProductRows
        .map(product => product.price == null ? null : Number(product.price))
        .filter((price): price is number => price != null && Number.isFinite(price) && price > 0)
    const currentPrice = marketRow?.price == null ? null : Number(marketRow.price)
    const lowestPrice = validPrices.length ? Math.min(...validPrices) : null
    const averagePrice = validPrices.length
        ? validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length
        : null
    const priceGap = currentPrice != null && lowestPrice != null ? currentPrice - lowestPrice : null

    return {
        averagePrice,
        currentPrice,
        lowestPrice,
        marketCount: sameProductRows.length,
        priceGap,
    }
}

export function FeedbacksPage() {
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [ratingFilter, setRatingFilter] = useState<RatingFilter>('all')
    const [replyFilter, setReplyFilter] = useState<ReplyFilter>('all')
    const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('all')

    const userId = Cookies.get('userId') ? Number(Cookies.get('userId')) : null
    const userRole = Cookies.get('userRole')
    const isUser = userRole === 'USER' && !!userId

    const { data: feedbacks = [], isLoading: isLoadingFeedbacks, isError } = useQuery({
        queryKey: ['feedbacks'],
        queryFn: listFeedbacks,
    })

    const { data: catalogPage, isLoading: isLoadingCatalog } = useQuery({
        queryKey: ['globalMarketProductsForFeedbacks'],
        queryFn: () => listAllMarketProducts({ page: 0, size: 240 }),
    })

    const marketProducts = catalogPage?.content ?? []

    const filteredFeedbacks = useMemo(() => {
        const normalizedSearch = searchQuery.trim().toLowerCase()

        return feedbacks
            .filter(feedback => {
                const matchesSearch = normalizedSearch.length === 0 ||
                    feedback.productName.toLowerCase().includes(normalizedSearch) ||
                    feedback.marketName.toLowerCase().includes(normalizedSearch) ||
                    feedback.clientName.toLowerCase().includes(normalizedSearch) ||
                    feedback.dsComentario.toLowerCase().includes(normalizedSearch)
                const matchesRating = ratingFilter === 'all' || feedback.vlNota === Number(ratingFilter)
                const matchesReply = replyFilter === 'all' ||
                    (replyFilter === 'answered' && hasReply(feedback)) ||
                    (replyFilter === 'pending' && !hasReply(feedback))
                const matchesScope = scopeFilter === 'all' || (isUser && feedback.clientId === userId)

                return matchesSearch && matchesRating && matchesReply && matchesScope
            })
            .sort((first, second) => new Date(second.createdAt ?? 0).getTime() - new Date(first.createdAt ?? 0).getTime())
    }, [feedbacks, isUser, ratingFilter, replyFilter, scopeFilter, searchQuery, userId])

    const averageRating = feedbacks.length
        ? feedbacks.reduce((sum, feedback) => sum + feedback.vlNota, 0) / feedbacks.length
        : 0
    const answeredCount = feedbacks.filter(hasReply).length
    const productCount = new Set(feedbacks.map(feedback => feedback.productId)).size

    return (
        <main className="app-gradient-bg min-h-screen">
            <header className="sticky top-0 z-40 border-b border-border bg-card/95 shadow-sm backdrop-blur">
                <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
                    <button
                        type="button"
                        onClick={() => navigate({ to: '/dashboard' })}
                        className="flex min-w-0 items-center gap-2.5 rounded-full pr-2 transition hover:opacity-85"
                        aria-label="Ir para o dashboard UniMarket"
                    >
                        <img src={logoImg} alt="UniMarket" className="h-9 w-9 shrink-0 object-contain" />
                        <div className="min-w-0 text-left">
                            <p className="auth-wordmark truncate text-lg font-semibold text-primary">UniMarket</p>
                            <p className="truncate text-xs text-muted-foreground">Feedbacks da comunidade</p>
                        </div>
                    </button>

                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate({ to: '/dashboard' })}
                        className="h-10 shrink-0 rounded-full border-primary/15 bg-white/80 px-3 text-muted-foreground hover:border-primary/35 hover:text-primary dark:bg-white/10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                </div>
            </header>

            <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
                <div className="mb-6 rounded-lg border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <Badge variant="secondary" className="gap-1">
                                <MessageSquare className="h-3.5 w-3.5" />
                                Comunidade
                            </Badge>
                            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                                Feedbacks de produtos e mercados
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                Consulte avaliações enviadas por usuários, respostas dos mercados e sinais de preço atual para apoiar a comparação.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <Metric label="feedbacks" value={String(feedbacks.length)} />
                            <Metric label="média" value={averageRating.toFixed(1)} />
                            <Metric label="produtos" value={String(productCount)} />
                        </div>
                    </div>
                </div>

                <Card className="mb-6 gap-3 p-4">
                    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_160px_160px_160px]">
                        <label className="relative">
                            <span className="sr-only">Buscar feedback</span>
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                value={searchQuery}
                                onChange={(event) => setSearchQuery(event.target.value)}
                                placeholder="Buscar por produto, mercado, cliente ou comentário"
                                className="pl-9"
                            />
                        </label>

                        <Select value={ratingFilter} onValueChange={(value) => setRatingFilter(value as RatingFilter)}>
                            <SelectTrigger aria-label="Filtrar por nota">
                                <SelectValue placeholder="Nota" />
                            </SelectTrigger>
                            <SelectContent>
                                {ratingOptions.map(option => (
                                    <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={replyFilter} onValueChange={(value) => setReplyFilter(value as ReplyFilter)}>
                            <SelectTrigger aria-label="Filtrar por resposta">
                                <SelectValue placeholder="Resposta" />
                            </SelectTrigger>
                            <SelectContent>
                                {replyOptions.map(option => (
                                    <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={scopeFilter} onValueChange={(value) => setScopeFilter(value as ScopeFilter)}>
                            <SelectTrigger aria-label="Filtrar por escopo">
                                <SelectValue placeholder="Escopo" />
                            </SelectTrigger>
                            <SelectContent>
                                {scopeOptions.map(option => (
                                    <SelectItem key={option.id} value={option.id} disabled={option.id === 'mine' && !isUser}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </Card>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="space-y-4">
                        {isLoadingFeedbacks ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <Card key={index} className="gap-4 p-5">
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="h-10 w-10 rounded-md" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-48" />
                                            <Skeleton className="h-3 w-72" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-16 w-full" />
                                </Card>
                            ))
                        ) : isError ? (
                            <Card className="p-8 text-center text-sm text-destructive">
                                Não foi possível carregar os feedbacks.
                            </Card>
                        ) : filteredFeedbacks.length === 0 ? (
                            <Card className="p-8 text-center text-sm text-muted-foreground">
                                Nenhum feedback encontrado com os filtros atuais.
                            </Card>
                        ) : filteredFeedbacks.map(feedback => (
                            <FeedbackCard
                                key={feedback.id}
                                feedback={feedback}
                                isOwnFeedback={isUser && feedback.clientId === userId}
                                marketProducts={marketProducts}
                            />
                        ))}
                    </div>

                    <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
                        <Card className="p-5">
                            <h2 className="text-base font-semibold text-foreground">Resumo</h2>
                            <div className="mt-4 space-y-3">
                                <SummaryRow label="Respondidos" value={`${answeredCount}/${feedbacks.length}`} />
                                <SummaryRow label="Produtos avaliados" value={String(productCount)} />
                                <SummaryRow label="Ofertas consultadas" value={isLoadingCatalog ? 'Atualizando...' : String(marketProducts.length)} />
                            </div>
                        </Card>

                        <Card className="p-5">
                            <h2 className="text-base font-semibold text-foreground">Leitura dos preços</h2>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                O preço exibido é o valor atual cadastrado no UniMarket. Ele pode ter mudado desde a data do feedback.
                            </p>
                        </Card>
                    </aside>
                </div>
            </section>
        </main>
    )
}

function Metric({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
            <p className="text-lg font-semibold tabular-nums text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/70 px-3 py-2">
            <span className="text-xs text-muted-foreground">{label}</span>
            <span className="text-sm font-semibold text-foreground">{value}</span>
        </div>
    )
}

function FeedbackCard({
    feedback,
    isOwnFeedback,
    marketProducts,
}: {
    feedback: FeedbackResponse
    isOwnFeedback: boolean
    marketProducts: MarketProductResponse[]
}) {
    const priceContext = getPriceContext(feedback, marketProducts)
    const priceGap = priceContext.priceGap ?? 0

    return (
        <Card className="gap-0 overflow-hidden p-0">
            <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(feedback.clientName)}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-base font-semibold text-foreground">{feedback.productName}</h2>
                            {isOwnFeedback && <Badge variant="secondary">Seu</Badge>}
                            {hasReply(feedback) ? <Badge variant="outline">Respondido</Badge> : <Badge variant="secondary">Sem resposta</Badge>}
                        </div>
                        <p className="mt-1 text-xs text-muted-foreground">
                            {feedback.clientName} - {formatDate(feedback.createdAt)}
                        </p>
                        <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
                            <Store className="h-3.5 w-3.5" />
                            {feedback.marketName}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-0.5" aria-label={`${feedback.vlNota} de 5 estrelas`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                            key={index}
                            className={`h-4 w-4 ${index < feedback.vlNota ? 'fill-uniyellow text-uniyellow' : 'text-muted-foreground/25'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_260px]">
                <div className="space-y-4">
                    <p className="text-sm leading-relaxed text-foreground">{feedback.dsComentario}</p>

                    {feedback.marketReply ? (
                        <div className="rounded-md border border-border bg-muted/40 p-3">
                            <p className="flex items-center gap-2 text-xs font-semibold text-foreground">
                                <MessageSquare className="h-3.5 w-3.5 text-primary" />
                                Resposta do mercado
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feedback.marketReply}</p>
                        </div>
                    ) : null}
                </div>

                <div className="rounded-lg border border-border bg-background/70 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preço atual</p>
                    {priceContext.currentPrice != null ? (
                        <>
                            <p className="mt-2 text-2xl font-semibold tabular-nums text-primary">
                                {currency.format(priceContext.currentPrice)}
                            </p>
                            <div className="mt-4 space-y-2 text-xs">
                                <PriceLine label="Menor preço" value={priceContext.lowestPrice == null ? 'Indisponível' : currency.format(priceContext.lowestPrice)} />
                                <PriceLine label="Média" value={priceContext.averagePrice == null ? 'Indisponível' : currency.format(priceContext.averagePrice)} />
                                <PriceLine label="Mercados" value={String(priceContext.marketCount)} />
                            </div>
                            {priceGap > 0.009 && (
                                <p className="mt-4 flex items-center gap-1.5 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
                                    <TrendingUp className="h-3.5 w-3.5" />
                                    {currency.format(priceGap)} acima do menor preço
                                </p>
                            )}
                        </>
                    ) : (
                        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                            Preço atual indisponível para comparação.
                        </p>
                    )}
                </div>
            </div>
        </Card>
    )
}

function PriceLine({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium text-foreground">{value}</span>
        </div>
    )
}
