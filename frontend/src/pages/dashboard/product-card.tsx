import { memo, useCallback } from 'react'
import { Badge, Card } from '@/components/ui'
import {
    Bell, ChevronDown, ChevronUp, MapPin,
    Package, Plus, Store, TrendingDown,
} from 'lucide-react'

export interface TransformedMarket {
    name: string
    price: number
    distance: string
}

export interface TransformedProduct {
    id: number
    name: string
    category: string
    lowestPrice: number
    averagePrice: number
    savings: number
    badge: string | null
    markets: TransformedMarket[]   // [] quando vem de busca geral
}

interface ProductCardProps {
    product: TransformedProduct
    isExpanded: boolean
    onToggle: (id: number) => void
    onAddToList?: (product: TransformedProduct) => void
    onCreateAlert?: (product: TransformedProduct) => void
}

export const ProductCard = memo(function ProductCard({
    product,
    isExpanded,
    onToggle,
    onAddToList,
    onCreateAlert,
}: ProductCardProps) {
    const handleToggle = useCallback(() => {
        onToggle(product.id)
    }, [onToggle, product.id])

    const handleAdd = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onAddToList?.(product)
    }, [onAddToList, product])

    const handleAlert = useCallback((e: React.MouseEvent) => {
        e.stopPropagation()
        onCreateAlert?.(product)
    }, [onCreateAlert, product])

    return (
        <div className={`relative ${isExpanded ? 'z-50' : 'z-0'}`}>
            <Card
                onClick={handleToggle}
                className={`group overflow-visible cursor-pointer flex flex-col transition-colors duration-200 relative z-20 ${isExpanded
                    ? 'border-primary border-b-transparent rounded-b-none shadow-md'
                    : 'border-border hover:shadow-md'
                    }`}
            >
                {/* Imagem placeholder */}
                <div className="h-32 bg-muted flex items-center justify-center relative shrink-0">
                    <Package className="w-12 h-12 text-muted-foreground/30" />

                    {product.badge && (
                        <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5">
                            {product.badge}
                        </Badge>
                    )}

                    <div className="absolute top-2 right-2 flex gap-1.5">
                        <button
                            onClick={handleAlert}
                            aria-label={`Criar alerta para ${product.name}`}
                            title="Criar alerta de preço"
                            className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                        >
                            <Bell className="w-3.5 h-3.5" />
                        </button>

                        <button
                            onClick={handleAdd}
                            aria-label={`Adicionar ${product.name} à lista`}
                            title="Adicionar a minha lista"
                            className="w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-medium text-foreground text-sm leading-tight mb-3 line-clamp-2">
                        {product.name}
                    </h4>

                    <div className="flex items-end justify-between mb-3">
                        <div>
                            <p className="text-xs text-muted-foreground">A partir de</p>
                            {product.lowestPrice > 0 ? (
                                <p className="text-xl font-bold text-primary">
                                    R$ {product.lowestPrice.toFixed(2)}
                                </p>
                            ) : (
                                <p className="text-sm text-muted-foreground italic">
                                    Consulte o mercado
                                </p>
                            )}
                        </div>
                        {product.savings > 0 && (
                            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
                                <TrendingDown className="w-3 h-3" />
                                <span className="text-xs font-medium">{product.savings.toFixed(0)}% off</span>
                            </div>
                        )}
                    </div>

                    {product.markets.length > 0 && (
                        <p className="text-xs text-muted-foreground mb-1">
                            em {product.markets.length} {product.markets.length === 1 ? 'mercado' : 'mercados'} •{' '}
                            <span className="text-foreground">{product.markets[0]?.distance}</span>
                        </p>
                    )}

                    <div className="mt-auto pt-3 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
                        <span className="text-xs font-medium mr-1">
                            {isExpanded ? 'Ocultar mercados' : 'Comparar mercados'}
                        </span>
                        {isExpanded
                            ? <ChevronUp className="w-3.5 h-3.5" />
                            : <ChevronDown className="w-3.5 h-3.5" />
                        }
                    </div>
                </div>
            </Card>

            {/* Painel expansível de mercados */}
            <div
                aria-hidden={!isExpanded}
                className={`absolute top-[calc(100%-1px)] left-0 right-0 z-10 bg-card rounded-b-lg border-x border-b overflow-hidden transition-all duration-300 ease-in-out ${isExpanded
                    ? 'max-h-[500px] opacity-100 border-primary shadow-xl'
                    : 'max-h-0 opacity-0 border-transparent shadow-none pointer-events-none'
                    }`}
            >
                <div className="space-y-3 p-4 pt-2">
                    <p className="text-xs font-medium text-muted-foreground">
                        Mercados que vendem este produto
                    </p>
                    {product.markets.map((market, idx) => (
                        <MarketRow
                            key={`${market.name}-${idx}`}
                            market={market}
                            isCheapest={idx === 0}
                        />
                    ))}
                </div>
            </div>
        </div>
    )
})

const MarketRow = memo(function MarketRow({
    market,
    isCheapest,
}: {
    market: TransformedMarket
    isCheapest: boolean
}) {
    return (
        <div
            className={`flex items-center justify-between p-2 rounded-lg ${isCheapest ? 'bg-primary/10 ring-1 ring-primary/20' : 'bg-muted'
                }`}
        >
            <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${isCheapest ? 'bg-primary/20' : 'bg-card'}`}>
                    <Store className={`w-3.5 h-3.5 ${isCheapest ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                    <p className="text-xs font-medium text-foreground">{market.name}</p>
                    <div className="flex items-center gap-0.5 text-muted-foreground">
                        <MapPin className="w-2.5 h-2.5" />
                        <span className="text-[10px]">{market.distance}</span>
                    </div>
                </div>
            </div>
            <p className={`font-bold text-sm ${isCheapest ? 'text-primary' : 'text-foreground'}`}>
                R$ {market.price.toFixed(2)}
            </p>
        </div>
    )
})
