import { useMemo, useState } from 'react'
import { Badge, Button, Card, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Textarea } from '@/components/ui'
import { MessageSquare, Search, Star } from 'lucide-react'

const reviews = [
    {
        id: 1,
        productName: 'Arroz Branco Tio João 5kg',
        userName: 'Maria Silva',
        userAvatar: 'MS',
        rating: 5,
        date: '2026-03-05',
        comment: 'Excelente preço. O arroz é de ótima qualidade e ficou bem soltinho.',
        helpful: 12,
        notHelpful: 1,
        status: 'published',
        replied: true,
        reply: 'Obrigado pelo feedback, Maria. Ficamos felizes que tenha gostado.',
    },
    {
        id: 4,
        productName: 'Leite Integral Itambé 1L',
        userName: 'Carlos Mendes',
        userAvatar: 'CM',
        rating: 2,
        date: '2026-03-02',
        comment: 'Produto próximo da validade. Não gostei.',
        helpful: 5,
        notHelpful: 3,
        status: 'pending',
        replied: false,
    },
]

type ReviewStatusFilter = 'all' | 'published' | 'pending'

const ratingOptions = [
    { label: 'Todas as notas', value: 'all' },
    { label: '5 estrelas', value: '5' },
    { label: '4 estrelas', value: '4' },
    { label: '3 estrelas', value: '3' },
    { label: '2 estrelas', value: '2' },
    { label: '1 estrela', value: '1' },
] as const

const statusOptions: Array<{ label: string; value: ReviewStatusFilter }> = [
    { label: 'Todos os status', value: 'all' },
    { label: 'Respondidas', value: 'published' },
    { label: 'Pendentes', value: 'pending' },
]

function getRatingDistribution() {
    const total = reviews.length || 1

    return [5, 4, 3, 2, 1].map((stars) => {
        const count = reviews.filter((review) => review.rating === stars).length
        return { count, percentage: Math.round((count / total) * 100), stars }
    })
}

