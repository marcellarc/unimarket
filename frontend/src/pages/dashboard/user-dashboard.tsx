import logoImg from '@/assets/logo-unimarket.png'
import {
    Badge, Button, Card,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
    Input,
} from '@/components/ui'
import { useLogout } from '@/hooks/use-logout'
import { listProducts, searchProductsByMarketId } from '@/services/product'
import type { MarketProductResponse } from '@/types/product'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
    Bell, ChevronDown,
    ChevronRight,
    Filter, List,
    Loader2,
    LogOut, MapPin, Package,
    Plus, Search, ShoppingCart,
    SlidersHorizontal, Store, Tag,
    User, X, Zap
} from 'lucide-react'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { ProductCard } from './product-card'

const categories = [
    { id: 'all', label: 'Todos' },
    { id: 'basics', label: 'Básicos' },
    { id: 'drinks', label: 'Bebidas' },
    { id: 'oils', label: 'Óleos' },
    { id: 'pasta', label: 'Massas' },
    { id: 'dairy', label: 'Laticínios' },
    { id: 'meats', label: 'Carnes' },
    { id: 'cleaning', label: 'Limpeza' },
]

const nearbyMarkets = [
    { id: 1, name: 'Supermercado Econômico', distance: '0.5 km', products: 1240, open: true },
    { id: 2, name: 'Mercado da Família', distance: '1.2 km', products: 980, open: true },
    { id: 3, name: 'Super Compras', distance: '2.0 km', products: 1540, open: false },
]

const shoppingLists = [
    { id: 1, name: 'Compras do Mês', items: 12, total: 289.50, savings: 45.20 },
    { id: 2, name: 'Feira da Semana', items: 8, total: 85.90, savings: 12.30 },
]

interface UserDashboardProps {
    userName: string
    isLogged: boolean
    marketId: number
    userRole?: string
}

