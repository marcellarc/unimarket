import logoImg from '@/assets/logo-unimarket-auth.png'
import {
    Badge, Button, Card,
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
    Input,
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
    Skeleton,
    Textarea,
} from '@/components/ui'
import { useLogout } from '@/hooks/use-logout'
import { useFeedbackReplyNotifications } from '@/hooks/use-feedback-reply-notifications'
import { getApiErrorMessage } from '@/lib/api-error'
import { createFeedback } from '@/services/feedback'
import {
    createPriceAlert,
    listNotifications,
    listPriceAlerts,
    markNotificationsAsRead,
} from '@/services/notification'
import type { PriceNotificationResponse } from '@/types/notification'
import { findLocationByCep } from '@/services/location'
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
    ChevronLeft,
    ChevronRight,
    CircleDollarSign,
    Filter, List,
    Lock,
    LocateFixed,
    LogOut, MapPin, MessageSquare, Package,
    Plus, Search, ShoppingCart,
    SlidersHorizontal, Star, Store, Tag,
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

const PRODUCT_PAGE_SIZE = 8
const PROXIMITY_PRODUCT_PAGE_SIZE = 120

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

function formatNotificationTime(value: string) {
    const createdAt = new Date(value).getTime()

    if (Number.isNaN(createdAt)) {
        return ''
    }

    const diffMinutes = Math.max(0, Math.round((Date.now() - createdAt) / 60000))

    if (diffMinutes < 1) {
        return 'agora'
    }

    if (diffMinutes < 60) {
        return `${diffMinutes} min`
    }

    const diffHours = Math.round(diffMinutes / 60)

    if (diffHours < 24) {
        return `${diffHours} h`
    }

    const diffDays = Math.round(diffHours / 24)
    return `${diffDays} d`
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

function onlyDigits(value: string) {
    return value.replace(/\D/g, '')
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
    const [maxDistance, setMaxDistance] = useState(5)
    const [maxPrice, setMaxPrice] = useState(100)
    const [isDistanceFilterActive, setIsDistanceFilterActive] = useState(false)
    const [isMaxPriceFilterActive, setIsMaxPriceFilterActive] = useState(false)
    const [sortBy, setSortBy] = useState<SortMode>('lowest-price')
    const [catalogPageNumber, setCatalogPageNumber] = useState(0)
    const [showListPanel, setShowListPanel] = useState(false)
    const [newListOpen, setNewListOpen] = useState(false)
    const [newListName, setNewListName] = useState('')
    const [selectedShoppingListId, setSelectedShoppingListId] = useState<number | null>(null)
    const [listProduct, setListProduct] = useState<TransformedProduct | null>(null)
    const [listQuantity, setListQuantity] = useState(1)
    const [selectedMarketId, setSelectedMarketId] = useState(marketId)
    const [userLatitude, setUserLatitude] = useState<number | null>(null)
    const [userLongitude, setUserLongitude] = useState<number | null>(null)
    const [userCity, setUserCity] = useState('')
    const [userState, setUserState] = useState('')
    const [userZipCode, setUserZipCode] = useState('')
    const [expandedId, setExpandedId] = useState<number | null>(null)
    const [alertProduct, setAlertProduct] = useState<TransformedProduct | null>(null)
    const [desiredPrice, setDesiredPrice] = useState('')
    const [feedbackProduct, setFeedbackProduct] = useState<TransformedProduct | null>(null)
    const [feedbackMarketId, setFeedbackMarketId] = useState<number | null>(null)
    const [feedbackRating, setFeedbackRating] = useState(5)
    const [feedbackComment, setFeedbackComment] = useState('')
    const notifiedBrowserIds = useRef(new Set<number>())
    const shoppingListPanelRef = useRef<HTMLElement | null>(null)
    const pendingShoppingListScroll = useRef(false)

    const isGuest = userRole === 'GUEST'
    const displayName = isGuest ? 'visitante' : userName
    const canUseNotifications = isLogged && userRole === 'USER'
    const hasSavedLocation = Boolean((userZipCode || userCity) && userState)
    const locationLabel = [userCity, userState].filter(Boolean).join(', ') || 'Localidade não informada'

    const userZipCodeDigits = onlyDigits(userZipCode)
    const shouldResolveZipCoordinates = isLogged
        && userRole === 'USER'
        && userLatitude == null
        && userLongitude == null
        && userZipCodeDigits.length === 8

    const nearbyMarketParams = useMemo(() => ({
        latitude: userLatitude ?? undefined,
        longitude: userLongitude ?? undefined,
        city: userCity || undefined,
        state: userState || undefined,
        radiusKm: maxDistance,
    }), [maxDistance, userCity, userLatitude, userLongitude, userState])

    const { data: nearbyMarketResults = [], isLoading: isLoadingMarkets } = useQuery({
        queryKey: ['nearbyMarkets', nearbyMarketParams],
        queryFn: () => listNearbyMarkets(nearbyMarketParams),
    })

    const distanceMarketParams = useMemo(() => ({
        latitude: userLatitude ?? undefined,
        longitude: userLongitude ?? undefined,
        city: userCity || undefined,
        state: userState || undefined,
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

    const { data: zipLocation } = useQuery({
        queryKey: ['userZipLocation', userZipCodeDigits],
        queryFn: () => findLocationByCep(userZipCodeDigits),
        enabled: shouldResolveZipCoordinates,
        retry: false,
    })

    const clientId = userProfile?.id
    const canUseShoppingLists = isLogged && userRole === 'USER' && !!clientId
    const canUseFeedback = canUseShoppingLists
    useFeedbackReplyNotifications(clientId, canUseFeedback)

    const profileImageUrl = isGuest ? '' : userProfile?.profileImageUrl ?? ''
    const [avatarImageFailed, setAvatarImageFailed] = useState(false)
    const showProfileImage = Boolean(profileImageUrl) && !avatarImageFailed

    const deferredSearch = useDeferredValue(searchQuery)
    const catalogQueryPageSize = sortBy === 'distance' ? PROXIMITY_PRODUCT_PAGE_SIZE : PRODUCT_PAGE_SIZE

    const { data: catalogPage, isLoading, isFetching, error } = useQuery({
        queryKey: ['globalMarketProducts', deferredSearch, catalogPageNumber, catalogQueryPageSize],
        queryFn: () => deferredSearch.trim()
            ? searchGeneralProducts({ name: deferredSearch.trim(), page: catalogPageNumber, size: catalogQueryPageSize })
            : listAllMarketProducts({ page: catalogPageNumber, size: catalogQueryPageSize }),
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
        setCatalogPageNumber(0)
        setExpandedId(null)
    }, [catalogQueryPageSize, deferredSearch])

    useEffect(() => {
        setAvatarImageFailed(false)
    }, [profileImageUrl])

    useEffect(() => {
        if (!userProfile) {
            return
        }

        setUserCity(userProfile.city ?? '')
        setUserState(userProfile.state ?? '')
        setUserZipCode(userProfile.zipCode ?? '')

        if (userProfile.latitude != null && userProfile.longitude != null) {
            setUserLatitude(userProfile.latitude)
            setUserLongitude(userProfile.longitude)
        } else {
            setUserLatitude(null)
            setUserLongitude(null)
        }

        if (userProfile.searchRadiusKm != null) {
            setMaxDistance(userProfile.searchRadiusKm)
        }
    }, [userProfile])

    useEffect(() => {
        if (!zipLocation?.hasCoordinates || zipLocation.latitude == null || zipLocation.longitude == null) {
            return
        }

        setUserLatitude(current => current ?? zipLocation.latitude ?? null)
        setUserLongitude(current => current ?? zipLocation.longitude ?? null)
        setUserCity(current => current || zipLocation.city || '')
        setUserState(current => current || zipLocation.state || '')
        setUserZipCode(current => current || zipLocation.zipCode || '')
    }, [zipLocation])

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

    const scrollToShoppingListPanel = useCallback(() => {
        if (typeof window === 'undefined') {
            return
        }

        window.requestAnimationFrame(() => {
            shoppingListPanelRef.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'start',
            })
        })
    }, [])

    const openShoppingListPanel = useCallback(() => {
        pendingShoppingListScroll.current = true
        setShowListPanel(true)

        if (showListPanel) {
            scrollToShoppingListPanel()
        }
    }, [scrollToShoppingListPanel, showListPanel])

    useEffect(() => {
        if (!showListPanel || !pendingShoppingListScroll.current) {
            return
        }

        pendingShoppingListScroll.current = false
        scrollToShoppingListPanel()
    }, [scrollToShoppingListPanel, showListPanel])

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

    const createFeedbackMutation = useMutation({
        mutationFn: () => {
            const trimmedComment = feedbackComment.trim()

            if (!feedbackProduct || !feedbackMarketId || !clientId) {
                throw new Error('Selecione um produto e mercado para avaliar.')
            }

            return createFeedback({
                clientId,
                productId: feedbackProduct.productId,
                marketId: feedbackMarketId,
                vlNota: feedbackRating,
                dsComentario: trimmedComment,
            })
        },
        onSuccess: async () => {
            toast.success('Feedback enviado ao mercado.')
            setFeedbackProduct(null)
            setFeedbackMarketId(null)
            setFeedbackRating(5)
            setFeedbackComment('')
            await queryClient.invalidateQueries({ queryKey: ['feedbacks'] })
            if (feedbackMarketId) {
                await queryClient.invalidateQueries({ queryKey: ['marketFeedbacks', feedbackMarketId] })
            }

            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission()
            }
        },
        onError: (feedbackError: unknown) => {
            toast.error(getApiErrorMessage(feedbackError, 'Não foi possível enviar o feedback.'))
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
            openShoppingListPanel()
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
            openShoppingListPanel()
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

        return Array.from(groupedProducts.values()).flatMap(items => {
            const imageUrl = items.find(({ product }) => product.imageUrl)?.product.imageUrl ?? null
            const marketRows = items.map(({ product, market }) => {
                const distanceKm = market?.distanceKm
                    ?? calculateDistanceKm(
                        userLatitude,
                        userLongitude,
                        market?.latitude ?? product.marketLatitude,
                        market?.longitude ?? product.marketLongitude,
                    )

                return {
                    id: product.id,
                    marketId: product.marketId,
                    name: product.marketName || market?.name || 'Mercado',
                    price: product.price != null ? Number(product.price) : 0,
                    distance: formatDistanceKm(distanceKm),
                    distanceKm,
                }
            }).filter(market => !isDistanceFilterActive || market.distanceKm == null || market.distanceKm <= maxDistance)

            if (marketRows.length === 0) {
                return []
            }

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
            const cheapestMarketRow = [...marketRows].sort((first, second) => first.price - second.price)[0]
            const representativeProduct = items.find(({ product }) => product.id === cheapestMarketRow.id)?.product ?? items[0].product

            return [{
                id: representativeProduct.id,
                productId: representativeProduct.productId,
                name: representativeProduct.productName,
                imageUrl,
                category: representativeProduct.categoryName || 'Sem categoria',
                lowestPrice,
                highestPrice,
                averagePrice,
                savings,
                badge: activeAlertByProductId.has(representativeProduct.id)
                    ? 'Alerta ativo'
                    : marketRows.length > 1
                        ? `${marketRows.length} mercados`
                        : null,
                markets: sortedMarketRows,
            }]
        })
    }, [activeAlertByProductId, catalogPage?.content, distanceMarketResults, isDistanceFilterActive, maxDistance, sortBy, userLatitude, userLongitude])

    const filteredProducts = useMemo(() =>
        transformedProducts
            .filter(p => deferredSearch.length === 0 || p.name.toLowerCase().includes(deferredSearch.toLowerCase()))
            .filter(p => selectedCategory === 'all' || p.category === selectedCategory)
            .filter(p => !isMaxPriceFilterActive || p.lowestPrice <= maxPrice)
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
        [deferredSearch, transformedProducts, selectedCategory, isMaxPriceFilterActive, maxPrice, sortBy]
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
    const currentCatalogPage = catalogPage?.number ?? catalogPageNumber
    const totalCatalogPages = catalogPage?.totalPages ?? 0
    const totalCatalogItems = catalogPage?.totalElements ?? filteredProducts.length
    const hasPreviousCatalogPage = Boolean(catalogPage && !catalogPage.first)
    const hasNextCatalogPage = Boolean(catalogPage && !catalogPage.last)
    const productGridClass = showFilters && showListPanel
        ? 'grid grid-cols-1 items-start gap-4 sm:grid-cols-2'
        : showFilters || showListPanel
            ? 'grid grid-cols-1 items-start gap-4 sm:grid-cols-2 xl:grid-cols-3'
            : 'grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
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

    const goToCatalogPage = useCallback((page: number) => {
        const lastPage = Math.max(totalCatalogPages - 1, 0)
        setCatalogPageNumber(Math.min(Math.max(page, 0), lastPage))
        setExpandedId(null)
    }, [totalCatalogPages])

    const handleCreateAlert = useCallback((product: TransformedProduct) => {
        if (!canUseNotifications) {
            toast.info('Entre como usuário para criar alertas de preço.')
            navigate({ to: '/login' })
            return
        }

        setAlertProduct(product)
        setDesiredPrice(product.lowestPrice > 0 ? product.lowestPrice.toFixed(2) : '')
    }, [canUseNotifications, navigate])

    const handleCreateFeedback = useCallback((product: TransformedProduct) => {
        if (!canUseFeedback) {
            toast.info('Entre como usuário para enviar feedbacks aos mercados.')
            navigate({ to: '/login' })
            return
        }

        if (product.markets.length === 0) {
            toast.info('Este produto ainda não possui mercado disponível para avaliação.')
            return
        }

        setFeedbackProduct(product)
        setFeedbackMarketId(product.markets[0].marketId)
        setFeedbackRating(5)
        setFeedbackComment('')
    }, [canUseFeedback, navigate])

    const submitFeedback = useCallback(() => {
        const trimmedComment = feedbackComment.trim()

        if (!feedbackProduct || !feedbackMarketId) {
            toast.error('Selecione um mercado para avaliar.')
            return
        }

        if (feedbackRating < 1 || feedbackRating > 5) {
            toast.error('Selecione uma nota entre 1 e 5.')
            return
        }

        if (trimmedComment.length < 3) {
            toast.error('Escreva um comentário para o feedback.')
            return
        }

        createFeedbackMutation.mutate()
    }, [createFeedbackMutation, feedbackComment, feedbackMarketId, feedbackProduct, feedbackRating])

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
        openShoppingListPanel()
    }, [canUseShoppingLists, navigate, openShoppingListPanel, shoppingLists])

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

                toast.success('Localização atualizada. Os mercados próximos foram recalculados.')
            },
            () => {
                setUserLatitude(null)
                setUserLongitude(null)

                toast.error(hasSavedLocation
                    ? 'Não foi possível acessar sua localização. A busca usará o CEP salvo.'
                    : 'Não foi possível acessar sua localização. Informe um CEP no perfil para calcular a região.')
            },
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }, [hasSavedLocation])

    const handleOpenMarketsMap = useCallback(() => {
        if (userLatitude == null && userLongitude == null && !hasSavedLocation) {
            toast.error('Informe um CEP no perfil ou autorize a localização para abrir o mapa.')
            return
        }

        const query = userLatitude != null && userLongitude != null
            ? `supermercados perto de ${userLatitude},${userLongitude}`
            : `supermercados perto de ${[userCity, userState].filter(Boolean).join(', ')}`

        window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer')
    }, [hasSavedLocation, userCity, userLatitude, userLongitude, userState])

    const handleOpenMarketMap = useCallback((market: MarketResponse) => {
        window.open(market.googleMapsUrl, '_blank', 'noopener,noreferrer')
    }, [])

    return (
        <div className="app-gradient-bg min-h-screen">

            {/* ── NAVBAR ── */}
            <header className="sticky top-0 z-50 border-b border-border bg-card/95 shadow-sm backdrop-blur">
                <div className="mx-auto max-w-7xl px-4 sm:px-6">
                    <div className="flex min-h-16 items-center gap-3 py-2">
                        <button
                            type="button"
                            onClick={() => navigate({ to: '/dashboard' })}
                            className="flex shrink-0 items-center gap-2.5 rounded-full pr-2 transition hover:opacity-85"
                            aria-label="Ir para o dashboard UniMarket"
                        >
                            <img src={logoImg} alt="UniMarket" className="h-9 w-9 object-contain" />
                            <span className="auth-wordmark hidden text-lg font-semibold text-primary sm:block">UniMarket</span>
                        </button>

                        <div className="relative hidden min-w-0 flex-1 md:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar produtos, marcas, categorias..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="h-10 w-full rounded-full border-primary/20 bg-white/85 pl-9 pr-10 shadow-sm focus-visible:ring-primary dark:bg-white/10"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full text-muted-foreground transition hover:text-foreground"
                                    aria-label="Limpar busca"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <div className="ml-auto flex shrink-0 items-center gap-1.5">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="icon" className="relative rounded-full border-primary/15 bg-white/80 text-muted-foreground hover:border-primary/35 hover:text-primary dark:bg-white/10">
                                        <Bell className="w-5 h-5" />
                                        {unreadCount > 0 && (
                                            <span className="absolute -top-0.5 -right-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-uniyellow px-1 text-[9px] font-bold text-primary shadow-sm ring-1 ring-white">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="mt-2 w-[min(calc(100vw-2rem),24rem)] overflow-hidden rounded-lg border-primary/10 p-0 shadow-lg">
                                    <div className="bg-primary/5 px-4 py-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                                    <Bell className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Central de alertas</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {unreadCount > 0
                                                            ? `${unreadCount} novidade${unreadCount !== 1 ? 's' : ''} de preço`
                                                            : 'Tudo tranquilo por aqui'}
                                                    </p>
                                                </div>
                                            </div>
                                            {unreadCount > 0 && (
                                                <Badge className="rounded-full bg-uniyellow text-primary hover:bg-uniyellow">
                                                    {unreadCount}
                                                </Badge>
                                            )}
                                        </div>
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="mt-3 h-8 w-full justify-center rounded-full bg-background/80 px-3 text-xs cursor-pointer hover:bg-background"
                                                disabled={markAsReadMutation.isPending}
                                                onClick={handleMarkNotificationsAsRead}
                                            >
                                                {markAsReadMutation.isPending ? 'Marcando...' : 'Marcar como lidas'}
                                            </Button>
                                        )}
                                    </div>
                                    {!canUseNotifications ? (
                                        <div className="p-4 text-sm text-muted-foreground">
                                            <div className="rounded-lg border border-dashed border-primary/25 bg-background/70 p-4 text-center">
                                                <Lock className="mx-auto mb-2 h-5 w-5 text-primary" />
                                                Faça login como usuário para receber alertas de preço.
                                            </div>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="p-5 text-center text-sm text-muted-foreground">
                                            <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
                                                <Star className="h-5 w-5" />
                                            </div>
                                            <p className="font-medium text-foreground">Sem alertas novos</p>
                                            <p className="mt-1 text-xs">Quando um preço cair, ele aparece aqui.</p>
                                        </div>
                                    ) : (
                                        <div className="max-h-96 overflow-auto p-2">
                                            {notifications.slice(0, 6).map(notification => (
                                                <DropdownMenuItem
                                                    key={notification.id}
                                                    className="mb-1 items-start gap-3 rounded-lg p-3 cursor-default focus:bg-primary/5"
                                                >
                                                    <span
                                                        className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ${notification.read
                                                            ? 'bg-muted-foreground/25 ring-muted'
                                                            : 'bg-primary ring-primary/10'
                                                            }`}
                                                        aria-hidden="true"
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                                                                {notification.productName}
                                                            </p>
                                                            <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                                                                {formatNotificationTime(notification.createdAt)}
                                                            </span>
                                                        </div>
                                                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                                            {notification.message}
                                                        </p>
                                                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
                                                            <Badge variant="secondary" className="rounded-full">
                                                                R$ {Number(notification.currentPrice).toFixed(2)}
                                                            </Badge>
                                                            <span className="text-muted-foreground">em {notification.marketName}</span>
                                                        </div>
                                                    </div>
                                                </DropdownMenuItem>
                                            ))}
                                        </div>
                                    )}
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate({ to: '/feedbacks' })}
                                className="h-10 rounded-full border-primary/15 bg-white/80 px-3 text-muted-foreground hover:border-primary/35 hover:text-primary dark:bg-white/10"
                                aria-label="Ver feedbacks da comunidade"
                            >
                                <MessageSquare className="h-4 w-4" />

                            </Button>

                            <Button
                                variant="outline" size="icon"
                                onClick={() => {
                                    if (showListPanel) {
                                        setShowListPanel(false)
                                        return
                                    }

                                    openShoppingListPanel()
                                }}
                                className="relative rounded-full border-primary/15 bg-white/80 text-muted-foreground hover:border-primary/35 hover:text-primary dark:bg-white/10"
                                aria-label="Abrir listas de compras"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-primary text-primary-foreground text-[9px] rounded-full flex items-center justify-center">
                                    {totalListItems}
                                </span>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="h-10 rounded-full border-primary/15 bg-white/80 py-1 pl-1.5 pr-2 text-foreground hover:border-primary/35 dark:bg-white/10 sm:pr-3">
                                        <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold text-primary">
                                            {showProfileImage ? (
                                                <img
                                                    src={profileImageUrl}
                                                    alt={displayName}
                                                    referrerPolicy="no-referrer"
                                                    className="h-full w-full object-cover"
                                                    onError={() => setAvatarImageFailed(true)}
                                                />
                                            ) : (
                                                getInitials(displayName)
                                            )}
                                        </div>
                                        <span className="hidden max-w-28 truncate text-sm font-medium lg:inline">
                                            {isGuest ? 'Visitante' : userName}
                                        </span>
                                        <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
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
                                    {canUseShoppingLists && (
                                        <DropdownMenuItem onClick={openShoppingListPanel} className="cursor-pointer">
                                            <List className="w-4 h-4 mr-2" /> Minhas Listas
                                        </DropdownMenuItem>
                                    )}
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

                    <div className="relative pb-3 md:hidden">
                        <Search className="absolute left-3 top-5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar produtos..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="h-10 rounded-full border-primary/20 bg-white/85 pl-9 pr-10 shadow-sm focus-visible:ring-primary dark:bg-white/10"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-3 top-5 -translate-y-1/2 rounded-full text-muted-foreground transition hover:text-foreground"
                                aria-label="Limpar busca"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                <section className="mb-6 overflow-hidden rounded-lg border border-primary/10 bg-card/95 shadow-sm backdrop-blur">
                    <div className="relative p-5 sm:p-6">
                        <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
                        <div className="pointer-events-none absolute bottom-0 right-10 hidden h-20 w-20 rounded-full bg-uniyellow/30 blur-2xl sm:block" />

                        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-3xl">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="secondary" className="gap-1 rounded-full bg-primary/10 text-primary hover:bg-primary/10">
                                        <MapPin className="w-3 h-3" />
                                        {locationLabel}
                                    </Badge>
                                    <Badge variant="outline" className="rounded-full bg-background/70">
                                        {isGuest ? 'Modo exploração' : 'Compra inteligente'}
                                    </Badge>
                                </div>
                                <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    {isGuest ? 'Vamos caçar bons preços?' : `Bora economizar, ${displayName.split(' ')[0] || displayName}?`}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                    {isGuest
                                        ? 'Compare mercados próximos e monte sua rota antes de sair de casa.'
                                        : 'Sua próxima compra pode começar mais leve: compare, salve favoritos e deixe os alertas trabalharem por você.'}
                                </p>
                            </div>

                            <div className="rounded-lg border border-primary/10 bg-background/80 p-4 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                        <CircleDollarSign className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Dica rápida</p>
                                        <p className="mt-0.5 text-sm font-semibold text-foreground">
                                            {activeAlertCount > 0
                                                ? `${activeAlertCount} alerta${activeAlertCount !== 1 ? 's' : ''} monitorando preço`
                                                : 'Crie alertas nos produtos que você compra sempre'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-primary/10 bg-background/55 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                        <div className="flex flex-wrap gap-2">
                            {canUseShoppingLists && (
                                <Button size="sm" onClick={openShoppingListPanel} className="rounded-full">
                                    <ShoppingCart className="w-4 h-4" />
                                    Minhas listas
                                </Button>
                            )}
                            <Button variant="outline" size="sm" onClick={handleOpenProfile} className="rounded-full bg-background/80">
                                <User className="w-4 h-4" />
                                {isGuest ? 'Salvar preferências' : 'Perfil e preferências'}
                            </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={`h-2 w-2 rounded-full ${unreadCount > 0 ? 'bg-uniyellow' : 'bg-green-500'}`} />
                            {unreadCount > 0 ? `${unreadCount} notificação${unreadCount !== 1 ? 'ões' : ''} aguardando leitura` : 'Sem novidades pendentes'}
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
                                        <Package className="w-3 h-3" /> Categoria
                                    </p>
                                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Categoria" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categoryOptions.map(category => (
                                                <SelectItem key={category.id} value={category.id}>
                                                    {category.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                        <MapPin className="w-3 h-3" /> Distância máx.
                                    </p>
                                    <input
                                        type="range" min={1} max={10} value={maxDistance}
                                        onChange={e => {
                                            setMaxDistance(Number(e.target.value))
                                            setIsDistanceFilterActive(true)
                                        }}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>1 km</span>
                                        <span className="text-primary font-medium">
                                            {isDistanceFilterActive ? `${maxDistance} km` : 'Todos'}
                                        </span>
                                        <span>10 km</span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                                        <Tag className="w-3 h-3" /> Preço máximo
                                    </p>
                                    <input
                                        type="range" min={5} max={200} value={maxPrice}
                                        onChange={e => {
                                            setMaxPrice(Number(e.target.value))
                                            setIsMaxPriceFilterActive(true)
                                        }}
                                        className="w-full accent-primary"
                                    />
                                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                        <span>R$ 5</span>
                                        <span className="text-primary font-medium">
                                            {isMaxPriceFilterActive ? `R$ ${maxPrice}` : 'Todos'}
                                        </span>
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
                                    onClick={() => {
                                        setSelectedCategory('all')
                                        setMaxDistance(5)
                                        setMaxPrice(100)
                                        setIsDistanceFilterActive(false)
                                        setIsMaxPriceFilterActive(false)
                                        setSortBy('lowest-price')
                                    }}
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
                                    <span className="font-medium text-foreground">{totalCatalogItems}</span> produtos encontrados
                                    {totalCatalogPages > 1 && (
                                        <span className="ml-2 text-xs">
                                            Página {currentCatalogPage + 1} de {totalCatalogPages}
                                        </span>
                                    )}
                                </span>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm" className="text-xs gap-1.5" disabled={isFetching && !isProductsLoading}>
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
                            <div className={productGridClass}>
                                {Array.from({ length: 6 }).map((_, index) => (
                                    <Card key={index} className="min-h-[480px] gap-0 overflow-hidden p-0">
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
                            <>
                                <div className={productGridClass}>
                                    {filteredProducts.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            isExpanded={expandedId === product.id}
                                            onToggle={toggleExpand}
                                            onAddToList={canUseShoppingLists ? handleAddToList : undefined}
                                            onCreateAlert={handleCreateAlert}
                                            onCreateFeedback={handleCreateFeedback}
                                        />
                                    ))}
                                </div>

                                {totalCatalogPages > 1 && (
                                    <div className="mt-5 flex flex-col gap-3 border-t border-border/70 pt-4 sm:flex-row sm:items-center sm:justify-between">
                                        <p className="text-xs text-muted-foreground">
                                            Página <span className="font-medium text-foreground">{currentCatalogPage + 1}</span> de{' '}
                                            <span className="font-medium text-foreground">{totalCatalogPages}</span>
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => goToCatalogPage(currentCatalogPage - 1)}
                                                disabled={!hasPreviousCatalogPage || isFetching}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                                Anterior
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => goToCatalogPage(currentCatalogPage + 1)}
                                                disabled={!hasNextCatalogPage || isFetching}
                                            >
                                                Próxima
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                    </div>

                    {/*PAINEL DE LISTAS*/}
                    {showListPanel && (
                        <aside ref={shoppingListPanelRef} className="w-full shrink-0 scroll-mt-28 lg:w-80">
                            <Card className="sticky top-32 overflow-hidden border-primary/10 p-0 shadow-sm">
                                <div className="bg-primary/5 p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground shadow-sm">
                                                <ShoppingCart className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <span className="font-semibold text-foreground text-sm">Minhas listas</span>
                                                <p className="text-xs text-muted-foreground">
                                                    {totalListItems > 0 ? `${totalListItems} item${totalListItems !== 1 ? 's' : ''} salvos` : 'Monte sua próxima compra'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => setShowListPanel(false)}
                                            className="rounded-full p-1.5 text-muted-foreground transition hover:bg-background hover:text-foreground"
                                            aria-label="Fechar listas de compras"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-3 p-4">
                                    {!canUseShoppingLists ? (
                                        <div className="rounded-lg border border-dashed border-primary/25 bg-muted/30 p-4 text-center">
                                            <div className="mx-auto mb-3 grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">Listas disponíveis após login</p>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                Entre como usuário para criar listas de compras, salvar produtos e comparar o total.
                                            </p>
                                            <Button size="sm" className="mt-4 w-full text-xs" onClick={() => navigate({ to: '/login' })}>
                                                Fazer login
                                            </Button>
                                        </div>
                                    ) : isLoadingShoppingLists ? (
                                        Array.from({ length: 2 }).map((_, index) => (
                                            <Skeleton key={index} className="h-20 w-full" />
                                        ))
                                    ) : shoppingLists.length === 0 ? (
                                        <div className="rounded-lg border border-dashed border-primary/25 bg-primary/5 p-4 text-center text-sm text-muted-foreground">
                                            <List className="mx-auto mb-2 h-5 w-5 text-primary" />
                                            Nenhuma lista criada ainda.
                                            <span className="mt-1 block text-xs">Comece pela lista da semana ou do mês.</span>
                                        </div>
                                    ) : shoppingLists.map(list => {
                                        const stats = shoppingListStats.get(list.id) ?? { items: 0, total: 0 }
                                        const selected = selectedShoppingListId === list.id

                                        return (
                                            <button
                                                key={list.id}
                                                type="button"
                                                onClick={() => setSelectedShoppingListId(list.id)}
                                                className={`w-full rounded-lg border p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${selected ? 'border-primary bg-primary/10 shadow-sm' : 'border-border bg-background hover:bg-primary/5'}`}
                                            >
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <p className="truncate text-sm font-medium text-foreground">{list.name}</p>
                                                    <Badge variant="secondary" className="rounded-full text-[10px]">{stats.items} itens</Badge>
                                                </div>
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Total estimado</span>
                                                    <span className="font-semibold text-foreground">R$ {stats.total.toFixed(2)}</span>
                                                </div>
                                            </button>
                                        )
                                    })}

                                    {canUseShoppingLists && (
                                        <Button size="sm" className="w-full rounded-full text-xs gap-1.5" onClick={() => setNewListOpen(true)}>
                                            <Plus className="w-3.5 h-3.5" /> Nova lista
                                        </Button>
                                    )}
                                </div>

                                {canUseShoppingLists && selectedShoppingListId && (
                                    <div className="mx-4 rounded-lg border border-border bg-background/80">
                                        <div className="flex items-center justify-between border-b border-border p-3">
                                            <div>
                                                <span className="text-xs font-semibold text-foreground">Itens da lista</span>
                                                <p className="text-[10px] text-muted-foreground">{selectedListItems.length} item{selectedListItems.length !== 1 ? 's' : ''} selecionado{selectedListItems.length !== 1 ? 's' : ''}</p>
                                            </div>
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
                                                <div className="p-4 text-center text-xs text-muted-foreground">
                                                    <Package className="mx-auto mb-2 h-5 w-5 opacity-40" />
                                                    Adicione produtos para comparar o total.
                                                </div>
                                            ) : selectedListItems.map(item => (
                                                <div key={item.id} className="p-3 transition-colors hover:bg-muted/40">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <p className="line-clamp-2 text-xs font-semibold text-foreground">{item.productName}</p>
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
                                                    <p className="mt-2 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                                                        R$ {(Number(item.price) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {canUseShoppingLists && (
                                    <div className="m-4 rounded-lg bg-primary p-4 text-primary-foreground shadow-sm">
                                        <div className="mb-1 flex items-center gap-1.5">
                                            <CircleDollarSign className="w-3.5 h-3.5" />
                                            <span className="text-xs font-semibold">Total selecionado</span>
                                        </div>
                                        <p className="text-2xl font-bold">
                                            R$ {selectedListTotal.toFixed(2)}
                                        </p>
                                        <p className="mt-1 text-[11px] text-primary-foreground/80">
                                            Economia estimada: R$ {totalListSavings.toFixed(2)}
                                        </p>
                                    </div>
                                )}
                            </Card>
                        </aside>
                    )}
                </div>

                <section className="mt-8 border-t border-border pt-6">
                    <div className="rounded-lg border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="font-semibold text-foreground">Supermercados perto de você</h3>
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                                    <MapPin className="h-3 w-3" /> {locationLabel}{userZipCode ? ` - CEP ${userZipCode}` : ''}
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                {isLoadingMarkets && (
                                    <span className="text-xs text-muted-foreground">Atualizando...</span>
                                )}
                                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleUseCurrentLocation}>
                                    <LocateFixed className="h-3.5 w-3.5" /> Usar localização
                                </Button>
                                <Button variant="outline" size="sm" className="text-xs gap-1.5" onClick={handleOpenMarketsMap}>
                                    Ver no mapa <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
                                <Card className="p-5 sm:col-span-2 xl:col-span-3">
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
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className="rounded-lg bg-primary/10 p-2">
                                            <Store className="h-5 w-5 text-primary" />
                                        </div>
                                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${market.open
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-600'
                                            }`}>
                                            {market.open ? 'Aberto' : 'Fechado'}
                                        </span>
                                    </div>
                                    <h4 className="mb-2 text-sm font-medium text-foreground">{market.name}</h4>
                                    {market.address && (
                                        <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">{market.address}</p>
                                    )}
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                        <span className="flex items-center gap-0.5">
                                            <MapPin className="h-3 w-3" /> {market.distance}
                                        </span>
                                        <span className="flex items-center gap-0.5">
                                            <Package className="h-3 w-3" /> {market.productsLabel}
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
                </section>
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

            <Dialog open={!!feedbackProduct} onOpenChange={(open) => !open && setFeedbackProduct(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Enviar feedback</DialogTitle>
                        <DialogDescription>
                            Avalie o produto comprado e escolha o mercado que receberá o comentário.
                        </DialogDescription>
                    </DialogHeader>

                    {feedbackProduct && (
                        <div className="space-y-4">
                            <div className="rounded-lg border border-border p-3">
                                <p className="text-sm font-medium text-foreground">{feedbackProduct.name}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Feedback vinculado ao produto e ao supermercado selecionado.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="feedbackMarket" className="text-xs font-medium text-muted-foreground">
                                    Mercado
                                </label>
                                <Select
                                    value={feedbackMarketId ? String(feedbackMarketId) : undefined}
                                    onValueChange={(value) => setFeedbackMarketId(Number(value))}
                                >
                                    <SelectTrigger id="feedbackMarket">
                                        <SelectValue placeholder="Selecione o mercado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {feedbackProduct.markets.map(market => (
                                            <SelectItem key={market.marketId} value={String(market.marketId)}>
                                                {market.name} - R$ {market.price.toFixed(2)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Nota</p>
                                <div className="flex gap-1">
                                    {Array.from({ length: 5 }).map((_, index) => {
                                        const rating = index + 1
                                        const active = rating <= feedbackRating

                                        return (
                                            <button
                                                key={rating}
                                                type="button"
                                                aria-label={`${rating} estrela${rating === 1 ? '' : 's'}`}
                                                onClick={() => setFeedbackRating(rating)}
                                                className="rounded-md p-1 text-muted-foreground transition hover:bg-muted hover:text-uniyellow"
                                            >
                                                <Star className={`h-6 w-6 ${active ? 'fill-uniyellow text-uniyellow' : ''}`} />
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="feedbackComment" className="text-xs font-medium text-muted-foreground">
                                    Comentário
                                </label>
                                <Textarea
                                    id="feedbackComment"
                                    value={feedbackComment}
                                    onChange={(event) => setFeedbackComment(event.target.value)}
                                    placeholder="Conte como foi sua experiência com o produto"
                                    rows={4}
                                    maxLength={500}
                                    className="resize-none"
                                />
                                <p className="text-right text-[11px] text-muted-foreground">{feedbackComment.length}/500</p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setFeedbackProduct(null)}>
                            Cancelar
                        </Button>
                        <Button onClick={submitFeedback} disabled={createFeedbackMutation.isPending}>
                            {createFeedbackMutation.isPending ? 'Enviando...' : 'Enviar feedback'}
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