export function ReviewsTab() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterRating, setFilterRating] = useState<number | 'all'>('all')
    const [filterStatus, setFilterStatus] = useState<ReviewStatusFilter>('all')
    const [replyingTo, setReplyingTo] = useState<number | null>(null)
    const [replyText, setReplyText] = useState('')

    const filteredReviews = useMemo(() => reviews.filter((review) => {
        const normalizedSearch = searchQuery.toLowerCase()
        const matchesSearch =
            review.productName.toLowerCase().includes(normalizedSearch) ||
            review.userName.toLowerCase().includes(normalizedSearch) ||
            review.comment.toLowerCase().includes(normalizedSearch)

        const matchesRating = filterRating === 'all' || review.rating === filterRating
        const matchesStatus = filterStatus === 'all' || review.status === filterStatus

        return matchesSearch && matchesRating && matchesStatus
    }), [filterRating, filterStatus, searchQuery])

    const pendingReviews = reviews.filter((review) => review.status === 'pending').length
    const answeredReviews = reviews.filter((review) => review.replied).length
    const averageRating = reviews.length
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0
    const responseRate = reviews.length ? Math.round((answeredReviews / reviews.length) * 100) : 0

    function handleReply(reviewId: number) {
        console.log(`Reply to review ${reviewId}:`, replyText)
        setReplyingTo(null)
        setReplyText('')
    }

    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Relacionamento</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Avaliações de produtos</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            Responda comentários com prioridade e acompanhe sinais de qualidade percebida pelos clientes.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <SummaryMetric label="Média" value={averageRating.toFixed(1)} />
                        <SummaryMetric label="Pendentes" value={String(pendingReviews)} tone={pendingReviews > 0 ? 'warning' : 'default'} />
                        <SummaryMetric label="Resposta" value={`${responseRate}%`} />
                    </div>
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                    <Card className="gap-3 p-4">
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
                            <label className="relative">
                                <span className="sr-only">Buscar avaliação</span>
                                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="text"
                                    placeholder="Buscar por produto, cliente ou comentário"
                                    value={searchQuery}
                                    onChange={(event) => setSearchQuery(event.target.value)}
                                    className="pl-9"
                                />
                            </label>

                            <Select
                                value={String(filterRating)}
                                onValueChange={(value) => setFilterRating(value === 'all' ? 'all' : Number(value))}
                            >
                                <SelectTrigger aria-label="Filtrar por nota">
                                    <SelectValue placeholder="Filtrar por nota" />
                                </SelectTrigger>
                                <SelectContent>
                                {ratingOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>

                            <Select
                                value={filterStatus}
                                onValueChange={(value) => setFilterStatus(value as ReviewStatusFilter)}
                            >
                                <SelectTrigger aria-label="Filtrar por status">
                                    <SelectValue placeholder="Filtrar por status" />
                                </SelectTrigger>
                                <SelectContent>
                                {statusOptions.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                        {option.label}
                                    </SelectItem>
                                ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </Card>

                    <div className="space-y-3">
                        {filteredReviews.length === 0 ? (
                            <Card className="p-8 text-center text-sm text-muted-foreground">
                                Nenhuma avaliação encontrada com os filtros atuais.
                            </Card>
                        ) : filteredReviews.map((review) => (
                            <ReviewItem
                                key={review.id}
                                review={review}
                                replying={replyingTo === review.id}
                                replyText={replyText}
                                onCancelReply={() => {
                                    setReplyingTo(null)
                                    setReplyText('')
                                }}
                                onReply={() => setReplyingTo(review.id)}
                                onReplyTextChange={setReplyText}
                                onSubmitReply={() => handleReply(review.id)}
                            />
                        ))}
                    </div>
                </div>

                <aside className="space-y-4">
                    <Card className="p-5">
                        <h3 className="text-base font-semibold text-foreground">Distribuição das notas</h3>
                        <div className="mt-5 space-y-3">
                            {getRatingDistribution().map((item) => (
                                <div key={item.stars} className="grid grid-cols-[48px_1fr_36px] items-center gap-3">
                                    <div className="flex items-center gap-1 text-sm text-foreground">
                                        {item.stars}
                                        <Star className="h-3.5 w-3.5 fill-uniyellow text-uniyellow" />
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-secondary">
                                        <div className="h-full rounded-full bg-primary" style={{ width: `${item.percentage}%` }} />
                                    </div>
                                    <span className="text-right text-xs text-muted-foreground">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </Card>

                    <Card className="p-5">
                        <h3 className="text-base font-semibold text-foreground">Critério de atendimento</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            Responda primeiro avaliações pendentes e comentários com nota baixa. Isso melhora confiança e reduz atrito no pós-compra.
                        </p>
                    </Card>
                </aside>
            </div>
        </div>
    )
}

function SummaryMetric({
    label,
    value,
    tone = 'default',
}: {
    label: string
    value: string
    tone?: 'default' | 'warning'
}) {
    return (
        <div className={`rounded-lg border px-4 py-3 ${tone === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-border bg-background/70'}`}>
            <p className="text-lg font-semibold tabular-nums text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    )
}

function ReviewItem({
    review,
    replying,
    replyText,
    onCancelReply,
    onReply,
    onReplyTextChange,
    onSubmitReply,
}: {
    review: (typeof reviews)[number]
    replying: boolean
    replyText: string
    onCancelReply: () => void
    onReply: () => void
    onReplyTextChange: (value: string) => void
    onSubmitReply: () => void
}) {
    return (
        <Card className="gap-0 p-0">
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                        {review.userAvatar}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{review.userName}</p>
                            {review.status === 'pending' && <Badge variant="secondary" className="font-normal">Pendente</Badge>}
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{review.productName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/80">
                            {new Date(review.date).toLocaleDateString('pt-BR')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-0.5" aria-label={`${review.rating} de 5 estrelas`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                            key={index}
                            className={`h-3.5 w-3.5 ${index < review.rating ? 'fill-uniyellow text-uniyellow' : 'text-muted-foreground/25'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-4 p-4">
                <p className="text-sm leading-relaxed text-foreground">{review.comment}</p>

                {review.replied && review.reply ? (
                    <div className="rounded-md border border-border bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-foreground">Resposta do mercado</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.reply}</p>
                    </div>
                ) : replying ? (
                    <div className="space-y-3">
                        <Textarea
                            value={replyText}
                            onChange={(event) => onReplyTextChange(event.target.value)}
                            placeholder="Escreva uma resposta objetiva para o cliente"
                            rows={3}
                            className="resize-none text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={onCancelReply}>Cancelar</Button>
                            <Button size="sm" onClick={onSubmitReply}>Enviar resposta</Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            {review.helpful} pessoa(s) marcaram como útil · {review.notHelpful} como não útil
                        </p>
                        <Button size="sm" variant="outline" onClick={onReply}>
                            <MessageSquare className="h-3.5 w-3.5" />
                            Responder
                        </Button>
                    </div>
                )}
            </div>
        </Card>
    )
}
