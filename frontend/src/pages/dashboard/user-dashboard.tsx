import logoImg from '@/assets/logo-unimarket.png'
import {
    Badge, Button, Card, Input,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui'
import { useLogout } from '@/hooks/use-logout'
import { useNavigate } from '@tanstack/react-router'
import Cookies from 'js-cookie'
import {
    Bell, ChevronDown, ChevronUp,
    Filter, List, LogOut, MapPin, Package,
    Plus, Search, ShoppingCart,
    SlidersHorizontal, Store, Tag,
    TrendingDown, User, X, Zap, ChevronRight
} from 'lucide-react'
import { useState } from 'react'

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

const allProducts = [
    {
        id: 1, name: 'Arroz Branco Tio João 5kg', category: 'basics',
        lowestPrice: 24.90, averagePrice: 29.90, savings: 16.7,
        badge: 'Mais buscado',
        markets: [
            { name: 'Supermercado Econômico', price: 24.90, distance: '0.5 km' },
            { name: 'Mercado da Família', price: 26.50, distance: '1.2 km' },
            { name: 'Super Compras', price: 29.90, distance: '2.0 km' },
        ],
    },
    {
        id: 2, name: 'Feijão Preto Camil 1kg', category: 'basics',
        lowestPrice: 7.99, averagePrice: 9.50, savings: 15.9,
        badge: null,
        markets: [
            { name: 'Mercado da Família', price: 7.99, distance: '1.2 km' },
            { name: 'Supermercado Econômico', price: 8.50, distance: '0.5 km' },
            { name: 'Super Compras', price: 9.90, distance: '2.0 km' },
        ],
    },
    {
        id: 3, name: 'Óleo de Soja Liza 900ml', category: 'oils',
        lowestPrice: 6.49, averagePrice: 7.90, savings: 17.8,
        badge: 'Oferta',
        markets: [
            { name: 'Super Compras', price: 6.49, distance: '2.0 km' },
            { name: 'Supermercado Econômico', price: 7.20, distance: '0.5 km' },
            { name: 'Mercado da Família', price: 7.99, distance: '1.2 km' },
        ],
    },
    {
        id: 4, name: 'Macarrão Galo 500g', category: 'pasta',
        lowestPrice: 3.99, averagePrice: 4.80, savings: 16.9,
        badge: null,
        markets: [
            { name: 'Supermercado Econômico', price: 3.99, distance: '0.5 km' },
            { name: 'Mercado da Família', price: 4.50, distance: '1.2 km' },
            { name: 'Super Compras', price: 4.99, distance: '2.0 km' },
        ],
    },
    {
        id: 5, name: 'Leite Integral Itambé 1L', category: 'dairy',
        lowestPrice: 4.29, averagePrice: 5.50, savings: 22.0,
        badge: '30% OFF',
        markets: [
            { name: 'Supermercado Econômico', price: 4.29, distance: '0.5 km' },
            { name: 'Super Compras', price: 4.99, distance: '2.0 km' },
            { name: 'Mercado da Família', price: 5.50, distance: '1.2 km' },
        ],
    },
    {
        id: 6, name: 'Refrigerante Coca-Cola 2L', category: 'drinks',
        lowestPrice: 8.99, averagePrice: 11.00, savings: 18.3,
        badge: '2 por 1',
        markets: [
            { name: 'Mercado da Família', price: 8.99, distance: '1.2 km' },
            { name: 'Supermercado Econômico', price: 10.50, distance: '0.5 km' },
            { name: 'Super Compras', price: 11.00, distance: '2.0 km' },
        ],
    },
]

const nearbyMarkets = [
    { name: 'Supermercado Econômico', distance: '0.5 km', products: 1240, open: true },
    { name: 'Mercado da Família', distance: '1.2 km', products: 980, open: true },
    { name: 'Super Compras', distance: '2.0 km', products: 1540, open: false },
]

const shoppingLists = [
    { id: 1, name: 'Compras do Mês', items: 12, total: 289.50, savings: 45.20 },
    { id: 2, name: 'Feira da Semana', items: 8, total: 85.90, savings: 12.30 },
]

export function UserDashboard() {
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

    const userName = Cookies.get('marketName') || Cookies.get('userName') || 'Usuário'
    const userRole = Cookies.get('userRole')
    const isLogged = !!Cookies.get('accessToken')

    const filteredProducts = allProducts
        .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
        .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .filter(p => p.lowestPrice <= maxPrice)
        .sort((a, b) =>
            sortBy === 'price' ? a.lowestPrice - b.lowestPrice : b.savings - a.savings
        )

    const toggleExpand = (id: number) =>
        setExpandedId(prev => (prev === id ? null : id))

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
                        {filteredProducts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                                <Package className="w-12 h-12 mb-4 opacity-20" />
                                <p className="font-medium">Nenhum produto encontrado</p>
                                <p className="text-sm">Tente ajustar os filtros ou busca</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                {filteredProducts.map(product => {
                                    const isExpanded = expandedId === product.id
                                    return (
                                        <div key={product.id} className={`relative ${isExpanded ? 'z-50' : 'z-0'}`}>

                                            <Card
                                                onClick={() => toggleExpand(product.id)}
                                                className={`group overflow-visible cursor-pointer flex flex-col transition-colors duration-800 relative z-20 ${isExpanded
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

                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                        }}
                                                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-card border border-border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>

                                                <div className="p-4 flex-1 flex flex-col">
                                                    <h4 className="font-medium text-foreground text-sm leading-tight mb-3 line-clamp-2">
                                                        {product.name}
                                                    </h4>

                                                    <div className="flex items-end justify-between mb-3">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">A partir de</p>
                                                            <p className="text-xl font-bold text-primary">
                                                                R$ {product.lowestPrice.toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full">
                                                            <TrendingDown className="w-3 h-3" />
                                                            <span className="text-xs font-medium">{product.savings.toFixed(0)}% off</span>
                                                        </div>
                                                    </div>

                                                    <p className="text-xs text-muted-foreground mb-1">
                                                        em {product.markets.length} mercados •{' '}
                                                        <span className="text-foreground">{product.markets[0].distance}</span>
                                                    </p>


                                                    <div className={`mt-auto pt-3 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors ${!isExpanded ? ' mt-3' : ''}`}>
                                                        <span className="text-xs font-medium mr-1">
                                                            {isExpanded ? 'Ocultar mercados' : 'Ver opções'}
                                                        </span>
                                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                                    </div>
                                                </div>
                                            </Card>


                                            <div
                                                className={`absolute top-[calc(100%-1px)] left-0 right-0 z-10 bg-card rounded-b-lg border-x border-b overflow-hidden transition-all duration-300 ease-in-out ${isExpanded
                                                    ? 'max-h-[500px] opacity-100 border-primary shadow-xl'
                                                    : 'max-h-0 opacity-0 border-transparent shadow-none pointer-events-none'
                                                    }`}
                                            >
                                                <div className="p-4 pt-0">

                                                    <div className="pt-2 space-y-2">
                                                        {product.markets.map((market, idx) => (
                                                            <div
                                                                key={idx}
                                                                className={`flex items-center justify-between p-2 rounded-lg ${idx === 0
                                                                    ? 'bg-primary/10 ring-1 ring-primary/20'
                                                                    : 'bg-muted'
                                                                    }`}
                                                            >
                                                                <div className="flex items-center gap-2">
                                                                    <div className={`p-1.5 rounded-md ${idx === 0 ? 'bg-primary/20' : 'bg-card'}`}>
                                                                        <Store className={`w-3.5 h-3.5 ${idx === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-medium text-foreground">{market.name}</p>
                                                                        <div className="flex items-center gap-0.5 text-muted-foreground">
                                                                            <MapPin className="w-2.5 h-2.5" />
                                                                            <span className="text-[10px]">{market.distance}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className={`font-bold text-sm ${idx === 0 ? 'text-primary' : 'text-foreground'}`}>
                                                                        R$ {market.price.toFixed(2)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
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