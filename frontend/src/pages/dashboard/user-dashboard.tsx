import logoImg from '@/assets/logo-unimarket.png'
import {
    Badge, Button, Card,
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
    Input,
} from '@/components/ui'
import { useLogout } from '@/hooks/use-logout'
import {
    createPriceAlert,
    listNotifications,
    listPriceAlerts,
    markNotificationsAsRead,
} from '@/services/notification'
import type { PriceNotificationResponse } from '@/types/notification'
import { listProducts, searchProductsByMarketId } from '@/services/product'
import type { MarketProductResponse } from '@/types/product'
import type { TransformedProduct } from './product-card'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
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
import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
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
    const queryClient = useQueryClient()

    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('all')
    const [showFilters, setShowFilters] = useState(false)
    const [maxDistance, setMaxDistance] = useState(5)
    const [maxPrice, setMaxPrice] = useState(100)
    const [sortBy, setSortBy] = useState<'price' | 'savings'>('price')
    const [showListPanel, setShowListPanel] = useState(false)
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [alertProduct, setAlertProduct] = useState<TransformedProduct | null>(null)
    const [desiredPrice, setDesiredPrice] = useState('')
    const notifiedBrowserIds = useRef(new Set<number>())

    const canUseNotifications = isLogged && userRole === 'USER'

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

    const { data: priceAlerts = [] } = useQuery({
        queryKey: ['priceAlerts'],
        queryFn: listPriceAlerts,
        enabled: canUseNotifications,
    })

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: listNotifications,
        enabled: canUseNotifications,
        refetchInterval: canUseNotifications ? 15000 : false,
    })

    const unreadCount = notifications.filter(notification => !notification.read).length

    const activeAlertByProductId = useMemo(() => {
        return new Set(
            priceAlerts
                .filter(alert => alert.active)
                .map(alert => alert.marketProductId),
        )
    }, [priceAlerts])

    useEffect(() => {
        if (!canUseNotifications || typeof window === 'undefined' || !('Notification' in window)) {
            return
        }

        notifications
            .filter(notification => !notification.read && !notifiedBrowserIds.current.has(notification.id))
            .forEach(notification => {
                notifiedBrowserIds.current.add(notification.id)

                if (Notification.permission === 'granted') {
                    new Notification(notification.title, {
                        body: notification.message,
                        tag: `price-alert-${notification.id}`,
                    })
                }
            })
    }, [canUseNotifications, notifications])

    const createAlertMutation = useMutation({
        mutationFn: () => {
            if (!alertProduct) {
                throw new Error('Produto nao selecionado')
            }

            return createPriceAlert({
                marketProductId: alertProduct.id,
                desiredPrice: Number(desiredPrice),
            })
        },
        onSuccess: async () => {
            toast.success('Alerta de preço criado')
            setAlertProduct(null)
            setDesiredPrice('')
            await queryClient.invalidateQueries({ queryKey: ['priceAlerts'] })
            await queryClient.invalidateQueries({ queryKey: ['notifications'] })

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission()
            }
        },
        onError: () => {
            toast.error('Não foi possível criar o alerta')
        },
    })

    const markAsReadMutation = useMutation({
        mutationFn: markNotificationsAsRead,
        onMutate: async () => {
            await queryClient.cancelQueries({ queryKey: ['notifications'] })
            const previousNotifications = queryClient.getQueryData<PriceNotificationResponse[]>(['notifications'])

            queryClient.setQueryData<PriceNotificationResponse[]>(['notifications'], current =>
                current?.map(notification => ({ ...notification, read: true })) ?? [],
            )

            return { previousNotifications }
        },
        onError: (_error, _variables, context) => {
            if (context?.previousNotifications) {
                queryClient.setQueryData(['notifications'], context.previousNotifications)
            }

            toast.error('Não foi possível marcar as notificações como lidas')
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
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
                    badge: activeAlertByProductId.has(product.id) ? 'Alerta ativo' : null,
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
                badge: activeAlertByProductId.has(product.id) ? 'Alerta ativo' : null,
                markets: [{
                    name: product.marketName || 'Market',
                    price,
                    distance: '0.5 km',
                }],
            }
        })
    }, [apiProducts, searchedProducts, deferredSearch, activeAlertByProductId])

    const filteredProducts = useMemo(() =>
        transformedProducts
            .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
            .filter(p => p.lowestPrice <= maxPrice)
            .sort((a, b) => sortBy === 'price' ? a.lowestPrice - b.lowestPrice : b.savings - a.savings),
        [transformedProducts, selectedCategory, maxPrice, sortBy]
    )

    const totalListItems = shoppingLists.reduce((total, list) => total + list.items, 0)
    const totalListSavings = shoppingLists.reduce((total, list) => total + list.savings, 0)
    const activeAlertCount = priceAlerts.filter(alert => alert.active).length

    const toggleExpand = useCallback(
        (id: number) => setExpandedId(prev => prev === id ? null : id),
        []
    )

    const handleCreateAlert = useCallback((product: TransformedProduct) => {
        if (!canUseNotifications) {
            toast.info('Entre como usuario para criar alertas de preço')
            navigate({ to: '/login' })
            return
        }

        setAlertProduct(product)
        setDesiredPrice(product.lowestPrice > 0 ? product.lowestPrice.toFixed(2) : '')
    }, [canUseNotifications, navigate])

    const submitAlert = useCallback(() => {
        const numericPrice = Number(desiredPrice)

        if (!alertProduct || !Number.isFinite(numericPrice) || numericPrice <= 0) {
            toast.error('Informe um preço desejado valido')
            return
        }

        createAlertMutation.mutate()
    }, [alertProduct, createAlertMutation, desiredPrice])

    const handleAddToList = useCallback((product: TransformedProduct) => {
        setShowListPanel(true)
        toast.success(`${product.name} adicionado a sua lista`)
    }, [])

    const handleMarkNotificationsAsRead = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()
        markAsReadMutation.mutate()
    }, [markAsReadMutation])

    const handleOpenProfile = useCallback(() => {
        if (!isLogged) {
            navigate({ to: '/login' })
            return
        }

        navigate({ to: '/profile' })
    }, [isLogged, navigate])

    return (
        <div className="min-h-screen bg-muted/30">

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
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="relative text-muted-foreground">
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-1 bg-destructive text-destructive-foreground text-[9px] rounded-full flex items-center justify-center">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-80 mt-1">
                                    <div className="px-3 py-2 flex items-center justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-medium text-foreground">Notificações</p>
                                            <p className="text-xs text-muted-foreground">{unreadCount} Não lida{unreadCount !== 1 ? 's' : ''}</p>
                                        </div>
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-xs cursor-pointer"
                                                disabled={markAsReadMutation.isPending}
                                                onClick={handleMarkNotificationsAsRead}
                                            >
                                                {markAsReadMutation.isPending ? 'Marcando...' : 'Marcar como lidas'}
                                            </Button>
                                        )}
                                    </div>
                                    <DropdownMenuSeparator />
                                    {!canUseNotifications ? (
                                        <div className="px-3 py-4 text-sm text-muted-foreground">
                                            Faça login como usuário para receber alertas de preço.
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="px-3 py-4 text-sm text-muted-foreground">
                                            Não há notificações.
                                        </div>
                                    ) : (
                                        notifications.slice(0, 5).map(notification => (
                                            <DropdownMenuItem key={notification.id} className="items-start gap-2 py-3 cursor-default">
                                                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.read ? 'bg-muted' : 'bg-primary'}`} />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-foreground">{notification.productName}</p>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">{notification.message}</p>
                                                </div>
                                            </DropdownMenuItem>
                                        ))
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="ghost" size="icon"
                                onClick={() => setShowListPanel(!showListPanel)}
                                className="relative text-muted-foreground"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center">
                                    {totalListItems}
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
                                        <DropdownMenuItem onClick={handleOpenProfile} className="cursor-pointer">
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
                <section className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="gap-1">
                                    <MapPin className="w-3 h-3" />
                                    Santos, SP
                                </Badge>
                                <Badge variant="outline">Consumidor</Badge>
                            </div>
                            <h1 className="mt-3 text-2xl font-bold text-foreground">
                                Olá, {userName}. Encontre o melhor preço antes de comprar.
                            </h1>
                            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                Compare produtos, acompanhe mercados próximos e deixe o UniMarket avisar quando o preço ficar bom.
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-lg border border-border bg-background px-4 py-3">
                                <p className="text-lg font-bold text-foreground">{filteredProducts.length}</p>
                                <p className="text-xs text-muted-foreground">produtos</p>
                            </div>
                            <div className="rounded-lg border border-border bg-background px-4 py-3">
                                <p className="text-lg font-bold text-foreground">{activeAlertCount}</p>
                                <p className="text-xs text-muted-foreground">alertas</p>
                            </div>
                            <div className="rounded-lg border border-border bg-background px-4 py-3">
                                <p className="text-lg font-bold text-primary">R$ {totalListSavings.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">economia</p>
                            </div>
                        </div>
                    </div>

                    <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap gap-2">
                            <Button size="sm" onClick={() => setShowListPanel(true)}>
                                <ShoppingCart className="w-4 h-4" />
                                Minhas listas
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleOpenProfile}>
                                <User className="w-4 h-4" />
                                Perfil e preferências
                            </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {unreadCount > 0 ? `${unreadCount} notificacao${unreadCount !== 1 ? 'es' : ''} aguardando leitura` : 'Tudo em dia nas notificacoes'}
                        </div>
                    </div>
                </section>

                <div className="flex flex-col gap-6 lg:flex-row">

                    {/* ── FILTROS ── */}
                    {showFilters && (
                        <aside className="w-full shrink-0 lg:w-56">
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
                                        onAddToList={handleAddToList}
                                        onCreateAlert={handleCreateAlert}
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
                        <aside className="w-full shrink-0 lg:w-64">
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
                                        R$ {totalListSavings.toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">em todas as listas</p>
                                </div>
                            </Card>
                        </aside>
                    )}
                </div>
            </div>

            <Dialog open={!!alertProduct} onOpenChange={(open) => !open && setAlertProduct(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Alerta de preço</DialogTitle>
                        <DialogDescription>
                            Avise quando o produto chegar no valor desejado.
                        </DialogDescription>
                    </DialogHeader>

                    {alertProduct && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-border p-3">
                                <p className="text-sm font-medium text-foreground">{alertProduct.name}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Preço atual: R$ {alertProduct.lowestPrice.toFixed(2)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="desiredPrice" className="text-xs font-medium text-muted-foreground">
                                    Preço desejado
                                </label>
                                <Input
                                    id="desiredPrice"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    value={desiredPrice}
                                    onChange={(event) => setDesiredPrice(event.target.value)}
                                    placeholder="Ex.: 9.99"
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAlertProduct(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={submitAlert} disabled={createAlertMutation.isPending}>
                            {createAlertMutation.isPending ? 'Salvando...' : 'Criar alerta'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div >
    )
}
