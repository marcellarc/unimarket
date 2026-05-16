import { Button, Card, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { PerformancePanel } from '@/components/performance-panel'
import { StatCard } from '@/components/stat-card'
import { listProducts } from '@/services/product'
import type { MarketProductResponse } from '@/types/product'
import { useQuery } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import { ArrowRight, Boxes, Package, TrendingUp } from 'lucide-react'

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Sem atualização'

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return 'Sem atualização'

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}

function getInventoryStats(products: MarketProductResponse[]) {
    const totalProducts = products.length
    const inStock = products.filter((product) => (product.stockQuantity ?? 0) > 0).length
    const lowStock = products.filter((product) => {
        const stock = product.stockQuantity ?? 0
        return stock > 0 && stock <= 5
    }).length
    const inventoryValue = products.reduce(
        (sum, product) => sum + ((product.price ?? 0) * (product.stockQuantity ?? 0)),
        0,
    )
    const averagePrice = products.length
        ? products.reduce((sum, product) => sum + (product.price ?? 0), 0) / products.length
        : 0

    const stockCoverage = totalProducts ? Math.round((inStock / totalProducts) * 100) : 0
    const catalogQuality = totalProducts
        ? Math.round((products.filter((product) => product.categoryName && product.barCode).length / totalProducts) * 100)
        : 0
    const pricingCoverage = totalProducts
        ? Math.round((products.filter((product) => (product.price ?? 0) > 0).length / totalProducts) * 100)
        : 0

    return { averagePrice, catalogQuality, inStock, inventoryValue, lowStock, pricingCoverage, stockCoverage, totalProducts }
}

interface OverviewTabProps {
    onNavigateToProducts: () => void
}

export function OverviewTab({ onNavigateToProducts }: OverviewTabProps) {
    const marketIdStr = Cookies.get('marketId')
    const marketId = marketIdStr ? parseInt(marketIdStr) : 0

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['products', marketId],
        queryFn: () => listProducts(marketId),
        enabled: !!marketId,
    })

    const stats = getInventoryStats(products)
    const recentProducts = [...products]
        .sort((first, second) => new Date(second.updatedAt ?? 0).getTime() - new Date(first.updatedAt ?? 0).getTime())
        .slice(0, 5)

    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Painel do mercado</p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Resumo operacional</h2>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            Acompanhe a qualidade do catálogo, o saldo disponível e os preços que aparecem para clientes.
                        </p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={onNavigateToProducts}>
                        Gerenciar estoque
                        <ArrowRight className="h-4 w-4" />
                    </Button>
                </div>
            </section>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Package} label="Catálogo" value={String(stats.totalProducts)} detail="Produtos ativos no mercado" />
                <StatCard icon={Boxes} label="Disponibilidade" value={`${stats.stockCoverage}%`} detail={`${stats.inStock} item(ns) com estoque`} tone={stats.stockCoverage < 60 ? 'warning' : 'success'} />
                <StatCard label="Valor em estoque" value={currency.format(stats.inventoryValue)} detail={`${stats.lowStock} item(ns) precisam atenção`} tone={stats.lowStock > 0 ? 'warning' : 'default'} />
                <StatCard icon={TrendingUp} label="Preço médio" value={currency.format(stats.averagePrice)} detail="Média dos produtos cadastrados" />
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
                <Card className="gap-0 overflow-hidden p-0">
                    <div className="flex items-center justify-between gap-3 border-b border-border p-5">
                        <div>
                            <h3 className="text-base font-semibold text-foreground">Atualizações recentes</h3>
                            <p className="mt-1 text-sm text-muted-foreground">Últimos produtos alterados no inventário.</p>
                        </div>
                        <Button variant="ghost" size="sm" onClick={onNavigateToProducts}>
                            Ver tudo
                        </Button>
                    </div>

                    {isLoading ? (
                        <div className="space-y-3 p-5">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} className="h-12 w-full" />
                            ))}
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/40 hover:bg-muted/40">
                                    <TableHead className="pl-5 text-xs font-semibold uppercase tracking-wide text-foreground/60">Produto</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Preço</TableHead>
                                    <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Estoque</TableHead>
                                    <TableHead className="hidden pr-5 text-right text-xs font-semibold uppercase tracking-wide text-foreground/60 md:table-cell">Atualização</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentProducts.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="py-12 text-center text-sm text-muted-foreground">
                                            Nenhum produto cadastrado ainda.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentProducts.map((product) => (
                                        <TableRow key={product.id} className="hover:bg-muted/20">
                                            <TableCell className="pl-5">
                                                <p className="truncate text-sm font-medium text-foreground">{product.productName}</p>
                                                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                    {[product.brand, product.categoryName].filter(Boolean).join(' • ') || 'Sem categoria'}
                                                </p>
                                            </TableCell>
                                            <TableCell className="text-sm font-medium tabular-nums text-foreground">
                                                {currency.format(product.price ?? 0)}
                                            </TableCell>
                                            <TableCell className="text-sm tabular-nums text-foreground">
                                                {product.stockQuantity ?? 0} un.
                                            </TableCell>
                                            <TableCell className="hidden pr-5 text-right text-xs tabular-nums text-muted-foreground md:table-cell">
                                                {formatDate(product.updatedAt)}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </Card>

                <aside className="space-y-4">
                    <Card className="p-5">
                        <h3 className="text-base font-semibold text-foreground">Qualidade do catálogo</h3>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            Dados completos ajudam clientes a encontrar produtos e reduzem dúvidas antes da compra.
                        </p>
                        <div className="mt-5">
                            <PerformancePanel
                                metrics={[
                                    { label: 'Produtos com categoria e EAN', value: stats.catalogQuality },
                                    { label: 'Produtos com preço', value: stats.pricingCoverage },
                                    { label: 'Produtos em estoque', value: stats.stockCoverage },
                                ]}
                            />
                        </div>
                    </Card>

                    <Card className="p-5">
                        <h3 className="text-base font-semibold text-foreground">Próxima ação recomendada</h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {stats.lowStock > 0
                                ? `Revise os ${stats.lowStock} produto(s) com estoque baixo para manter a disponibilidade visível.`
                                : 'Mantenha preços e estoque atualizados para melhorar a confiança dos clientes.'}
                        </p>
                        <Button className="mt-4 w-full" onClick={onNavigateToProducts}>
                            Abrir estoque
                        </Button>
                    </Card>
                </aside>
            </div>
        </div>
    )
}