export function UserDashboard({ userName, isLogged, marketId, userRole }: UserDashboardProps) {
    const navigate = useNavigate()
    const { logout } = useLogout()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [showFilters, setShowFilters] = useState(false)
    const [maxDistance, setMaxDistance] = useState(5)
    const [maxPrice, setMaxPrice] = useState(100)
    const [sortBy, setSortBy] = useState<'price' | 'savings'>('price')
    const [showListPanel, setShowListPanel] = useState(false)
    const [expandedId, setExpandedId] = useState<number | null>(null)


    const { data: apiProducts = [], isLoading, error } = useQuery({
        queryKey: ['products', marketId],
        queryFn: () => listProducts(marketId),
        enabled: !!marketId,
    })


    const deferredSearch = useDeferredValue(searchQuery)
    const { data: searchedProducts = [] } = useQuery({
        queryKey: ['searchProductsByMarketId', marketId, deferredSearch],
        queryFn: () => searchProductsByMarketId(marketId, { name: deferredSearch }),
        enabled: deferredSearch.length > 0 && !!marketId,
    })

    const transformedProducts = useMemo(() => {
        // Busca no mercado ativa → MarketProductResponse
        if (deferredSearch.length > 0) {
            return (searchedProducts as MarketProductResponse[]).map(product => {
                const price = product.price != null ? Number(product.price) : 0
                return {
                    id: product.id,                  // ← id aqui
                    name: product.productName,
                    category: 'all',
                    lowestPrice: price,
                    averagePrice: price * 1.15,
                    savings: price * 0.15,
                    badge: null,
                    markets: [{
                        name: product.marketName || 'Market',
                        price,
                        distance: '0.5 km',
                    }],
                }
            })
        }

        // Listagem do mercado → MarketProductResponse
        return (apiProducts as MarketProductResponse[]).map(product => {
            const price = product.price != null ? Number(product.price) : 0
            return {
                id: product.id,                  // ← id aqui
                name: product.productName,
                category: 'all',
                lowestPrice: price,
                averagePrice: price * 1.15,
                savings: price * 0.15,
                badge: null,
                markets: [{
                    name: product.marketName || 'Market',
                    price,
                    distance: '0.5 km',
                }],
            }
        })
    }, [apiProducts, searchedProducts, deferredSearch])

    const filteredProducts = useMemo(() =>
        transformedProducts
            .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
            .filter(p => p.lowestPrice <= maxPrice)
            .sort((a, b) => sortBy === 'price' ? a.lowestPrice - b.lowestPrice : b.savings - a.savings),
        [transformedProducts, selectedCategory, maxPrice, sortBy]
    )

    const toggleExpand = useCallback(
        (id: number) => setExpandedId(prev => prev === id ? null : id),
        []
    )

    console.log()

    return (
        <div className="min-h-screen bg-background">

            {/* ── NAVBAR ── */}
            <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center gap-4 h-14">
                        <div className="flex items-center gap-2 shrink-0">
                            <img src={logoImg} alt="UniMarket" className="w-7 h-7 object-contain" />
                            <span className="font-bold text-lg text-foreground hidden sm:block">UniMarket</span>
                        </div>

                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar produtos, marcas, categorias..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 h-9 w-full bg-background"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center">3</span>
                            </Button>

                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setShowListPanel(!showListPanel)}
                                className="relative text-muted-foreground"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center">
                                    {shoppingLists.reduce((a, l) => a + l.items, 0)}
                                </span>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                                        <div className="w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="w-4 h-4 text-primary" />
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 mt-1">
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium text-foreground">{userName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {userRole === 'GUEST' ? 'Visitante' : 'Consumidor'}
                                        </p>
                                    </div>
                                    <DropdownMenuSeparator />
                                    {isLogged && (
                                        <DropdownMenuItem className="cursor-pointer">
                                            <User className="w-4 h-4 mr-2" /> Meu Perfil
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem onClick={() => setShowListPanel(true)} className="cursor-pointer">
                                        <List className="w-4 h-4 mr-2" /> Minhas Listas
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                        onClick={() => isLogged ? logout() : navigate({ to: '/login' })}
                                        className="text-destructive cursor-pointer"
                                    >
                                        <LogOut className="w-4 h-4 mr-2" />
                                        {isLogged ? 'Sair' : 'Fazer Login'}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>
                </div>

                {/* Categorias */}
                <div className="border-t border-border bg-card">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide">
                            {categories.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${selectedCategory === cat.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <div className="flex gap-6">

                    {/* ── FILTROS ── */}
                    {showFilters && (
                        <aside className="w-56 shrink-0">
                            <Card className="p-4 border-border space-y-5 sticky top-32">
                                <div className="flex items-center justify-between">
                                    <span className="font-semibold text-foreground text-sm">Filtros</span>
                                    <button onClick={() => setShowFilters(false)} className="text-muted-foreground hover:text-foreground">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Distância máx.
                                    </p>
                                    <input
                                        type="range" min={1} max={10} value={maxDistance}
                                        onChange={e => setMaxDistance(Number(e.target.value))}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>1 km</span>
                                        <span className="text-primary font-medium">{maxDistance} km</span>
                                        <span>10 km</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> Preço máximo
                                    </p>
                                    <input
                                        type="range" min={5} max={200} value={maxPrice}
                                        onChange={e => setMaxPrice(Number(e.target.value))}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>R$ 5</span>
                                        <span className="text-primary font-medium">R$ {maxPrice}</span>
                                        <span>R$ 200</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                        <SlidersHorizontal className="w-3 h-3" /> Ordenar por
                                    </p>
                                    <div className="space-y-1">
                                        {[
                                            { id: 'price', label: 'Menor preço' },
                                            { id: 'savings', label: 'Maior economia' },
                                        ].map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSortBy(opt.id as any)}
                                                className={`w-full text-left px-3 py-1.5 rounded text-xs transition-colors ${sortBy === opt.id
                                                    ? 'bg-primary/10 text-primary font-medium'
                                                    : 'text-muted-foreground hover:bg-muted'
                                                    }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    variant="outline" size="sm" className="w-full text-xs"
                                    onClick={() => { setMaxDistance(5); setMaxPrice(100); setSortBy('price') }}
                                >
                                    Limpar filtros
                                </Button>
                            </Card>
                        </aside>
                    )}

                    {/* ── CONTEÚDO PRINCIPAL ── */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant={showFilters ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className="text-xs gap-1.5"
                                >
                                    <Filter className="w-3.5 h-3.5" /> Filtros
                                </Button>
                                <span className="text-sm text-muted-foreground">
                                    <span className="font-medium text-foreground">{filteredProducts.length}</span> produtos encontrados
                                </span>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-xs gap-1.5">
                                        <SlidersHorizontal className="w-3.5 h-3.5" />
                                        {sortBy === 'price' ? 'Menor preço' : 'Maior economia'}
                                        <ChevronDown className="w-3 h-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setSortBy('price')}>Menor preço</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setSortBy('savings')}>Maior economia</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/*GRID DE PRODUTOS*/}
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Loader2 className="w-12 h-12 mb-4 animate-spin" />
                                <p className="font-medium">Carregando produtos...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-20 text-destructive">
                                <Package className="w-12 h-12 mb-4 opacity-50" />
                                <p className="font-medium">Erro ao carregar produtos</p>
                                <p className="text-sm">Tente recarregar a página</p>
                            </div>
                        ) : filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Package className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-medium">Nenhum produto encontrado</p>
                                <p className="text-sm">Tente ajustar os filtros ou busca</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                {filteredProducts.map(product => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        isExpanded={expandedId === product.id}
                                        onToggle={toggleExpand}
                                    //onAddToList={handleAddToList}
                                    />
                                ))}
                            </div>
                        )}

                        {/*Supermercados perto de você*/}
                        <div className="mt-10">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-semibold text-foreground">Supermercados perto de você</h3>
                                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Santos, SP
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" className="text-xs gap-1.5">
                                    Ver no mapa <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {nearbyMarkets.map((market, idx) => (
                                    <Card
                                        key={idx}
                                        className="p-4 border-border hover:shadow-md hover:bg-muted/50 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="p-2 bg-primary/10 rounded-lg">
                                                <Store className="w-5 h-5 text-primary" />
                                            </div>
                                            <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${market.open
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-red-100 text-red-600'
                                                }`}>
                                                {market.open ? 'Aberto' : 'Fechado'}
                                            </span>
                                        </div>
                                        <h4 className="font-medium text-foreground text-sm mb-2">{market.name}</h4>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-0.5">
                                                <MapPin className="w-3 h-3" /> {market.distance}
                                            </span>
                                            <span className="flex items-center gap-0.5">
                                                <Package className="w-3 h-3" /> {market.products} produtos
                                            </span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/*PAINEL DE LISTAS*/}
                    {showListPanel && (
                        <aside className="w-64 shrink-0">
                            <Card className="border-border p-4 sticky top-32">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart className="w-4 h-4 text-primary" />
                                        <span className="font-semibold text-foreground text-sm">Minhas Listas</span>
                                    </div>
                                    <button onClick={() => setShowListPanel(false)} className="text-muted-foreground hover:text-foreground">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {shoppingLists.map(list => (
                                        <div key={list.id} className="p-3 bg-muted rounded-lg cursor-pointer hover:bg-primary/10 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="font-medium text-foreground text-sm">{list.name}</p>
                                                <Badge variant="secondary" className="text-[10px]">{list.items} itens</Badge>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-muted-foreground">Total</span>
                                                <span className="font-medium text-foreground">R$ {list.total.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-xs mt-0.5">
                                                <span className="text-primary">Economia</span>
                                                <span className="font-medium text-primary">R$ {list.savings.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button size="sm" className="w-full mt-4 text-xs gap-1.5">
                                    <Plus className="w-3.5 h-3.5" /> Nova Lista
                                </Button>

                                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <Zap className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-semibold text-primary">Economia total</span>
                                    </div>
                                    <p className="text-xl font-bold text-primary">
                                        R$ {shoppingLists.reduce((a, l) => a + l.savings, 0).toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">em todas as listas</p>
                                </div>
                            </Card>
                        </aside>
                    )}
                </div>
            </div>
        </div >
    )
}