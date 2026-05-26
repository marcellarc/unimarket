import { memo, type MouseEvent, useCallback } from 'react'
import { Badge, Button, Card } from '@/components/ui'
import { Bell, ChevronDown, ChevronUp, ImageIcon, MapPin, MessageSquare, Plus, Store } from 'lucide-react'

export interface TransformedMarket {
    id: number
    marketId: number
    name: string
    price: number
    distance: string
    distanceKm?: number | null
}

export interface TransformedProduct {
    id: number
    productId: number
    name: string
    imageUrl?: string | null
    category: string
    lowestPrice: number
    highestPrice: number
    averagePrice: number
    savings: number
    badge: string | null
    markets: TransformedMarket[]
}

interface ProductCardProps {
    product: TransformedProduct
    isExpanded: boolean
    onToggle: (id: number) => void
    onAddToList?: (product: TransformedProduct) => void
    onCreateAlert?: (product: TransformedProduct) => void
    onCreateFeedback?: (product: TransformedProduct) => void
}

export const ProductCard = memo(function ProductCard({
    product,
    isExpanded,
    onToggle,
    onAddToList,
    onCreateAlert,
    onCreateFeedback,
}: ProductCardProps) {
    const handleToggle = useCallback(() => {
        onToggle(product.id)
    }, [onToggle, product.id])

    const handleAdd = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        onAddToList?.(product)
    }, [onAddToList, product])

    const handleAlert = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        onCreateAlert?.(product)
    }, [onCreateAlert, product])

    const handleFeedback = useCallback((event: MouseEvent<HTMLButtonElement>) => {
        event.stopPropagation()
        onCreateFeedback?.(product)
    }, [onCreateFeedback, product])

    return (
        <Card
            className={`flex flex-col gap-0 overflow-hidden p-0 transition-[border-color,box-shadow,background-color] ${isExpanded
                ? 'min-h-[480px] border-primary shadow-md'
                : 'h-[480px] border-border hover:border-primary/30 hover:bg-card'
                }`}
        >
            <div className="relative shrink-0 border-b border-border/80 bg-muted/25 p-4">
                <div className="flex h-32 items-center justify-center rounded-md border border-border bg-background/75">
                    <ProductImage src={product.imageUrl} name={product.name} />
                </div>

                {product.badge && (
                    <Badge variant="secondary" className="absolute left-6 top-6 font-normal shadow-sm">
                        {product.badge}
                    </Badge>
                )}
            </div>

            <div className="flex h-[90px] shrink-0 flex-col justify-center border-b border-border/80 p-4">
                <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{product.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                    {product.markets.length > 0
                        ? `${product.markets.length} ${product.markets.length === 1 ? 'mercado' : 'mercados'} encontrado${product.markets.length === 1 ? '' : 's'}`
                        : 'Produto sem comparação disponível'}
                </p>
            </div>

            <div className="flex min-h-[220px] shrink-0 flex-col gap-4 p-4">
                <div className="flex items-end justify-between gap-3">
                    <div>
                        <p className="text-xs text-muted-foreground">Menor preço</p>
                        {product.lowestPrice > 0 ? (
                            <p className="mt-1 text-2xl font-semibold tracking-tight text-primary tabular-nums">
                                R$ {product.lowestPrice.toFixed(2)}
                            </p>
                        ) : (
                            <p className="mt-1 text-sm text-muted-foreground">Consulte no mercado</p>
                        )}
                    </div>

                    {product.savings > 0 && (
                        <div className="rounded-md border border-primary/20 bg-primary/10 px-2.5 py-1 text-right">
                            <p className="text-xs font-semibold text-primary">{product.savings.toFixed(0)}% menor</p>
                            <p className="text-[11px] text-muted-foreground">que a média</p>
                        </div>
                    )}
                </div>

                {product.markets[0] && (
                    <div className="flex min-w-0 gap-1 rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                        <span className="shrink-0">Melhor opção exibida:</span>
                        <span className="truncate font-medium text-foreground">{product.markets[0].name}</span>
                    </div>
                )}

                <div className={`grid gap-2 ${onAddToList ? 'grid-cols-3' : 'grid-cols-2'}`}>
                    <Button type="button" variant="outline" size="sm" onClick={handleAlert}>
                        <Bell className="h-3.5 w-3.5" />
                        Alerta
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleFeedback}>
                        <MessageSquare className="h-3.5 w-3.5" />
                        Avaliar
                    </Button>
                    {onAddToList && (
                        <Button type="button" variant="outline" size="sm" onClick={handleAdd}>
                            <Plus className="h-3.5 w-3.5" />
                            Lista
                        </Button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={handleToggle}
                    className="mt-auto flex w-full items-center justify-center border-t border-border/80 pt-3 text-xs font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                    {isExpanded ? 'Ocultar mercados' : 'Comparar mercados'}
                    {isExpanded ? <ChevronUp className="ml-1 h-3.5 w-3.5" /> : <ChevronDown className="ml-1 h-3.5 w-3.5" />}
                </button>
            </div>

            <div
                aria-hidden={!isExpanded}
                className={`grid overflow-hidden border-t border-border/70 bg-muted/20 transition-[grid-template-rows,opacity] duration-200 ease-out ${isExpanded
                    ? 'grid-rows-[1fr] opacity-100'
                    : 'grid-rows-[0fr] opacity-0'
                    }`}
            >
                <div className="min-h-0">
                    <div className="space-y-2 p-4 pt-3">
                        <p className="text-xs font-medium text-muted-foreground">Mercados que vendem este produto</p>
                        {product.markets.map((market) => (
                            <MarketRow
                                key={`${market.name}-${market.price}-${market.distance}`}
                                market={market}
                                isCheapest={market === product.markets[0]}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </Card>
    )
})

function ProductImage({ src, name }: { src?: string | null; name: string }) {
    if (!src) {
        return (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <ImageIcon className="h-10 w-10 opacity-45" />
            </div>
        )
    }

    return (
        <img
            src={src}
            alt={name}
            loading="lazy"
            className="h-full max-h-28 w-full object-contain p-3"
        />
    )
}

const MarketRow = memo(function MarketRow({
    market,
    isCheapest,
}: {
    market: TransformedMarket
    isCheapest: boolean
}) {
    return (
        <div className={`grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-md border p-3 ${isCheapest ? 'border-primary/25 bg-primary/5' : 'border-border bg-card/70'}`}>
            <div className="min-w-0 overflow-hidden">
                <div className="flex items-center gap-2">
                    <Store className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <p className="min-w-0 flex-1 truncate text-sm font-medium text-foreground" title={market.name}>
                        {market.name}
                    </p>
                </div>
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3 shrink-0" />
                    <span className="truncate">{market.distance}</span>
                </div>
            </div>
            <p className={`shrink-0 whitespace-nowrap text-right text-sm font-semibold tabular-nums ${isCheapest ? 'text-primary' : 'text-foreground'}`}>
                R$ {market.price.toFixed(2)}
            </p>
        </div>
    )
})
