import { Card, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Button } from '@/components/ui';
import { Package, Search, Star, ListPlus, BarChart3, Users, Bell } from 'lucide-react';
import { PerformancePanel } from '@/components/performance-panel';

const stats = {
    totalProducts: 156,
    totalSearches: 2847,
    averagePosition: 1.4,
    addedToLists: 843,
    activeAlerts: 125,
    competitorCount: 8,
};


const topProducts = [
    { id: 1, name: 'Arroz Branco Tio João 5kg', searches: 452, inLists: 145, priceDiff: -5.3 }, // -5.3% significa mais barato que a média
    { id: 2, name: 'Feijão Preto Camil 1kg', searches: 312, inLists: 98, priceDiff: -2.1 },
    { id: 3, name: 'Óleo de Soja Liza 900ml', searches: 287, inLists: 87, priceDiff: 1.5 }, // 1.5% mais caro que a média
];

export function OverviewTab() {
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

            {/* Main grid (2 colunas para tabela, 1 para sidebar) */}
            <div className="grid lg:grid-cols-3 gap-6">

                {/* Tabela de Top Produtos focada em Engajamento */}
                <div className="lg:col-span-2 space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-medium text-foreground">Produtos Mais Populares</h2>
                        <Button variant="outline" size="sm">Ver Todos</Button>
                    </div>

                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Produto</TableHead>
                                    <TableHead>Buscas</TableHead>
                                    <TableHead>Nas Listas</TableHead>
                                    <TableHead className="text-right">Competitividade</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {topProducts.map((product) => {
                                    const isCheaper = product.priceDiff <= 0;
                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <p className="text-sm font-medium text-foreground">{product.name}</p>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <Search className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <p className="text-sm text-foreground">{product.searches}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1.5">
                                                    <ListPlus className="w-3.5 h-3.5 text-muted-foreground" />
                                                    <p className="text-sm font-medium text-foreground">{product.inLists}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <p className={`text-xs font-medium ${isCheaper ? 'text-success' : 'text-destructive'}`}>
                                                    {isCheaper ? '↓' : '↑'} {Math.abs(product.priceDiff)}% {isCheaper ? 'abaixo da média' : 'acima da média'}
                                                </p>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </Card>
                </div>

                {/* Sidebar com Performance e Análise */}
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