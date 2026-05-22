import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { toast } from 'sonner'
import { Badge, Button, Card, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Textarea } from '@/components/ui'
import { getApiErrorMessage } from '@/lib/api-error'
import { listMarketFeedbacks, replyFeedback } from '@/services/feedback'
import type { FeedbackResponse } from '@/types/feedback'
import { MessageSquare, Search, Star } from 'lucide-react'

type ReviewStatusFilter = 'all' | 'answered' | 'pending'

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
    { label: 'Respondidas', value: 'answered' },
    { label: 'Pendentes', value: 'pending' },
]

function getInitials(value: string) {
    return value
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'U'
}

function hasReply(feedback: FeedbackResponse) {
    return Boolean(feedback.marketReply?.trim())
}

function formatDate(dateString?: string | null) {
    if (!dateString) {
        return 'Sem data'
    }

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) {
        return 'Sem data'
    }

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    })
}

function getRatingDistribution(feedbacks: FeedbackResponse[]) {
    const total = feedbacks.length || 1

    return [5, 4, 3, 2, 1].map((stars) => {
        const count = feedbacks.filter((feedback) => feedback.vlNota === stars).length
        return { count, percentage: Math.round((count / total) * 100), stars }
    })
}

export function ReviewsTab() {
    const [searchQuery, setSearchQuery] = useState('')
    const [filterRating, setFilterRating] = useState<number | 'all'>('all')
    const [filterStatus, setFilterStatus] = useState<ReviewStatusFilter>('all')
    const [replyingTo, setReplyingTo] = useState<number | null>(null)
    const [replyText, setReplyText] = useState('')
    const queryClient = useQueryClient()

    const marketIdStr = Cookies.get('marketId')
    const marketId = marketIdStr ? Number(marketIdStr) : 0

    const {
        data: feedbacks = [],
        isLoading,
        isError,
        error,
    } = useQuery({
        queryKey: ['marketFeedbacks', marketId],
        queryFn: () => listMarketFeedbacks(marketId),
        enabled: !!marketId,
    })

    const replyMutation = useMutation({
        mutationFn: ({ feedbackId, reply }: { feedbackId: number; reply: string }) =>
            replyFeedback(feedbackId, { reply }),
        onSuccess: async () => {
            toast.success('Resposta enviada ao feedback.')
            setReplyingTo(null)
            setReplyText('')
            await queryClient.invalidateQueries({ queryKey: ['marketFeedbacks', marketId] })
        },
        onError: (replyError: unknown) => {
            toast.error(getApiErrorMessage(replyError, 'Não foi possível responder o feedback.'))
        },
    })

    const filteredFeedbacks = useMemo(() => feedbacks.filter((feedback) => {
        const normalizedSearch = searchQuery.trim().toLowerCase()
        const matchesSearch = normalizedSearch.length === 0 ||
            feedback.productName.toLowerCase().includes(normalizedSearch) ||
            feedback.clientName.toLowerCase().includes(normalizedSearch) ||
            feedback.dsComentario.toLowerCase().includes(normalizedSearch)

        const matchesRating = filterRating === 'all' || feedback.vlNota === filterRating
        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'answered' && hasReply(feedback)) ||
            (filterStatus === 'pending' && !hasReply(feedback))

        return matchesSearch && matchesRating && matchesStatus
    }), [feedbacks, filterRating, filterStatus, searchQuery])

    const pendingFeedbacks = feedbacks.filter((feedback) => !hasReply(feedback)).length
    const answeredFeedbacks = feedbacks.filter(hasReply).length
    const averageRating = feedbacks.length
        ? feedbacks.reduce((sum, feedback) => sum + feedback.vlNota, 0) / feedbacks.length
        : 0
    const responseRate = feedbacks.length ? Math.round((answeredFeedbacks / feedbacks.length) * 100) : 0

    function handleSubmitReply(feedbackId: number) {
        const trimmedReply = replyText.trim()

        if (trimmedReply.length < 3) {
            toast.error('Escreva uma resposta antes de enviar.')
            return
        }

        replyMutation.mutate({ feedbackId, reply: trimmedReply })
    }

    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Relacionamento</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Feedbacks de clientes</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            Feedbacks carregados da API do mercado. Responda comentários pendentes e acompanhe a percepção dos clientes sobre os produtos.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                        <SummaryMetric label="Média" value={averageRating.toFixed(1)} />
                        <SummaryMetric label="Pendentes" value={String(pendingFeedbacks)} tone={pendingFeedbacks > 0 ? 'warning' : 'default'} />
                        <SummaryMetric label="Resposta" value={`${responseRate}%`} />
                    </div>
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-4">
                    <Card className="gap-3 p-4">
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
                            <label className="relative">
                                <span className="sr-only">Buscar feedback</span>
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
                        {!marketId ? (
                            <Card className="p-8 text-center text-sm text-muted-foreground">
                                Faça login como supermercado para visualizar feedbacks.
                            </Card>
                        ) : isLoading ? (
                            Array.from({ length: 3 }).map((_, index) => (
                                <Card key={index} className="gap-3 p-4">
                                    <div className="flex items-start gap-3">
                                        <Skeleton className="h-10 w-10 rounded-md" />
                                        <div className="flex-1 space-y-2">
                                            <Skeleton className="h-4 w-40" />
                                            <Skeleton className="h-3 w-64" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-16 w-full" />
                                </Card>
                            ))
                        ) : isError ? (
                            <Card className="p-8 text-center text-sm text-destructive">
                                {getApiErrorMessage(error, 'Não foi possível carregar os feedbacks.')}
                            </Card>
                        ) : filteredFeedbacks.length === 0 ? (
                            <Card className="p-8 text-center text-sm text-muted-foreground">
                                Nenhum feedback encontrado com os filtros atuais.
                            </Card>
                        ) : filteredFeedbacks.map((feedback) => (
                            <FeedbackItem
                                key={feedback.id}
                                feedback={feedback}
                                replying={replyingTo === feedback.id}
                                replyText={replyText}
                                isSubmitting={replyMutation.isPending}
                                onCancelReply={() => {
                                    setReplyingTo(null)
                                    setReplyText('')
                                }}
                                onReply={() => {
                                    setReplyingTo(feedback.id)
                                    setReplyText(feedback.marketReply ?? '')
                                }}
                                onReplyTextChange={setReplyText}
                                onSubmitReply={() => handleSubmitReply(feedback.id)}
                            />
                        ))}
                    </div>
                </div>

                <aside className="space-y-4">
                    <Card className="p-5">
                        <h3 className="text-base font-semibold text-foreground">Distribuição das notas</h3>
                        <div className="mt-5 space-y-3">
                            {getRatingDistribution(feedbacks).map((item) => (
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
                            Responda primeiro feedbacks pendentes e comentários com nota baixa. A resposta fica salva no backend e aparece junto do feedback.
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

function FeedbackItem({
    feedback,
    replying,
    replyText,
    isSubmitting,
    onCancelReply,
    onReply,
    onReplyTextChange,
    onSubmitReply,
}: {
    feedback: FeedbackResponse
    replying: boolean
    replyText: string
    isSubmitting: boolean
    onCancelReply: () => void
    onReply: () => void
    onReplyTextChange: (value: string) => void
    onSubmitReply: () => void
}) {
    const replied = hasReply(feedback)

    return (
        <Card className="gap-0 p-0">
            <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-semibold text-primary">
                        {getInitials(feedback.clientName)}
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-foreground">{feedback.clientName}</p>
                            {!replied && <Badge variant="secondary" className="font-normal">Pendente</Badge>}
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">{feedback.productName}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground/80">
                            {formatDate(feedback.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-0.5" aria-label={`${feedback.vlNota} de 5 estrelas`}>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <Star
                            key={index}
                            className={`h-3.5 w-3.5 ${index < feedback.vlNota ? 'fill-uniyellow text-uniyellow' : 'text-muted-foreground/25'}`}
                        />
                    ))}
                </div>
            </div>

            <div className="space-y-4 p-4">
                <p className="text-sm leading-relaxed text-foreground">{feedback.dsComentario}</p>

                {replied && !replying ? (
                    <div className="rounded-md border border-border bg-muted/40 p-3">
                        <p className="text-xs font-semibold text-foreground">Resposta do mercado</p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{feedback.marketReply}</p>
                        {feedback.marketRepliedAt && (
                            <p className="mt-2 text-[11px] text-muted-foreground">
                                Respondido em {formatDate(feedback.marketRepliedAt)}
                            </p>
                        )}
                    </div>
                ) : replying ? (
                    <div className="space-y-3">
                        <Textarea
                            value={replyText}
                            onChange={(event) => onReplyTextChange(event.target.value)}
                            placeholder="Escreva uma resposta objetiva para o cliente"
                            rows={3}
                            maxLength={500}
                            className="resize-none text-sm"
                        />
                        <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={onCancelReply} disabled={isSubmitting}>Cancelar</Button>
                            <Button size="sm" onClick={onSubmitReply} disabled={isSubmitting}>
                                {isSubmitting ? 'Enviando...' : 'Enviar resposta'}
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-end border-t border-border pt-3">
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
