import logoImg from '@/assets/logo-unimarket-auth.png'
import {
    Badge, Button, Card,
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
    Input,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Skeleton,
} from '@/components/ui'
import { useLogout } from '@/hooks/use-logout'
import { getApiErrorMessage } from '@/lib/api-error'
import {
    createPriceAlert,
    listNotifications,
    listPriceAlerts,
    markNotificationsAsRead,
} from '@/services/notification'
import type { PriceNotificationResponse } from '@/types/notification'
import { listAllMarketProducts, searchGeneralProducts } from '@/services/product'
import {
    addShoppingListItem,
    createShoppingList,
    deleteShoppingList,
    deleteShoppingListItem,
    listShoppingListItems,
    listShoppingLists,
} from '@/services/shopping-list'
import { listNearbyMarkets } from '@/services/supermarket'
import { getCurrentUserProfile } from '@/services/user'
import type { MarketProductResponse } from '@/types/product'
import type { ShoppingListItem } from '@/types/shopping-list'
import type { MarketResponse } from '@/types/supermarket'
import type { TransformedProduct } from './product-card'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
    Bell, ChevronDown,
    ChevronRight,
    CircleDollarSign,
    Filter, List,
    LocateFixed,
    LogOut, MapPin, Package,
    Plus, Search, ShoppingCart,
    SlidersHorizontal, Store, Tag,
    Trash2, User, X
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

type SortMode = 'lowest-price' | 'highest-price' | 'distance' | 'savings'

const sortOptions: Array<{ id: SortMode; label: string }> = [
    { id: 'lowest-price', label: 'Menor preço' },
    { id: 'highest-price', label: 'Maior preço' },
    { id: 'distance', label: 'Proximidade' },
    { id: 'savings', label: 'Maior economia' },
]

function getStoredString(key: string, fallback: string) {
    if (typeof window === 'undefined') {
        return fallback
    }

    return window.localStorage.getItem(key) ?? fallback
}

function getStoredNumber(key: string) {
    if (typeof window === 'undefined') {
        return null
    }

    const value = window.localStorage.getItem(key)
    const parsedValue = value ? Number(value) : NaN
    return Number.isFinite(parsedValue) ? parsedValue : null
}

function getStoredLocation() {
    const rawCity = getStoredString('unimarket.profile.city', 'Santos')
    const rawState = getStoredString('unimarket.profile.state', 'SP')

    if (rawCity.includes(',')) {
        const [city, state] = rawCity.split(',', 2)
        return {
            city: city.trim() || 'Santos',
            state: state.trim() || rawState || 'SP',
        }
    }

    return {
        city: rawCity || 'Santos',
        state: rawState || 'SP',
    }
}

function formatDistance(market?: MarketResponse | null) {
    if (!market || market.distanceKm == null) {
        return 'Distância indisponível'
    }

    return `${market.distanceKm.toFixed(1)} km`
}

function calculateDistanceKm(
    originLatitude: number | null,
    originLongitude: number | null,
    destinationLatitude?: number | null,
    destinationLongitude?: number | null,
) {
    if (
        originLatitude == null ||
        originLongitude == null ||
        destinationLatitude == null ||
        destinationLongitude == null
    ) {
        return null
    }

    const earthRadiusKm = 6371
    const degreesToRadians = (value: number) => (value * Math.PI) / 180
    const deltaLatitude = degreesToRadians(destinationLatitude - originLatitude)
    const deltaLongitude = degreesToRadians(destinationLongitude - originLongitude)
    const originLatRadians = degreesToRadians(originLatitude)
    const destinationLatRadians = degreesToRadians(destinationLatitude)

    const haversine =
        Math.sin(deltaLatitude / 2) * Math.sin(deltaLatitude / 2) +
        Math.cos(originLatRadians) *
        Math.cos(destinationLatRadians) *
        Math.sin(deltaLongitude / 2) *
        Math.sin(deltaLongitude / 2)

    const centralAngle = 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
    return Math.round(earthRadiusKm * centralAngle * 10) / 10
}

function formatDistanceKm(distanceKm?: number | null) {
    return distanceKm == null ? 'Distância indisponível' : `${distanceKm.toFixed(1)} km`
}

function formatMarketAddress(market: MarketResponse) {
    return [market.streetAddress, market.neighborhood, market.city, market.state]
        .filter(Boolean)
        .join(', ')
}

function normalizeProductKey(product: MarketProductResponse) {
    return product.productId ? `product-${product.productId}` : `${product.productName}-${product.brand}`.toLowerCase()
}

