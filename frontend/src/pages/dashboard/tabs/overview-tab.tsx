import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button } from '@/components/ui';
import { Package, Search, ListPlus, BarChart3, Users, Bell, Loader2 } from 'lucide-react';
import { PerformancePanel } from '@/components/performance-panel';
import { listProducts } from '@/services/product';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query'; // Import do TanStack Query

export function OverviewTab() {
    const marketIdStr = Cookies.get('marketId');
    const marketId = marketIdStr ? parseInt(marketIdStr) : 0;

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products', marketId],
        queryFn: () => listProducts(marketId),
        enabled: !!marketId,
    });

    // mock
    const stats = {
        totalProducts: products.length,
        totalSearches: 0,
        averagePosition: 1.4,
        addedToLists: products.length * 10,
        activeAlerts: 125,
        competitorCount: 8,
    };

    //3 primeiros para a tabela de destaque
    const topProducts = products.slice(0, 3);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    {
                        icon: Package, label: "Produtos Ativos", value: stats.totalProducts, detail: "Cadastrados e atualizados",
                        color: "text-emerald-600", bgColor: "bg-emerald-500/10"
                    },
                    {
                        icon: Search, label: "Apareceu em Buscas", value: stats.totalSearches.toLocaleString(), detail: "+245 hoje",
                        color: "text-blue-600", bgColor: "bg-blue-500/10"
                    },
                    {
                        icon: ListPlus, label: "Em Listas de Compras", value: stats.addedToLists, detail: "Favoritados por clientes",
                        color: "text-purple-600", bgColor: "bg-purple-500/10"
                    },
                    {
                        icon: Bell, label: "Alertas de Preço", value: stats.activeAlerts, detail: "Aguardando promoções",
                        color: "text-orange-600", bgColor: "bg-orange-500/10"
                    }
                ].map((stat, i) => (
                    <Card key={i} className="p-4 flex flex-col justify-between">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <stat.icon className={`w-4 h-4 ${stat.color}`} />
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
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-medium text-foreground">Produtos Cadastrados</h2>
                        <Button variant="outline" size="sm">Ver Todos</Button>
                    </div>

                    <Card>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Preço</TableHead>
                                        <TableHead>Estoque</TableHead>
                                        <TableHead className="text-right">Última Atualização</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topProducts.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center py-8">
                                                <p className="text-muted-foreground">Nenhum produto cadastrado ainda</p>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        topProducts.map((product) => {
                                            const formatDate = (dateString: string) => {
                                                try {
                                                    const date = new Date(dateString);
                                                    return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
                                                } catch {
                                                    return dateString;
                                                }
                                            };

                                            return (
                                                <TableRow key={product.id}>
                                                    <TableCell>
                                                        <p className="text-sm font-medium text-foreground">{product.productName}</p>
                                                        <p className="text-xs text-muted-foreground">{product.brand}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm font-bold text-foreground">R$ {product.price != null ? Number(product.price).toFixed(2) : '0.00'}</p>
                                                    </TableCell>
                                                    <TableCell>
                                                        <p className="text-sm text-foreground">{product.stockQuantity || 0} un.</p>
                                                    </TableCell>
                                                    <TableCell className="text-right">
                                                        <p className="text-xs text-muted-foreground">{formatDate(product.updatedAt)}</p>
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                </div>

                <div className="space-y-4">
                    <Card>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-4">
                                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium text-foreground">Performance Geral</h3>
                            </div>
                            <PerformancePanel
                                metrics={[
                                    { label: 'Competitividade', value: 85 },
                                    { label: 'Visibilidade nas Buscas', value: 92 },
                                    { label: 'Conversão em Listas', value: 78 },
                                ]}
                            />
                            <p className="text-xs text-muted-foreground mt-4">
                                Sua visibilidade aumentou 12% desde a última atualização de preços.
                            </p>
                        </div>
                    </Card>

                    <Card>
                        <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <h3 className="text-sm font-medium text-foreground">Posicionamento Local</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="bg-secondary rounded-md p-2">
                                    <p className="text-lg font-semibold text-foreground">{stats.competitorCount}</p>
                                    <p className="text-[10px] text-muted-foreground leading-tight">Concorrentes no Raio</p>
                                </div>
                                <div className="bg-secondary rounded-md p-2">
                                    <p className="text-lg font-semibold text-foreground">1º</p>
                                    <p className="text-[10px] text-muted-foreground leading-tight">Mais Buscado</p>
                                </div>
                                <div className="bg-secondary rounded-md p-2">
                                    <p className="text-lg font-semibold text-primary">-5.3%</p>
                                    <p className="text-[10px] text-muted-foreground leading-tight">Vant. Preço</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">
                                Ver Análise de Concorrentes
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}