import { useState } from 'react';
import {
    Star,
    ThumbsUp,
    ThumbsDown,
    MessageSquare,
    Search,
    TrendingUp,
    AlertCircle,
    Check,
    X,
} from 'lucide-react';
import { Badge, Button, Card, Input, Textarea } from '@/components/ui';

const reviews = [
    {
        id: 1, productName: 'Arroz Branco Tio João 5kg', userName: 'Maria Silva', userAvatar: 'MS',
        rating: 5, date: '2026-03-05', comment: 'Excelente preço! O arroz é de ótima qualidade, muito soltinho.',
        helpful: 12, notHelpful: 1, status: 'published', replied: true, reply: 'Muito obrigado pelo seu feedback, Maria! Ficamos felizes que tenha gostado.',
    },
    {
        id: 4, productName: 'Leite Integral Itambé 1L', userName: 'Carlos Mendes', userAvatar: 'CM',
        rating: 2, date: '2026-03-02', comment: 'Produto próximo da validade. Não gostei.',
        helpful: 5, notHelpful: 3, status: 'pending', replied: false,
    },
];

const stats = {
    totalReviews: 142, averageRating: 4.6, pendingReviews: 12, responseRate: 78,
};

const ratingDistribution = [
    { stars: 5, count: 89, percentage: 62.7 },
    { stars: 4, count: 28, percentage: 19.7 },
    { stars: 3, count: 15, percentage: 10.6 },
    { stars: 2, count: 6, percentage: 4.2 },
    { stars: 1, count: 4, percentage: 2.8 },
];

export function ReviewsTab() {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRating, setFilterRating] = useState<number | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'pending'>('all');
    const [replyingTo, setReplyingTo] = useState<number | null>(null);
    const [replyText, setReplyText] = useState('');

    const filteredReviews = reviews.filter((review) => {
        const matchesSearch =
            review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.comment.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRating = filterRating === 'all' || review.rating === filterRating;
        const matchesStatus = filterStatus === 'all' || review.status === filterStatus;

        return matchesSearch && matchesRating && matchesStatus;
    });

    const handleReply = (reviewId: number) => {
        console.log(`Reply to review ${reviewId}:`, replyText);
        setReplyingTo(null);
        setReplyText('');
    };

    return (
        <div className="space-y-6">

            <div>
                <h2 className="text-xl font-bold text-foreground">Avaliações de Produtos</h2>
                <p className="text-sm text-muted-foreground">Gerencie e responda às avaliações dos seus clientes</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    {
                        icon: Star,
                        label: "Avaliação Média",
                        value: stats.averageRating,
                        detail: `${stats.totalReviews} avaliações`,
                        iconColor: "text-amber-500",
                        bgColor: "bg-amber-500/10"
                    },
                    {
                        icon: MessageSquare,
                        label: "Total de Avaliações",
                        value: stats.totalReviews,
                        detail: "+12 esta semana",
                        iconColor: "text-blue-500",
                        bgColor: "bg-blue-500/10"
                    },
                    {
                        icon: AlertCircle,
                        label: "Pendentes",
                        value: stats.pendingReviews,
                        detail: "Aguardando resposta",
                        iconColor: "text-orange-500",
                        bgColor: "bg-orange-500/10"
                    },
                    {
                        icon: TrendingUp,
                        label: "Taxa de Resposta",
                        value: `${stats.responseRate}%`,
                        detail: "Meta: 85%",
                        iconColor: "text-emerald-500",
                        bgColor: "bg-emerald-500/10"
                    }
                ].map((stat, i) => (
                    <Card key={i} className="p-4 flex flex-col gap-3">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-4 h-4 ${stat.iconColor}`} />
                            </div>
                            <span className="text-sm font-medium text-foreground">{stat.label}</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-1">{stat.detail}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">

                <div className="lg:col-span-2 space-y-4">

                    <Card className="p-4 flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                type="text"
                                placeholder="Buscar avaliação..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-background"
                            />
                        </div>

                        <select
                            value={filterRating}
                            onChange={(e) => setFilterRating(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                            className="px-3 py-2 border border-border bg-background text-foreground rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="all">Todas as estrelas</option>
                            <option value="5">5 estrelas</option>
                            <option value="4">4 estrelas</option>
                            <option value="3">3 estrelas</option>
                            <option value="2">2 estrelas</option>
                            <option value="1">1 estrela</option>
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="px-3 py-2 border border-border bg-background text-foreground rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                            <option value="all">Todos os status</option>
                            <option value="published">Respondidas</option>
                            <option value="pending">Pendentes</option>
                        </select>
                    </Card>

                    <div className="space-y-3">
                        {filteredReviews.map((review) => (
                            <Card key={review.id} className="p-4">

                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold text-sm">
                                            {review.userAvatar}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium text-sm text-foreground">{review.userName}</p>
                                                {review.status === 'pending' && (
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Pendente</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{review.productName}</p>
                                            <p className="text-xs text-muted-foreground/70">
                                                {new Date(review.date).toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>


                                    <div className="flex items-center gap-0.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star
                                                key={star}
                                                className={`w-3.5 h-3.5 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-muted/30'}`}
                                            />
                                        ))}
                                    </div>
                                </div>


                                <p className="text-sm text-foreground mb-3">{review.comment}</p>


                                <div className="pt-3 border-t border-border">
                                    {review.replied && review.reply ? (
                                        <div className="bg-secondary/50 rounded-md p-3">
                                            <p className="text-xs font-semibold text-foreground mb-1">Sua Resposta</p>
                                            <p className="text-sm text-muted-foreground">{review.reply}</p>
                                        </div>
                                    ) : replyingTo === review.id ? (
                                        <div className="space-y-2 mt-2">
                                            <Textarea
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Escreva sua resposta..."
                                                rows={2}
                                                className="resize-none text-sm bg-background"
                                            />
                                            <div className="flex items-center gap-2 justify-end">
                                                <Button size="sm" variant="ghost" onClick={() => { setReplyingTo(null); setReplyText(''); }}>
                                                    Cancelar
                                                </Button>
                                                <Button size="sm" onClick={() => handleReply(review.id)}>
                                                    <Check className="w-3.5 h-3.5 mr-1" /> Enviar
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <ThumbsUp className="w-3.5 h-3.5" /> <span>{review.helpful}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                    <ThumbsDown className="w-3.5 h-3.5" /> <span>{review.notHelpful}</span>
                                                </div>
                                            </div>
                                            <Button size="sm" variant="outline" onClick={() => setReplyingTo(review.id)}>
                                                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                                                Responder
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <Card className="p-4">
                        <div className="flex items-center gap-2 mb-4">
                            <Star className="w-4 h-4 text-muted-foreground" />
                            <h3 className="text-sm font-medium text-foreground">Distribuição</h3>
                        </div>
                        <div className="space-y-3">
                            {ratingDistribution.map((item) => (
                                <div key={item.stars} className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 w-8">
                                        <span className="text-xs font-medium text-foreground">{item.stars}</span>
                                        <Star className="w-3.5 h-3.5 text-uniyellow fill-uniyellow" />
                                    </div>
                                    <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary"
                                            style={{ width: `${item.percentage}%` }}
                                        />
                                    </div>
                                    <span className="text-xs text-muted-foreground w-8 text-right">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

            </div>
        </div>
    );
}