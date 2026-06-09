import { memo, useCallback, useDeferredValue, useMemo, useState } from 'react'
import type { ComponentType } from 'react'
import {
    AlertCircle,
    Archive,
    Barcode,
    Boxes,
    Clock,
    Filter,
    Package,
    Search,
    Trash2,
    TrendingUp,
} from 'lucide-react'
import { Badge, Button, Card, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui'
import { deleteMarketProduct, listProducts, searchProductsByMarketId } from '@/services/product'
import { ProductFormDialog } from '@/pages/dashboard/product-form-dialog'
import { EditProductDialog } from '@/pages/dashboard/edit-product-dialog'
import Cookies from 'js-cookie'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import type { MarketProductResponse } from '@/types/product'

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Sem atualização'

    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return 'Sem atualização'

    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    })
}

const formatCurrency = (value: number | null | undefined) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value ?? 0)

function getStockStatus(stockQuantity: number | null | undefined) {
    const stock = stockQuantity ?? 0

    if (stock <= 0) {
        return { label: 'Sem estoque', className: 'border-destructive/20 bg-destructive/10 text-destructive' }
    }

    if (stock <= 5) {
        return { label: 'Estoque baixo', className: 'border-amber-200 bg-amber-50 text-amber-700' }
    }

    return { label: 'Disponível', className: 'border-emerald-200 bg-emerald-50 text-emerald-700' }
}

function getInventorySummary(products: MarketProductResponse[]) {
    const totalItems = products.length
    const outOfStock = products.filter((product) => (product.stockQuantity ?? 0) <= 0).length
    const lowStock = products.filter((product) => {
        const stock = product.stockQuantity ?? 0
        return stock > 0 && stock <= 5
    }).length
    const totalStock = products.reduce((sum, product) => sum + (product.stockQuantity ?? 0), 0)
    const totalValue = products.reduce((sum, product) => sum + ((product.price ?? 0) * (product.stockQuantity ?? 0)), 0)

    return { totalItems, outOfStock, lowStock, totalStock, totalValue }
}

type StockFilter = 'all' | 'attention'

function needsStockAttention(product: MarketProductResponse) {
    const stock = product.stockQuantity ?? 0
    return stock <= 5
}