function getInitials(value: string) {
    return value
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'U'
}

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
    const [maxDistance, setMaxDistance] = useState(() => getStoredNumber('unimarket.profile.radius') ?? 5)
    const [maxPrice, setMaxPrice] = useState(100)
    const [sortBy, setSortBy] = useState<SortMode>('lowest-price')
    const [showListPanel, setShowListPanel] = useState(false)
    const [newListOpen, setNewListOpen] = useState(false)
    const [newListName, setNewListName] = useState('')
    const [selectedShoppingListId, setSelectedShoppingListId] = useState<number | null>(null)
    const [listProduct, setListProduct] = useState<TransformedProduct | null>(null)
    const [listQuantity, setListQuantity] = useState(1)
    const [selectedMarketId, setSelectedMarketId] = useState(marketId)
    const [userLatitude, setUserLatitude] = useState<number | null>(() => getStoredNumber('unimarket.profile.latitude'))
    const [userLongitude, setUserLongitude] = useState<number | null>(() => getStoredNumber('unimarket.profile.longitude'))
    const [userCity, setUserCity] = useState(() => getStoredLocation().city)
    const [userState, setUserState] = useState(() => getStoredLocation().state)
    const [userZipCode, setUserZipCode] = useState(() => getStoredString('unimarket.profile.zipCode', ''))
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [alertProduct, setAlertProduct] = useState<TransformedProduct | null>(null)
    const [desiredPrice, setDesiredPrice] = useState('')
    const notifiedBrowserIds = useRef(new Set<number>())

    const isGuest = userRole === 'GUEST'
    const displayName = isGuest ? 'visitante' : userName
    const canUseNotifications = isLogged && userRole === 'USER'

    const nearbyMarketParams = useMemo(() => ({
        latitude: userLatitude ?? undefined,
        longitude: userLongitude ?? undefined,
        city: userCity,
        state: userState,
        radiusKm: maxDistance,
    }), [maxDistance, userCity, userLatitude, userLongitude, userState])

    const { data: nearbyMarketResults = [], isLoading: isLoadingMarkets } = useQuery({
        queryKey: ['nearbyMarkets', nearbyMarketParams],
        queryFn: () => listNearbyMarkets(nearbyMarketParams),
    })

    const distanceMarketParams = useMemo(() => ({
        latitude: userLatitude ?? undefined,
        longitude: userLongitude ?? undefined,
        city: userCity,
        state: userState,
        radiusKm: userLatitude != null && userLongitude != null ? 5000 : maxDistance,
    }), [maxDistance, userCity, userLatitude, userLongitude, userState])

    const { data: distanceMarketResults = [] } = useQuery({
        queryKey: ['marketDistanceIndex', distanceMarketParams],
        queryFn: () => listNearbyMarkets(distanceMarketParams),
    })

    const { data: userProfile } = useQuery({
        queryKey: ['userProfile'],
        queryFn: getCurrentUserProfile,
        enabled: isLogged && userRole === 'USER',
    })

    const clientId = userProfile?.id
    const canUseShoppingLists = isLogged && userRole === 'USER' && !!clientId

    const profileImageUrl = isGuest ? '' : userProfile?.profileImageUrl ?? getStoredString('unimarket.profile.imageUrl', '')

    const deferredSearch = useDeferredValue(searchQuery)

    const { data: catalogPage, isLoading, error } = useQuery({
        queryKey: ['globalMarketProducts', deferredSearch],
        queryFn: () => deferredSearch.trim()
            ? searchGeneralProducts({ name: deferredSearch.trim(), page: 0, size: 160 })
            : listAllMarketProducts({ page: 0, size: 160 }),
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

    const { data: shoppingLists = [], isLoading: isLoadingShoppingLists } = useQuery({
        queryKey: ['shoppingLists', clientId],
        queryFn: () => listShoppingLists(clientId!),
        enabled: canUseShoppingLists,
    })

    const shoppingListItemQueries = useQueries({
        queries: shoppingLists.map(list => ({
            queryKey: ['shoppingListItems', list.id],
            queryFn: () => listShoppingListItems(list.id),
            enabled: canUseShoppingLists,
        })),
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
        if (!userProfile) {
            return
        }

        if (userProfile.city) {
            setUserCity(userProfile.city)
            window.localStorage.setItem('unimarket.profile.city', userProfile.city)
        }

        if (userProfile.state) {
            setUserState(userProfile.state)
            window.localStorage.setItem('unimarket.profile.state', userProfile.state)
        }

        if (userProfile.zipCode) {
            setUserZipCode(userProfile.zipCode)
            window.localStorage.setItem('unimarket.profile.zipCode', userProfile.zipCode)
        }

        if (userProfile.neighborhood) {
            window.localStorage.setItem('unimarket.profile.neighborhood', userProfile.neighborhood)
        }

        if (userProfile.profileImageUrl) {
            window.localStorage.setItem('unimarket.profile.imageUrl', userProfile.profileImageUrl)
        }

        if (userProfile.latitude != null && userProfile.longitude != null) {
            setUserLatitude(userProfile.latitude)
            setUserLongitude(userProfile.longitude)
            window.localStorage.setItem('unimarket.profile.latitude', String(userProfile.latitude))
            window.localStorage.setItem('unimarket.profile.longitude', String(userProfile.longitude))
        } else if (userProfile.zipCode || userProfile.city || userProfile.neighborhood) {
            setUserLatitude(null)
            setUserLongitude(null)
            window.localStorage.removeItem('unimarket.profile.latitude')
            window.localStorage.removeItem('unimarket.profile.longitude')
        }

        if (userProfile.searchRadiusKm != null) {
            setMaxDistance(userProfile.searchRadiusKm)
            window.localStorage.setItem('unimarket.profile.radius', String(userProfile.searchRadiusKm))
        }
    }, [userProfile])

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

    useEffect(() => {
        if (nearbyMarketResults.length === 0) {
            return
        }

        const selectedMarketStillVisible = nearbyMarketResults.some(market => market.id === selectedMarketId)

        if (!selectedMarketStillVisible) {
            setSelectedMarketId(nearbyMarketResults[0].id)
        }
    }, [nearbyMarketResults, selectedMarketId])

    useEffect(() => {
        if (shoppingLists.length === 0) {
            setSelectedShoppingListId(null)
            return
        }

        const selectedListStillExists = shoppingLists.some(list => list.id === selectedShoppingListId)
        if (!selectedListStillExists) {
            setSelectedShoppingListId(shoppingLists[0].id)
        }
    }, [selectedShoppingListId, shoppingLists])

    const createAlertMutation = useMutation({
        mutationFn: () => {
            if (!alertProduct) {
                throw new Error('Produto não selecionado')
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

    const createListMutation = useMutation({
        mutationFn: () => createShoppingList(clientId!, { name: newListName.trim() }),
        onSuccess: async (createdList) => {
            setSelectedShoppingListId(createdList.id)
            setNewListName('')
            setNewListOpen(false)
            setShowListPanel(true)
            toast.success('Lista de compras criada.')
            await queryClient.invalidateQueries({ queryKey: ['shoppingLists', clientId] })
        },
        onError: (listError: unknown) => {
            toast.error(getApiErrorMessage(listError, 'Não foi possível criar a lista.'))
        },
    })

    const addItemMutation = useMutation({
        mutationFn: () => {
            if (!listProduct || !selectedShoppingListId) {
                throw new Error('Selecione uma lista para adicionar o produto.')
            }

            return addShoppingListItem(selectedShoppingListId, {
                marketProductId: listProduct.id,
                quantity: listQuantity,
            })
        },
        onSuccess: async () => {
            toast.success('Produto adicionado à lista.')
            setListProduct(null)
            setListQuantity(1)
            setShowListPanel(true)
            await queryClient.invalidateQueries({ queryKey: ['shoppingListItems', selectedShoppingListId] })
        },
        onError: (itemError: unknown) => {
            toast.error(getApiErrorMessage(itemError, 'Não foi possível adicionar o produto.'))
        },
    })

    const deleteListMutation = useMutation({
        mutationFn: (listId: number) => deleteShoppingList(clientId!, listId),
        onSuccess: async () => {
            toast.success('Lista removida.')
            await queryClient.invalidateQueries({ queryKey: ['shoppingLists', clientId] })
        },
        onError: (listError: unknown) => {
            toast.error(getApiErrorMessage(listError, 'Não foi possível remover a lista.'))
        },
    })

    const deleteItemMutation = useMutation({
        mutationFn: ({ itemId, listId }: { itemId: number; listId: number }) => deleteShoppingListItem(listId, itemId),
        onSuccess: async (_data, variables) => {
            toast.success('Item removido da lista.')
            await queryClient.invalidateQueries({ queryKey: ['shoppingListItems', variables.listId] })
        },
        onError: (itemError: unknown) => {
            toast.error(getApiErrorMessage(itemError, 'Não foi possível remover o item.'))
        },
    })

    const transformedProducts = useMemo(() => {
        const nearbyMarketById = new Map(distanceMarketResults.map(market => [market.id, market]))
        const source = (catalogPage?.content ?? []).map(product => ({
            product,
            market: nearbyMarketById.get(product.marketId) ?? null,
        }))

        const groupedProducts = new Map<string, Array<{ product: MarketProductResponse; market: MarketResponse | null }>>()

        source.forEach(item => {
            const key = normalizeProductKey(item.product)
            const current = groupedProducts.get(key) ?? []
            current.push(item)
            groupedProducts.set(key, current)
        })

        return Array.from(groupedProducts.values()).map(items => {
            const byLowestPrice = [...items].sort((first, second) => {
                const firstPrice = first.product.price != null ? Number(first.product.price) : Number.MAX_VALUE
                const secondPrice = second.product.price != null ? Number(second.product.price) : Number.MAX_VALUE
                return firstPrice - secondPrice
            })
            const cheapest = byLowestPrice[0]
            const imageUrl = items.find(({ product }) => product.imageUrl)?.product.imageUrl ?? null
            const marketRows = items.map(({ product, market }) => {
                const distanceKm = market?.distanceKm
                    ?? calculateDistanceKm(
                        userLatitude,
                        userLongitude,
                        product.marketLatitude,
                        product.marketLongitude,
                    )

                return {
                    id: product.id,
                    marketId: product.marketId,
                    name: product.marketName || market?.name || 'Mercado',
                    price: product.price != null ? Number(product.price) : 0,
                    distance: formatDistanceKm(distanceKm),
                    distanceKm,
                }
            })
            const validPrices = marketRows.map(row => row.price).filter(price => price > 0)
            const lowestPrice = validPrices.length ? Math.min(...validPrices) : 0
            const highestPrice = validPrices.length ? Math.max(...validPrices) : 0
            const averagePrice = validPrices.length
                ? validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length
                : 0
            const savings = averagePrice > 0 && lowestPrice > 0
                ? Math.round(((averagePrice - lowestPrice) / averagePrice) * 100)
                : 0
            const sortedMarketRows = [...marketRows].sort((first, second) => {
                if (sortBy === 'highest-price') {
                    return second.price - first.price
                }

                if (sortBy === 'distance') {
                    const firstDistance = first.distanceKm ?? Number.MAX_VALUE
                    const secondDistance = second.distanceKm ?? Number.MAX_VALUE
                    return firstDistance - secondDistance
                }

                return first.price - second.price
            })

            return {
                id: cheapest.product.id,
                productId: cheapest.product.productId,
                name: cheapest.product.productName,
                imageUrl,
                category: cheapest.product.categoryName || 'Sem categoria',
                lowestPrice,
                highestPrice,
                averagePrice,
                savings,
                badge: activeAlertByProductId.has(cheapest.product.id)
                    ? 'Alerta ativo'
                    : marketRows.length > 1
                        ? `${marketRows.length} mercados`
                        : null,
                markets: sortedMarketRows,
            }
        })
    }, [activeAlertByProductId, catalogPage?.content, distanceMarketResults, sortBy, userLatitude, userLongitude])

    const filteredProducts = useMemo(() =>
        transformedProducts
            .filter(p => deferredSearch.length === 0 || p.name.toLowerCase().includes(deferredSearch.toLowerCase()))
            .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
            .filter(p => p.lowestPrice <= maxPrice)
            .sort((a, b) => {
                if (sortBy === 'highest-price') {
                    return b.highestPrice - a.highestPrice
                }

                if (sortBy === 'distance') {
                    const firstDistance = a.markets[0]?.distanceKm ?? Number.MAX_VALUE
                    const secondDistance = b.markets[0]?.distanceKm ?? Number.MAX_VALUE
                    return firstDistance - secondDistance
                }

                return sortBy === 'lowest-price' ? a.lowestPrice - b.lowestPrice : b.savings - a.savings
            }),
        [deferredSearch, transformedProducts, selectedCategory, maxPrice, sortBy]
    )

    const categoryOptions = useMemo(() => {
        const dynamicCategories = Array.from(
            new Set(transformedProducts.map(product => product.category).filter(Boolean)),
        ).sort((first, second) => first.localeCompare(second))

        return [
            categories[0],
            ...dynamicCategories.map(category => ({ id: category, label: category })),
        ]
    }, [transformedProducts])

    const shoppingListStats = useMemo(() => {
        const stats = new Map<number, { items: number; total: number }>()

        shoppingLists.forEach((list, index) => {
            const items = (shoppingListItemQueries[index]?.data ?? []) as ShoppingListItem[]
            stats.set(list.id, {
                items: items.reduce((sum, item) => sum + item.quantity, 0),
                total: items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0),
            })
        })

        return stats
    }, [shoppingListItemQueries, shoppingLists])

    const selectedListItems = useMemo(() => {
        const selectedIndex = shoppingLists.findIndex(list => list.id === selectedShoppingListId)
        return selectedIndex >= 0
            ? ((shoppingListItemQueries[selectedIndex]?.data ?? []) as ShoppingListItem[])
            : []
    }, [selectedShoppingListId, shoppingListItemQueries, shoppingLists])

    const selectedListTotal = selectedListItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)
    const totalListItems = Array.from(shoppingListStats.values()).reduce((total, list) => total + list.items, 0)
    const totalListSavings = filteredProducts.reduce((sum, product) => {
        const selectedQuantity = selectedListItems
            .filter(item => item.productName === product.name)
            .reduce((quantity, item) => quantity + item.quantity, 0)

        return sum + (selectedQuantity * Math.max(product.averagePrice - product.lowestPrice, 0))
    }, 0)
    const activeAlertCount = priceAlerts.filter(alert => alert.active).length
    const isProductsLoading = isLoading
    const nearbyMarketsView = nearbyMarketResults.map(market => ({
        id: market.id,
        name: market.name,
        distance: formatDistance(market),
        productsLabel: market.hasCoordinates ? 'Distância calculada' : 'Cidade e endereço cadastrados',
        open: true,
        googleMapsUrl: market.googleMapsUrl,
        address: formatMarketAddress(market),
    }))

    const toggleExpand = useCallback(
        (id: number) => setExpandedId(prev => prev === id ? null : id),
        []
    )

    const handleCreateAlert = useCallback((product: TransformedProduct) => {
        if (!canUseNotifications) {
            toast.info('Entre como usuário para criar alertas de preço.')
            navigate({ to: '/login' })
            return
        }

        setAlertProduct(product)
        setDesiredPrice(product.lowestPrice > 0 ? product.lowestPrice.toFixed(2) : '')
    }, [canUseNotifications, navigate])

    const submitAlert = useCallback(() => {
        const numericPrice = Number(desiredPrice)

        if (!alertProduct || !Number.isFinite(numericPrice) || numericPrice <= 0) {
            toast.error('Informe um preço desejado válido.')
            return
        }

        createAlertMutation.mutate()
    }, [alertProduct, createAlertMutation, desiredPrice])

    const handleAddToList = useCallback((product: TransformedProduct) => {
        if (!canUseShoppingLists) {
            toast.info('Entre como usuário para criar listas de compras.')
            navigate({ to: '/login' })
            return
        }

        if (shoppingLists.length === 0) {
            setListProduct(product)
            setNewListOpen(true)
            toast.info('Crie uma lista antes de adicionar produtos.')
            return
        }

        setListProduct(product)
        setSelectedShoppingListId(current => current ?? shoppingLists[0].id)
        setListQuantity(1)
        setShowListPanel(true)
    }, [canUseShoppingLists, navigate, shoppingLists])

    const handleCreateShoppingList = useCallback(() => {
        const trimmedName = newListName.trim()

        if (trimmedName.length < 3) {
            toast.error('Informe um nome para a lista.')
            return
        }

        if (!canUseShoppingLists) {
            toast.info('Entre como usuário para salvar listas de compras.')
            navigate({ to: '/login' })
            return
        }

        createListMutation.mutate()
    }, [canUseShoppingLists, createListMutation, navigate, newListName])

    const handleConfirmAddToList = useCallback(() => {
        if (!selectedShoppingListId) {
            toast.error('Selecione uma lista.')
            return
        }

        if (listQuantity < 1) {
            toast.error('Informe uma quantidade válida.')
            return
        }

        addItemMutation.mutate()
    }, [addItemMutation, listQuantity, selectedShoppingListId])

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

    const handleUseCurrentLocation = useCallback(() => {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            toast.error('Localização indisponível neste navegador')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setUserLatitude(latitude)
                setUserLongitude(longitude)

                if (typeof window !== 'undefined') {
                    window.localStorage.setItem('unimarket.profile.latitude', String(latitude))
                    window.localStorage.setItem('unimarket.profile.longitude', String(longitude))
                    window.localStorage.setItem('unimarket.profile.locationSource', 'BROWSER_GEOLOCATION')
                }

                toast.success('Localização atualizada. Os mercados próximos foram recalculados.')
            },
            () => toast.error('Não foi possível acessar sua localização'),
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }, [])

    const handleOpenMarketsMap = useCallback(() => {
        const query = userLatitude != null && userLongitude != null
            ? `supermercados perto de ${userLatitude},${userLongitude}`
            : `supermercados perto de ${[userCity, userState].filter(Boolean).join(', ')}`

        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer')
    }, [userCity, userLatitude, userLongitude, userState])

    const handleOpenMarketMap = useCallback((market: MarketResponse) => {
        window.open(market.googleMapsUrl, '_blank', 'noopener,noreferrer')
    }, [])

    return (
        <div className="app-gradient-bg min-h-screen">

            {/* ── NAVBAR ── */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-sm backdrop-blur">
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
                                className="h-9 w-full bg-background/80 pl-9 pr-4"
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
                                        <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {profileImageUrl ? (
                                                <img src={profileImageUrl} alt={displayName} className="h-full w-full object-cover" />
                                            ) : (
                                                getInitials(displayName)
                                            )}
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 mt-1">
                                    <div className="px-3 py-2">
                                        <p className="text-sm font-medium text-foreground">{isGuest ? 'Visitante UniMarket' : userName}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {isGuest ? 'Modo exploração' : 'Consumidor'}
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
                <div className="border-t border-border bg-card/80">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="flex items-center gap-2 overflow-x-auto py-2 scrollbar-hide">
                            {categoryOptions.map(cat => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={`h-8 shrink-0 rounded-md px-3 text-xs font-medium transition-colors ${selectedCategory === cat.id
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground'
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
                <section className="mb-6 rounded-lg border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="secondary" className="gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {[userCity, userState].filter(Boolean).join(', ')}
                                </Badge>
                                <Badge variant="outline">{isGuest ? 'Visitante' : 'Consumidor'}</Badge>
                            </div>
                            <h1 className="mt-3 text-2xl font-semibold tracking-tight text-foreground">
                                {isGuest
                                    ? 'Boas-vindas ao UniMarket. Explore preços perto de você.'
                                    : `Olá, ${displayName}! Encontre o melhor preço antes de comprar.`}
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                {isGuest
                                    ? 'Você pode comparar produtos e mercados próximos. Para salvar listas e alertas, entre como usuário.'
                                    : 'Compare produtos, acompanhe mercados próximos e deixe o UniMarket avisar quando o preço ficar bom.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
                                <p className="text-lg font-semibold tabular-nums text-foreground">{filteredProducts.length}</p>
                                <p className="text-xs text-muted-foreground">produtos</p>
                            </div>
                            <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
                                <p className="text-lg font-semibold tabular-nums text-foreground">{activeAlertCount}</p>
                                <p className="text-xs text-muted-foreground">alertas</p>
                            </div>
                            <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
                                <p className="text-lg font-semibold tabular-nums text-primary">R$ {totalListSavings.toFixed(2)}</p>
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
                                {isGuest ? 'Salvar preferências' : 'Perfil e preferências'}
                            </Button>
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {unreadCount > 0 ? `${unreadCount} notificação${unreadCount !== 1 ? 'ões' : ''} aguardando leitura` : 'Tudo em dia nas notificações'}
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
                                        {sortOptions.map(opt => (
                                            <button
                                                key={opt.id}
                                                onClick={() => setSortBy(opt.id)}
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
                                    onClick={() => { setMaxDistance(5); setMaxPrice(100); setSortBy('lowest-price') }}
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
                                        {sortOptions.find(option => option.id === sortBy)?.label ?? 'Ordenar'}
                                        <ChevronDown className="w-3 h-3" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    {sortOptions.map(option => (
                                        <DropdownMenuItem key={option.id} onClick={() => setSortBy(option.id)}>
                                            {option.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        {/*GRID DE PRODUTOS*/}
                        {isProductsLoading ? (
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <Card key={index} className="gap-0 overflow-hidden p-0">
                                        <Skeleton className="h-32 rounded-none" />
                                        <div className="space-y-3 p-4">
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-1/2" />
                                            <div className="flex items-end justify-between">
                                                <Skeleton className="h-7 w-24" />
                                                <Skeleton className="h-6 w-16 rounded-full" />
                                            </div>
                                            <Skeleton className="h-8 w-full" />
                                        </div>
                                    </Card>
                                ))}
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
                                        <MapPin className="w-3 h-3" /> {[userCity, userState].filter(Boolean).join(', ')}{userZipCode ? ` - CEP ${userZipCode}` : ''}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleUseCurrentLocation}>
                                    <LocateFixed className="w-3.5 h-3.5" /> Usar localização
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleOpenMarketsMap}>
                                    Ver no mapa <ChevronRight className="w-3.5 h-3.5" />
                                </Button>
                                {isLoadingMarkets && (
                                    <span className="text-xs text-muted-foreground">Atualizando...</span>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {isLoadingMarkets ? (
                                    Array.from({ length: 3 }).map((_, index) => (
                                        <Card key={index} className="gap-3 p-4">
                                            <div className="flex items-start justify-between">
                                                <Skeleton className="h-9 w-9" />
                                                <Skeleton className="h-5 w-14 rounded-full" />
                                            </div>
                                            <Skeleton className="h-4 w-3/4" />
                                            <Skeleton className="h-3 w-full" />
                                            <Skeleton className="h-3 w-2/3" />
                                        </Card>
                                    ))
                                ) : nearbyMarketsView.length === 0 ? (
                                    <Card className="p-5 sm:col-span-3">
                                        <div className="flex flex-col items-center justify-center py-6 text-center text-muted-foreground">
                                            <Store className="mb-3 h-10 w-10 opacity-30" />
                                            <p className="text-sm font-medium text-foreground">Nenhum supermercado encontrado nessa região</p>
                                            <p className="mt-1 max-w-md text-xs">
                                                Ajuste o raio de busca no perfil, confirme sua localização ou cadastre coordenadas nos mercados.
                                            </p>
                                        </div>
                                    </Card>
                                ) : nearbyMarketsView.map((market) => (
                                    <Card
                                        key={market.id}
                                        onClick={() => setSelectedMarketId(market.id)}
                                        className={`p-4 hover:shadow-md hover:bg-muted/50 transition-all cursor-pointer ${selectedMarketId === market.id ? 'border-primary bg-primary/5' : 'border-border'}`}
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
                                        {market.address && (
                                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{market.address}</p>
                                        )}
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-0.5">
                                                <MapPin className="w-3 h-3" /> {market.distance}
                                            </span>
                                            <span className="flex items-center gap-0.5">
                                                <Package className="w-3 h-3" /> {market.productsLabel}
                                            </span>
                                        </div>
                                        {market.googleMapsUrl && (
                                            <Button
                                                variant="outline"
                                                size="xs"
                                                className="mt-3"
                                                onClick={(event) => {
                                                    event.stopPropagation()
                                                    handleOpenMarketMap(nearbyMarketResults.find(item => item.id === market.id)!)
                                                }}
                                            >
                                                Abrir mapa
                                            </Button>
                                        )}
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/*PAINEL DE LISTAS*/}
                    {showListPanel && (
                        <aside className="w-full shrink-0 lg:w-80">
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
                                    {!canUseShoppingLists ? (
                                        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                                            Faça login como usuário para salvar listas e comparar totais.
                                        </div>
                                    ) : isLoadingShoppingLists ? (
                                        Array.from({ length: 2 }).map((_, index) => (
                                            <Skeleton key={index} className="h-20 w-full" />
                                        ))
                                    ) : shoppingLists.length === 0 ? (
                                        <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
                                            Nenhuma lista criada. Comece pela lista da semana ou do mês.
                                        </div>
                                    ) : shoppingLists.map(list => {
                                        const stats = shoppingListStats.get(list.id) ?? { items: 0, total: 0 }
                                        const selected = selectedShoppingListId === list.id

                                        return (
                                            <button
                                                key={list.id}
                                                type="button"
                                                onClick={() => setSelectedShoppingListId(list.id)}
                                                className={`w-full rounded-lg border p-3 text-left transition-colors ${selected ? 'border-primary bg-primary/5' : 'border-border bg-muted hover:bg-primary/10'}`}
                                            >
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <p className="truncate text-sm font-medium text-foreground">{list.name}</p>
                                                    <Badge variant="secondary" className="text-[10px]">{stats.items} itens</Badge>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Total estimado</span>
                                                    <span className="font-medium text-foreground">R$ {stats.total.toFixed(2)}</span>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>

                                <Button size="sm" className="w-full mt-4 text-xs gap-1.5" onClick={() => setNewListOpen(true)}>
                                    <Plus className="w-3.5 h-3.5" /> Nova Lista
                                </Button>

                                {selectedShoppingListId && (
                                    <div className="mt-4 rounded-lg border border-border bg-background/70">
                                        <div className="flex items-center justify-between border-b border-border p-3">
                                            <span className="text-xs font-semibold text-foreground">Itens da lista</span>
                                            <Button
                                                variant="ghost"
                                                size="icon-xs"
                                                onClick={() => deleteListMutation.mutate(selectedShoppingListId)}
                                                disabled={deleteListMutation.isPending}
                                                aria-label="Remover lista"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                        <div className="max-h-64 divide-y divide-border overflow-auto">
                                            {selectedListItems.length === 0 ? (
                                                <p className="p-3 text-xs text-muted-foreground">Adicione produtos para comparar o total.</p>
                                            ) : selectedListItems.map(item => (
                                                <div key={item.id} className="p-3">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="truncate text-xs font-semibold text-foreground">{item.productName}</p>
                                                            <p className="mt-1 text-[11px] text-muted-foreground">{item.marketName} • {item.quantity} un.</p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon-xs"
                                                            onClick={() => deleteItemMutation.mutate({ listId: selectedShoppingListId, itemId: item.id })}
                                                            disabled={deleteItemMutation.isPending}
                                                            aria-label={`Remover ${item.productName}`}
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                    <p className="mt-2 text-xs font-semibold text-primary">R$ {(Number(item.price) * item.quantity).toFixed(2)}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-4 p-3 bg-primary/10 rounded-lg">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <CircleDollarSign className="w-3.5 h-3.5 text-primary" />
                                        <span className="text-xs font-semibold text-primary">Total selecionado</span>
                                    </div>
                                    <p className="text-xl font-bold text-primary">
                                        R$ {selectedListTotal.toFixed(2)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">economia estimada: R$ {totalListSavings.toFixed(2)}</p>
                                </div>
                            </Card>
                        </aside>
                    )}
                </div>
            </div>

            <Dialog open={newListOpen} onOpenChange={setNewListOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nova lista de compras</DialogTitle>
                        <DialogDescription>
                            Crie uma lista para organizar produtos por mercado, preço e economia estimada.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-2">
                        <label htmlFor="newListName" className="text-xs font-medium text-muted-foreground">
                            Nome da lista
                        </label>
                        <Input
                            id="newListName"
                            value={newListName}
                            onChange={(event) => setNewListName(event.target.value)}
                            placeholder="Ex.: Compras da semana"
                            onKeyDown={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault()
                                    handleCreateShoppingList()
                                }
                            }}
                        />
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNewListOpen(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleCreateShoppingList} disabled={createListMutation.isPending}>
                            {createListMutation.isPending ? 'Criando...' : 'Criar lista'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!listProduct && shoppingLists.length > 0} onOpenChange={(open) => !open && setListProduct(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Adicionar à lista</DialogTitle>
                        <DialogDescription>
                            Escolha a lista e a quantidade para comparar o valor total da compra.
                        </DialogDescription>
                    </DialogHeader>

                    {listProduct && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-border p-3">
                                <p className="text-sm font-medium text-foreground">{listProduct.name}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Melhor oferta exibida: R$ {listProduct.lowestPrice.toFixed(2)}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="shoppingListTarget" className="text-xs font-medium text-muted-foreground">
                                    Lista
                                </label>
                                <Select
                                    value={selectedShoppingListId ? String(selectedShoppingListId) : undefined}
                                    onValueChange={(value) => setSelectedShoppingListId(Number(value))}
                                >
                                    <SelectTrigger id="shoppingListTarget">
                                        <SelectValue placeholder="Selecione uma lista" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shoppingLists.map(list => (
                                            <SelectItem key={list.id} value={String(list.id)}>
                                                {list.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="listQuantity" className="text-xs font-medium text-muted-foreground">
                                    Quantidade
                                </label>
                                <Input
                                    id="listQuantity"
                                    type="number"
                                    min={1}
                                    step={1}
                                    value={listQuantity}
                                    onChange={(event) => setListQuantity(Math.max(1, Number(event.target.value) || 1))}
                                />
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setListProduct(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmAddToList} disabled={addItemMutation.isPending}>
                            {addItemMutation.isPending ? 'Adicionando...' : 'Adicionar'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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
