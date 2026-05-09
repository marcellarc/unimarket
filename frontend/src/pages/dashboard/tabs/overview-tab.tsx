import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button, Skeleton } from '@/components/ui';
import { Package, Search, ListPlus, Users, Bell, ArrowRight, TrendingUp } from 'lucide-react';
import { PerformancePanel } from '@/components/performance-panel';
import { listProducts } from '@/services/product';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    } catch { return '—'; }
};

interface OverviewTabProps {
    onNavigateToProducts: () => void;
}

export function OverviewTab({ onNavigateToProducts }: OverviewTabProps) {
    const marketIdStr = Cookies.get('marketId');
    const marketId = marketIdStr ? parseInt(marketIdStr) : 0;

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products', marketId],
        queryFn: () => listProducts(marketId),
        enabled: !!marketId,
    });

    const stats = {
        totalProducts: products.length,
        totalSearches: 0,
        addedToLists: products.length * 10,
        activeAlerts: 125,
        competitorCount: 8,
    };

    const topProducts = products.slice(0, 3);

    return (
        <div className="space-y-6">
            {/* Cards de métricas */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    {
                        icon: Package, label: 'Produtos Ativos', value: stats.totalProducts,
                        detail: 'Cadastrados e atualizados', color: 'text-emerald-600', bgColor: 'bg-emerald-500/10',
                    },
                    {
                        icon: Search, label: 'Apareceu em Buscas', value: stats.totalSearches.toLocaleString(),
                        detail: '+245 hoje', color: 'text-blue-600', bgColor: 'bg-blue-500/10',
                    },
                    {
                        icon: ListPlus, label: 'Em Listas de Compras', value: stats.addedToLists,
                        detail: 'Favoritados por clientes', color: 'text-purple-600', bgColor: 'bg-purple-500/10',
                    },
                    {
                        icon: Bell, label: 'Alertas de Preço', value: stats.activeAlerts,
                        detail: 'Aguardando promoções', color: 'text-orange-600', bgColor: 'bg-orange-500/10',
                    },
                ].map((stat, i) => (
                    <Card key={i} className="p-4 flex flex-col justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            </div>
                            <span className="text-xs font-medium text-muted-foreground leading-tight">{stat.label}</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-foreground tabular-nums">{stat.value}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{stat.detail}</p>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Tabela de produtos */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-base font-semibold text-foreground">Produtos Cadastrados</h2>
                            <p className="text-xs text-muted-foreground mt-0.5">Últimas atualizações</p>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-1.5 text-xs h-8 cursor-pointer"
                            onClick={onNavigateToProducts}
                        >
                            Ver Todos <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </div>

                    <Card className="overflow-hidden">
                        {isLoading ? (
                            <div className="space-y-3 p-5">
                                {Array.from({ length: 3 }).map((_, index) => (
                                    <div key={index} className="grid grid-cols-[1fr_90px_80px_90px] gap-4 rounded-lg border border-border p-3">
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                        </div>
                                        <Skeleton className="h-5 w-16" />
                                        <Skeleton className="h-5 w-14" />
                                        <Skeleton className="h-5 w-16" />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                                        <TableHead className="text-xs font-semibold text-foreground/60 uppercase tracking-wide pl-5">Produto</TableHead>
                                        <TableHead className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Preço</TableHead>
                                        <TableHead className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Estoque</TableHead>
                                        <TableHead className="text-xs font-semibold text-foreground/60 uppercase tracking-wide text-right pr-5">Atualização</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-10">
                                                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                                    <Package className="w-8 h-8 opacity-20" />
                                                    <p className="text-sm">Nenhum produto cadastrado ainda</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        topProducts.map((product) => (
                                            <TableRow key={product.id} className="hover:bg-muted/20 transition-colors">
                                                <TableCell className="pl-5">
                                                    <p className="text-sm font-medium text-foreground leading-tight">
                                                        {product.productName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{product.brand}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm font-bold text-foreground tabular-nums">
                                                        R$ {product.price != null ? Number(product.price).toFixed(2) : '0.00'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <span className={`text-sm tabular-nums ${(product.stockQuantity || 0) <= 5 ? 'text-destructive font-medium' : 'text-foreground'}`}>
                                                        {product.stockQuantity || 0} un.
                                                    </span>
                                                </TableCell>
                                                <TableCell className="text-right pr-5">
                                                    <span className="text-xs text-muted-foreground tabular-nums">
                                                        {formatDate(product.updatedAt)}
                                                    </span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                </div>

                {/* Sidebar de métricas */}
                <div className="space-y-4">
                    <Card>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold text-foreground">Performance Geral</h3>
                            </div>
                            <PerformancePanel
                                metrics={[
                                    { label: 'Competitividade', value: 85 },
                                    { label: 'Visibilidade nas Buscas', value: 92 },
                                    { label: 'Conversão em Listas', value: 78 },
                                ]}
                            />
                            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                                Sua visibilidade aumentou 12% desde a última atualização de preços.
                            </p>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <h3 className="text-sm font-semibold text-foreground">Posicionamento Local</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-secondary rounded-lg p-2.5">
                                    <p className="text-lg font-bold text-foreground tabular-nums">{stats.competitorCount}</p>
                                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Concorrentes no Raio</p>
                                </div>
                                <div className="bg-secondary rounded-lg p-2.5">
                                    <p className="text-lg font-bold text-foreground">1º</p>
                                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Mais Buscado</p>
                                </div>
                                <div className="bg-emerald-500/10 rounded-lg p-2.5">
                                    <p className="text-lg font-bold text-emerald-600 tabular-nums">-5.3%</p>
                                    <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Vant. Preço</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full text-xs gap-1.5 cursor-pointer">
                                Ver Análise de Concorrentes <ArrowRight className="w-3.5 h-3.5" />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