export function ProductsTab() {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [stockFilter, setStockFilter] = useState<StockFilter>('all')
    const [showFilters, setShowFilters] = useState(false)
    const deferredSearchQuery = useDeferredValue(searchQuery)
    const queryClient = useQueryClient()

    const marketIdStr = Cookies.get('marketId')
    const marketId = marketIdStr ? parseInt(marketIdStr) : 0

    const {
        data: products = [],
        isLoading,
        isError,
        error,
        refetch,
    } = useQuery({
        queryKey: ['products', marketId],
        queryFn: () => listProducts(marketId),
        enabled: !!marketId,
    })

    const {
        data: searchedProducts = [],
        isLoading: isSearching,
    } = useQuery({
        queryKey: ['searchProductsByMarketId', marketId, deferredSearchQuery],
        queryFn: () => searchProductsByMarketId(marketId, { name: deferredSearchQuery.trim() }),
        enabled: deferredSearchQuery.trim().length > 0 && !!marketId,
    })

    const deleteMutation = useMutation({
        mutationFn: (productId: number) => deleteMarketProduct(marketId, productId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', marketId] })
            queryClient.invalidateQueries({ queryKey: ['searchProductsByMarketId', marketId] })
            toast.success('Produto removido do estoque.')
        },
        onError: (deleteError) => {
            toast.error(deleteError instanceof Error ? deleteError.message : 'Erro ao remover produto.')
        },
    })

    const categoryCounts = useMemo(() => {
        const counts = new Map<string, number>()

        products.forEach((product) => {
            const categoryName = product.categoryName || 'Sem categoria'
            counts.set(categoryName, (counts.get(categoryName) ?? 0) + 1)
        })

        return counts
    }, [products])

    const categories = useMemo(() =>
        ['all', ...Array.from(categoryCounts.keys()).sort((first, second) => first.localeCompare(second, 'pt-BR'))],
        [categoryCounts],
    )

    const displayProducts = useMemo(() =>
        deferredSearchQuery.trim().length > 0 ? searchedProducts : products,
        [deferredSearchQuery, products, searchedProducts],
    )
    const filteredProducts = useMemo(() => displayProducts.filter((product) => {
        const categoryName = product.categoryName || 'Sem categoria'
        const matchesCategory = selectedCategory === 'all' || categoryName === selectedCategory
        const matchesStock = stockFilter === 'all' || needsStockAttention(product)

        return matchesCategory && matchesStock
    }), [displayProducts, selectedCategory, stockFilter])

    const summary = useMemo(() => getInventorySummary(products), [products])
    const attentionCount = summary.lowStock + summary.outOfStock

    const handleDelete = useCallback((product: MarketProductResponse) => {
        const confirmed = window.confirm(`Remover "${product.productName}" do estoque deste mercado?`)
        if (!confirmed) return

        deleteMutation.mutate(product.productId)
    }, [deleteMutation])

    const handleInventoryChanged = useCallback(() => {
        refetch()
        queryClient.invalidateQueries({ queryKey: ['searchProductsByMarketId', marketId] })
    }, [marketId, queryClient, refetch])

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar estoque</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    {error instanceof Error ? error.message : 'Falha na conexão'}
                </p>
                <Button onClick={() => refetch()}>Tentar novamente</Button>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-sm font-medium text-primary">Gestão de produtos</p>
                    <h2 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">Estoque e preços</h2>
                    <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                        Cadastre itens do catálogo, acompanhe saldo disponível e mantenha preços atualizados para os clientes compararem.
                    </p>
                </div>

                <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto">
                    <div className="relative flex-1 sm:w-72">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por produto..."
                            value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            className="pl-9 bg-card focus-visible:ring-primary"
                        />
                    </div>
                    <ProductFormDialog marketId={marketId} />
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <InventoryMetric icon={Package} label="Produtos ativos" value={summary.totalItems.toString()} />
                <InventoryMetric icon={Boxes} label="Unidades em estoque" value={summary.totalStock.toString()} />
                <InventoryMetric
                    icon={AlertCircle}
                    label="Atenção no estoque"
                    value={attentionCount.toString()}
                    detail={`${summary.outOfStock} sem estoque · ${summary.lowStock} baixo`}
                    tone={attentionCount > 0 ? 'warning' : 'default'}
                    active={stockFilter === 'attention'}
                    disabled={attentionCount === 0}
                    onClick={() => setStockFilter(current => current === 'attention' ? 'all' : 'attention')}
                />
                <InventoryMetric icon={TrendingUp} label="Valor em estoque" value={formatCurrency(summary.totalValue)} />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                    type="button"
                    variant={showFilters ? 'default' : 'outline'}
                    size="sm"
                    className="w-fit gap-1.5 text-xs"
                    onClick={() => setShowFilters((current) => !current)}
                >
                    <Filter className="h-3.5 w-3.5" />
                    Filtros
                </Button>
                {selectedCategory !== 'all' && (
                    <p className="text-xs text-muted-foreground">
                        Categoria: <span className="font-medium text-foreground">{selectedCategory}</span>
                    </p>
                )}
                {stockFilter === 'attention' && (
                    <p className="text-sm text-muted-foreground">
                        Exibindo produtos sem estoque ou com até 5 unidades.
                    </p>
                )}
            </div>

            {showFilters && (
                <Card className="max-w-md gap-3 p-4">
                    <div className="space-y-2">
                        <label htmlFor="market-category-filter" className="text-xs font-semibold text-muted-foreground">
                            Categoria
                        </label>
                        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                            <SelectTrigger id="market-category-filter">
                                <SelectValue placeholder="Selecione a categoria" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => {
                                    const count = category === 'all'
                                        ? products.length
                                        : categoryCounts.get(category) ?? 0

                                    return (
                                        <SelectItem key={category} value={category}>
                                            {category === 'all' ? 'Todas' : category} ({count})
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-fit text-xs"
                        onClick={() => {
                            setSelectedCategory('all')
                            setStockFilter('all')
                        }}
                    >
                        Limpar filtros
                    </Button>
                </Card>
            )}

            <div className="space-y-3 md:hidden">
                {isLoading || isSearching ? (
                    Array.from({ length: 4 }).map((_, index) => (
                        <Card key={index} className="gap-3 p-4">
                            <div className="flex gap-3">
                                <Skeleton className="h-12 w-12 shrink-0 rounded-md" />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Skeleton className="h-4 w-4/5" />
                                    <Skeleton className="h-3 w-3/5" />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <Skeleton className="h-14 w-full" />
                                <Skeleton className="h-14 w-full" />
                            </div>
                        </Card>
                    ))
                ) : filteredProducts.length === 0 ? (
                    <Card className="p-6 text-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                            <Archive className="h-9 w-9 opacity-30" />
                            <div>
                                <p className="font-medium text-foreground">
                                    {searchQuery ? 'Nenhum item encontrado' : 'Nenhum produto no estoque'}
                                </p>
                                <p className="mt-1 text-sm">
                                    {searchQuery ? `Não há resultados para "${searchQuery}".` : 'Cadastre o primeiro produto para começar a gestão.'}
                                </p>
                            </div>
                            {!searchQuery && <ProductFormDialog marketId={marketId} />}
                        </div>
                    </Card>
                ) : filteredProducts.map((product) => (
                    <MobileProductCard
                        key={product.id}
                        product={product}
                        marketId={marketId}
                        deletePending={deleteMutation.isPending}
                        onDelete={handleDelete}
                        onInventoryChanged={handleInventoryChanged}
                    />
                ))}
            </div>

            <Card className="hidden overflow-hidden md:block">
                {isLoading || isSearching ? (
                    <div className="space-y-3 p-5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="grid grid-cols-[1fr_100px_90px] gap-4 rounded-lg border border-border p-3 md:grid-cols-[1fr_130px_120px_110px_130px_90px]">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-3/4" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-5 w-24" />
                                <Skeleton className="h-5 w-20" />
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="hidden h-5 w-24 md:block" />
                                <Skeleton className="hidden h-8 w-20 md:block" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="pl-5 text-xs font-semibold uppercase tracking-wide text-foreground/60">Produto</TableHead>
                                <TableHead className="hidden text-xs font-semibold uppercase tracking-wide text-foreground/60 md:table-cell">Categoria</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Preço</TableHead>
                                <TableHead className="text-xs font-semibold uppercase tracking-wide text-foreground/60">Estoque</TableHead>
                                <TableHead className="hidden text-right text-xs font-semibold uppercase tracking-wide text-foreground/60 lg:table-cell">Atualizado</TableHead>
                                <TableHead className="pr-5 text-right text-xs font-semibold uppercase tracking-wide text-foreground/60">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-16 text-center">
                                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                                            <Archive className="h-9 w-9 opacity-30" />
                                            <div>
                                                <p className="font-medium text-foreground">
                                                    {searchQuery ? 'Nenhum item encontrado' : 'Nenhum produto no estoque'}
                                                </p>
                                                <p className="mt-1 text-sm">
                                                    {searchQuery ? `Não há resultados para "${searchQuery}".` : 'Cadastre o primeiro produto para começar a gestão.'}
                                                </p>
                                            </div>
                                            {!searchQuery && <ProductFormDialog marketId={marketId} />}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => {
                                    const stockStatus = getStockStatus(product.stockQuantity)

                                    return (
                                        <TableRow key={product.id} className="hover:bg-muted/30">
                                            <TableCell className="pl-5">
                                                <div className="flex min-w-0 items-center gap-3">
                                                    {product.imageUrl ? (
                                                        <img src={product.imageUrl} alt="" className="h-11 w-11 rounded-md border border-border object-cover" />
                                                    ) : (
                                                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-md border border-border bg-muted text-muted-foreground">
                                                            <Barcode className="h-4 w-4" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-semibold text-foreground">{product.productName}</p>
                                                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                                                            {[product.brand, product.barCode ? `EAN ${product.barCode}` : null].filter(Boolean).join(' • ')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant="secondary" className="max-w-36 truncate font-normal">
                                                    {product.categoryName || 'Sem categoria'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm font-semibold tabular-nums text-foreground">
                                                    {formatCurrency(product.price)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-sm font-semibold tabular-nums text-foreground">{product.stockQuantity ?? 0} un.</span>
                                                    <span className={`inline-flex w-fit rounded-md border px-2 py-1 text-xs font-medium ${stockStatus.className}`}>
                                                        {stockStatus.label}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden text-right lg:table-cell">
                                                <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span className="text-sm tabular-nums">{formatDate(product.updatedAt)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="pr-5">
                                                <div className="flex items-center justify-end gap-1">
                                                    <EditProductDialog product={product} marketId={marketId} onSuccess={handleInventoryChanged} />
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-destructive"
                                                        title="Remover do estoque"
                                                        onClick={() => handleDelete(product)}
                                                        disabled={deleteMutation.isPending}
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            )}
                        </TableBody>
                    </Table>
                )}
            </Card>

            {filteredProducts.length > 0 && (
                <p className="text-right text-xs text-muted-foreground">
                    Exibindo {filteredProducts.length} de {products.length} produto{products.length !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    )
}

function InventoryMetric({
    icon: Icon,
    label,
    value,
    detail,
    tone = 'default',
    active = false,
    disabled = false,
    onClick,
}: {
    icon: ComponentType<{ className?: string }>
    label: string
    value: string
    detail?: string
    tone?: 'default' | 'warning'
    active?: boolean
    disabled?: boolean
    onClick?: () => void
}) {
    const interactive = Boolean(onClick)
    const metricClassName = `rounded-lg border bg-card/95 p-4 py-5 text-card-foreground shadow-sm backdrop-blur transition ${active ? 'border-primary bg-primary/5 ring-1 ring-primary/20' : ''} ${interactive && !disabled ? 'cursor-pointer hover:border-primary/40 hover:bg-primary/5' : ''} ${disabled ? 'opacity-70' : ''}`

    if (interactive) {
        return (
            <button
                type="button"
                onClick={onClick}
                disabled={disabled}
                className={`${metricClassName} text-left`}
                aria-pressed={active}
                aria-label={`${label}: ${value}${detail ? `. ${detail}` : ''}`}
            >
                <InventoryMetricContent icon={Icon} label={label} value={value} detail={detail} tone={tone} />
            </button>
        )
    }

    return (
        <Card className="p-4">
            <InventoryMetricContent icon={Icon} label={label} value={value} detail={detail} tone={tone} />
        </Card>
    )
}

function InventoryMetricContent({
    icon: Icon,
    label,
    value,
    detail,
    tone = 'default',
}: {
    icon: ComponentType<{ className?: string }>
    label: string
    value: string
    detail?: string
    tone?: 'default' | 'warning'
}) {
    return (
            <div className="flex items-center justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{label}</p>
                    <p className="mt-1 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
                    {detail && <p className="mt-1 text-xs text-muted-foreground">{detail}</p>}
                </div>
                <div className={`grid h-10 w-10 place-items-center rounded-md ${tone === 'warning' ? 'bg-amber-50 text-amber-700' : 'bg-primary/10 text-primary'}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </div>
    )
}

const MobileProductCard = memo(function MobileProductCard({
    product,
    marketId,
    deletePending,
    onDelete,
    onInventoryChanged,
}: {
    product: MarketProductResponse
    marketId: number
    deletePending: boolean
    onDelete: (product: MarketProductResponse) => void
    onInventoryChanged: () => void
}) {
    const stockStatus = getStockStatus(product.stockQuantity)

    return (
        <Card className="gap-4 p-4">
            <div className="flex min-w-0 items-start gap-3">
                {product.imageUrl ? (
                    <img src={product.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-md border border-border object-cover" />
                ) : (
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-md border border-border bg-muted text-muted-foreground">
                        <Barcode className="h-4 w-4" />
                    </div>
                )}
                <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{product.productName}</p>
                    <p className="mt-1 break-words text-sm text-muted-foreground">
                        {[product.brand, product.barCode ? `EAN ${product.barCode}` : null].filter(Boolean).join(' • ') || 'Produto do catálogo'}
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="rounded-md border border-border bg-muted/30 p-3">
                    <p className="text-sm font-medium text-muted-foreground">Preço</p>
                    <p className="mt-1 break-words text-sm font-semibold tabular-nums text-foreground">{formatCurrency(product.price)}</p>
                </div>
                <div className="rounded-md border border-border bg-muted/30 p-3">
                    <p className="text-sm font-medium text-muted-foreground">Estoque</p>
                    <p className="mt-1 text-sm font-semibold tabular-nums text-foreground">{product.stockQuantity ?? 0} un.</p>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge variant="secondary" className="max-w-full truncate font-normal">
                    {product.categoryName || 'Sem categoria'}
                </Badge>
                <span className={`inline-flex w-fit rounded-md border px-2 py-1 text-xs font-medium ${stockStatus.className}`}>
                    {stockStatus.label}
                </span>
            </div>

            <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
                <div className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate text-sm tabular-nums">{formatDate(product.updatedAt)}</span>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                    <EditProductDialog product={product} marketId={marketId} onSuccess={onInventoryChanged} />
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-transparent hover:text-destructive"
                        title="Remover do estoque"
                        onClick={() => onDelete(product)}
                        disabled={deletePending}
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        </Card>
    )
})
