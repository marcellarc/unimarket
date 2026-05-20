import logoImg from '@/assets/logo-unimarket-auth.png'
import {
    Badge, Button, Card,
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
    Input, Label, Switch,
} from '@/components/ui'
import { useLogout } from '@/hooks/use-logout'
import { getApiErrorMessage } from '@/lib/api-error'
import {
    deactivatePriceAlert,
    listNotifications,
    listPriceAlerts,
    markNotificationsAsRead,
} from '@/services/notification'
import { findLocationByCep } from '@/services/location'
import { deleteUserAccount, getCurrentUserProfile, updateCurrentUserProfile } from '@/services/user'
import { listShoppingListItems, listShoppingLists } from '@/services/shopping-list'
import type { PriceNotificationResponse } from '@/types/notification'
import type { ShoppingListItem } from '@/types/shopping-list'
import type { UpdateUserProfileRequest } from '@/types/user'
import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import Cookies from 'js-cookie'
import {
    AlertTriangle,
    ArrowLeft,
    AtSign,
    Bell,
    Calendar,
    CheckCircle2,
    Home,
    ImagePlus,
    KeyRound,
    Loader2,
    LocateFixed,
    LogOut,
    MapPin,
    Navigation,
    Save,
    Search,
    ShieldCheck,
    ShoppingCart,
    SlidersHorizontal,
    Trash2,
    Zap,
} from 'lucide-react'
import type { ComponentType } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

const cookieOptions = {
    expires: 1,
    secure: import.meta.env.PROD,
    sameSite: 'strict' as const,
}

function getStoredBoolean(key: string, fallback: boolean) {
    if (typeof window === 'undefined') {
        return fallback
    }

    const storedValue = window.localStorage.getItem(key)
    return storedValue === null ? fallback : storedValue === 'true'
}

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

function onlyDigits(value: string) {
    return value.replace(/\D/g, '')
}

function formatCep(value: string) {
    const digits = onlyDigits(value).slice(0, 8)
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
}

function getInitials(value: string) {
    return value
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0]?.toUpperCase())
        .join('') || 'U'
}

export function ProfilePage() {
    const navigate = useNavigate()
    const { logout } = useLogout()
    const queryClient = useQueryClient()

    const [name, setName] = useState(Cookies.get('userName') || '')
    const [email, setEmail] = useState(Cookies.get('userEmail') || '')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [profileImageUrl, setProfileImageUrl] = useState(() => getStoredString('unimarket.profile.imageUrl', ''))
    const [zipCode, setZipCode] = useState(() => getStoredString('unimarket.profile.zipCode', ''))
    const [streetAddress, setStreetAddress] = useState(() => getStoredString('unimarket.profile.streetAddress', ''))
    const [city, setCity] = useState(() => getStoredString('unimarket.profile.city', 'Santos'))
    const [state, setState] = useState(() => getStoredString('unimarket.profile.state', 'SP'))
    const [neighborhood, setNeighborhood] = useState(() => getStoredString('unimarket.profile.neighborhood', ''))
    const [latitude, setLatitude] = useState<number | null>(() => getStoredNumber('unimarket.profile.latitude'))
    const [longitude, setLongitude] = useState<number | null>(() => getStoredNumber('unimarket.profile.longitude'))
    const [locationSource, setLocationSource] = useState(() => getStoredString('unimarket.profile.locationSource', ''))
    const [searchRadius, setSearchRadius] = useState(() => Number(getStoredString('unimarket.profile.radius', '5')))
    const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(() =>
        getStoredBoolean('unimarket.priceAlertsEnabled', true),
    )
    const [weeklySummaryEnabled, setWeeklySummaryEnabled] = useState(() =>
        getStoredBoolean('unimarket.weeklySummaryEnabled', true),
    )
    const [browserPushEnabled, setBrowserPushEnabled] = useState(() =>
        getStoredBoolean('unimarket.browserPushEnabled', false),
    )
    const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)

    const { data: profile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['userProfile'],
        queryFn: getCurrentUserProfile,
    })

    const { data: priceAlerts = [] } = useQuery({
        queryKey: ['priceAlerts'],
        queryFn: listPriceAlerts,
    })

    const { data: notifications = [] } = useQuery({
        queryKey: ['notifications'],
        queryFn: listNotifications,
    })

    const clientId = profile?.id

    const { data: shoppingLists = [], isLoading: isShoppingListsLoading } = useQuery({
        queryKey: ['shoppingLists', clientId],
        queryFn: () => listShoppingLists(clientId!),
        enabled: !!clientId,
    })

    const shoppingListItemQueries = useQueries({
        queries: shoppingLists.map(list => ({
            queryKey: ['shoppingListItems', list.id],
            queryFn: () => listShoppingListItems(list.id),
            enabled: !!clientId,
        })),
    })

    const unreadNotifications = notifications.filter(notification => !notification.read).length
    const activeAlerts = priceAlerts.filter(alert => alert.active)
    const isShoppingSummaryLoading = isShoppingListsLoading || shoppingListItemQueries.some(query => query.isLoading)
    const shoppingSummary = useMemo(() => {
        const allItems = shoppingListItemQueries.flatMap(query => (query.data ?? []) as ShoppingListItem[])
        const items = allItems.reduce((sum, item) => sum + item.quantity, 0)
        const total = allItems.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0)

        return {
            lists: shoppingLists.length,
            items,
            total,
        }
    }, [shoppingListItemQueries, shoppingLists.length])
    const hasSavedLocation = Boolean(zipCode && city && state)
    const locationStatus = latitude != null && longitude != null
        ? 'Localidade precisa ativa para ordenar mercados por distância.'
        : hasSavedLocation
            ? 'Localidade pronta. A busca usará seu CEP, cidade e UF.'
            : 'Informe seu CEP para ativar a busca por supermercados próximos.'

    const profileScore = useMemo(() => {
        const filledFields = [name, email, profileImageUrl, zipCode, city, state, neighborhood].filter(Boolean).length
        const enabledPreferences = [priceAlertsEnabled, weeklySummaryEnabled, browserPushEnabled].filter(Boolean).length
        return Math.min(100, Math.round(((filledFields + enabledPreferences) / 10) * 100))
    }, [browserPushEnabled, city, email, name, neighborhood, priceAlertsEnabled, profileImageUrl, state, weeklySummaryEnabled, zipCode])

    useEffect(() => {
        if (!profile) {
            return
        }

        setName(profile.name)
        setEmail(profile.email)
        setProfileImageUrl(profile.profileImageUrl ?? getStoredString('unimarket.profile.imageUrl', ''))
        setStreetAddress(profile.streetAddress ?? getStoredString('unimarket.profile.streetAddress', ''))
        setNeighborhood(profile.neighborhood ?? getStoredString('unimarket.profile.neighborhood', ''))
        setCity(profile.city ?? getStoredString('unimarket.profile.city', 'Santos'))
        setState(profile.state ?? getStoredString('unimarket.profile.state', 'SP'))
        setZipCode(profile.zipCode ? formatCep(profile.zipCode) : getStoredString('unimarket.profile.zipCode', ''))
        setLocationSource(profile.locationSource ?? getStoredString('unimarket.profile.locationSource', ''))

        if (profile.latitude != null && profile.longitude != null) {
            setLatitude(profile.latitude)
            setLongitude(profile.longitude)
        } else if (profile.zipCode || profile.city || profile.neighborhood) {
            setLatitude(null)
            setLongitude(null)
        }

        if (profile.searchRadiusKm != null) {
            setSearchRadius(profile.searchRadiusKm)
        }

        setPriceAlertsEnabled(profile.priceAlertsEnabled ?? true)
        setWeeklySummaryEnabled(profile.weeklySummaryEnabled ?? true)
        setBrowserPushEnabled(profile.browserPushEnabled ?? false)

        Cookies.set('userName', profile.name, cookieOptions)
        Cookies.set('userEmail', profile.email, cookieOptions)
    }, [profile])

    function persistProfileLocally(updatedProfile: {
        profileImageUrl?: string | null
        zipCode?: string | null
        streetAddress?: string | null
        city?: string | null
        state?: string | null
        neighborhood?: string | null
        latitude?: number | null
        longitude?: number | null
        locationSource?: string | null
        searchRadiusKm?: number | null
        priceAlertsEnabled?: boolean | null
        weeklySummaryEnabled?: boolean | null
        browserPushEnabled?: boolean | null
    } = {
        profileImageUrl,
        zipCode,
        streetAddress,
        city,
        state,
        neighborhood,
        latitude,
        longitude,
        locationSource,
        searchRadiusKm: searchRadius,
        priceAlertsEnabled,
        weeklySummaryEnabled,
        browserPushEnabled,
    }) {
        if (typeof window === 'undefined') {
            return
        }

        window.localStorage.setItem('unimarket.profile.zipCode', formatCep(updatedProfile.zipCode ?? ''))
        window.localStorage.setItem('unimarket.profile.streetAddress', updatedProfile.streetAddress ?? '')
        window.localStorage.setItem('unimarket.profile.city', updatedProfile.city ?? '')
        window.localStorage.setItem('unimarket.profile.state', updatedProfile.state ?? '')
        window.localStorage.setItem('unimarket.profile.neighborhood', updatedProfile.neighborhood ?? '')
        window.localStorage.setItem('unimarket.profile.imageUrl', updatedProfile.profileImageUrl ?? '')
        if (updatedProfile.latitude != null && updatedProfile.longitude != null) {
            window.localStorage.setItem('unimarket.profile.latitude', String(updatedProfile.latitude))
            window.localStorage.setItem('unimarket.profile.longitude', String(updatedProfile.longitude))
        } else {
            window.localStorage.removeItem('unimarket.profile.latitude')
            window.localStorage.removeItem('unimarket.profile.longitude')
        }

        window.localStorage.setItem('unimarket.profile.locationSource', updatedProfile.locationSource ?? '')
        window.localStorage.setItem('unimarket.profile.radius', String(updatedProfile.searchRadiusKm ?? searchRadius))
        window.localStorage.setItem('unimarket.priceAlertsEnabled', String(updatedProfile.priceAlertsEnabled ?? true))
        window.localStorage.setItem('unimarket.weeklySummaryEnabled', String(updatedProfile.weeklySummaryEnabled ?? true))
        window.localStorage.setItem('unimarket.browserPushEnabled', String(updatedProfile.browserPushEnabled ?? false))
    }

    function buildProfilePayload(): UpdateUserProfileRequest {
        return {
            name: name.trim(),
            email: email.trim(),
            profileImageUrl: profileImageUrl.trim(),
            zipCode: onlyDigits(zipCode) || undefined,
            streetAddress: streetAddress.trim(),
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: state.trim().toUpperCase(),
            latitude: latitude ?? undefined,
            longitude: longitude ?? undefined,
            locationSource: locationSource.trim() || undefined,
            searchRadiusKm: searchRadius,
            priceAlertsEnabled,
            weeklySummaryEnabled,
            browserPushEnabled,
        }
    }

    const updateProfileMutation = useMutation({
        mutationFn: (data: UpdateUserProfileRequest) => updateCurrentUserProfile(data),
        onSuccess: async (updatedProfile) => {
            Cookies.set('userName', updatedProfile.name, cookieOptions)
            Cookies.set('userEmail', updatedProfile.email, cookieOptions)
            setProfileImageUrl(updatedProfile.profileImageUrl ?? '')
            setPriceAlertsEnabled(updatedProfile.priceAlertsEnabled ?? true)
            setWeeklySummaryEnabled(updatedProfile.weeklySummaryEnabled ?? true)
            setBrowserPushEnabled(updatedProfile.browserPushEnabled ?? false)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            persistProfileLocally(updatedProfile)
            toast.success('Perfil atualizado')
            await queryClient.invalidateQueries({ queryKey: ['userProfile'] })
            await queryClient.invalidateQueries({ queryKey: ['nearbyMarkets'] })
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error, 'Não foi possível atualizar o perfil.'))
        },
    })

    const lookupCepMutation = useMutation({
        mutationFn: () => findLocationByCep(zipCode),
        onSuccess: (location) => {
            setZipCode(formatCep(location.zipCode))
            setStreetAddress(location.streetAddress ?? '')
            setNeighborhood(location.neighborhood ?? '')
            setCity(location.city ?? '')
            setState(location.state ?? '')
            setLatitude(location.latitude ?? null)
            setLongitude(location.longitude ?? null)
            setLocationSource(location.source ?? 'BRASIL_API_CEP')

            if (location.hasCoordinates) {
                toast.success('Endereço encontrado. A busca por mercados próximos foi refinada.')
                return
            }

            toast.success('Endereço encontrado. A busca usará cidade e UF quando não houver coordenadas.')
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error, 'Não foi possível localizar este CEP.'))
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
            toast.error('Não foi possível marcar as notificações como lidas.')
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    })

    const deactivateAlertMutation = useMutation({
        mutationFn: deactivatePriceAlert,
        onSuccess: async () => {
            toast.success('Alerta desativado')
            await queryClient.invalidateQueries({ queryKey: ['priceAlerts'] })
        },
        onError: () => toast.error('Não foi possível desativar o alerta.'),
    })

    const deleteAccountMutation = useMutation({
        mutationFn: () => deleteUserAccount(profile!.id),
        onSuccess: () => {
            Cookies.remove('accessToken')
            Cookies.remove('refreshToken')
            Cookies.remove('userName')
            Cookies.remove('userEmail')
            Cookies.remove('userRole')
            toast.success('Conta excluída com sucesso.')
            navigate({ to: '/login' })
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error, 'Não foi possível excluir a conta.'))
        },
    })

    function handleSaveProfile() {
        if (name.trim().length < 2 || email.trim().length === 0) {
            toast.error('Informe um nome e um e-mail válidos.')
            return
        }

        updateProfileMutation.mutate(buildProfilePayload())
    }

    function handleSaveSecurity() {
        if (!currentPassword) {
            toast.error('Informe sua senha atual para alterar.')
            return
        }

        if (newPassword.length < 6) {
            toast.error('A nova senha deve ter pelo menos 6 caracteres.')
            return
        }

        if (newPassword !== confirmPassword) {
            toast.error('A confirmação de senha não confere.')
            return
        }

        updateProfileMutation.mutate({
            currentPassword: currentPassword.trim(),
            password: newPassword.trim(),
        })
    }

    function handleProfileImageFile(file?: File) {
        if (!file) {
            return
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Escolha um arquivo de imagem.')
            return
        }

        if (file.size > 1_500_000) {
            toast.error('A imagem deve ter até 1,5 MB.')
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                setProfileImageUrl(reader.result)
            }
        }
        reader.readAsDataURL(file)
    }

    function handleLookupCep() {
        if (onlyDigits(zipCode).length !== 8) {
            toast.error('Informe um CEP com 8 dígitos.')
            return
        }

        lookupCepMutation.mutate()
    }

    async function handleBrowserPushChange(checked: boolean) {
        if (checked && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
            const permission = await Notification.requestPermission()
            setBrowserPushEnabled(permission === 'granted')
            return
        }

        setBrowserPushEnabled(checked)
    }

    function handleUseCurrentLocation() {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            toast.error('Localização indisponível neste navegador.')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude)
                setLongitude(position.coords.longitude)
                setLocationSource('BROWSER_GEOLOCATION')
                toast.success('Localização autorizada. A busca por mercados próximos foi refinada.')
            },
            () => toast.error('Não foi possível acessar sua localização. Use o CEP como alternativa.'),
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }

    return (
        <div className="app-gradient-bg min-h-screen">
            <header className="sticky top-0 z-40 border-b border-border bg-card/95 shadow-sm backdrop-blur">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <img src={logoImg} alt="UniMarket" className="h-8 w-8 object-contain" />
                        <div>
                            <p className="text-sm font-semibold text-foreground">UniMarket</p>
                            <p className="text-xs text-muted-foreground">Conta do cliente</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigate({ to: '/dashboard' })}>
                            <ArrowLeft className="h-4 w-4" />
                            Dashboard
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => logout()} aria-label="Sair">
                            <LogOut className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
                <section className="mb-6 rounded-lg border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/15 bg-primary/10 text-lg font-semibold text-primary">
                                {profileImageUrl ? (
                                    <img src={profileImageUrl} alt={name || 'Perfil'} className="h-full w-full object-cover" />
                                ) : (
                                    getInitials(name)
                                )}
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">{name || 'Meu perfil'}</h1>
                                    <Badge variant="secondary" className="gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Cliente
                                    </Badge>
                                </div>
                                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                                    Mantenha sua localidade atualizada para encontrar supermercados próximos e comparar preços com mais precisão.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <MetricTile label="completo" value={`${profileScore}%`} tone="primary" />
                            <MetricTile label="alertas" value={String(activeAlerts.length)} />
                            <MetricTile label="novas" value={String(unreadNotifications)} />
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <Card className="gap-0 overflow-hidden bg-card/95 p-0 shadow-sm backdrop-blur">
                            <div className="border-b border-border bg-muted/20 p-5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    <div>
                                        <h2 className="text-base font-semibold text-foreground">Dados da conta</h2>
                                        <p className="text-xs text-muted-foreground">Identificação usada para login e personalização.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                {isProfileLoading ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-4">
                                            <div className="h-16 w-16 animate-pulse rounded-lg bg-muted" />
                                            <div className="flex-1 space-y-2">
                                                <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                                                <div className="h-3 w-64 animate-pulse rounded bg-muted" />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="h-10 animate-pulse rounded bg-muted" />
                                            <div className="h-10 animate-pulse rounded bg-muted" />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4 sm:flex-row sm:items-center">
                                            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-primary/15 bg-primary/10 text-xl font-semibold text-primary">
                                                {profileImageUrl ? (
                                                    <img src={profileImageUrl} alt={name || 'Foto do perfil'} className="h-full w-full object-cover" />
                                                ) : (
                                                    getInitials(name)
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Foto do perfil</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Use uma foto ou imagem que ajude a reconhecer sua conta.
                                                    </p>
                                                </div>
                                                <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                                                    <Input
                                                        value={profileImageUrl.startsWith('data:') ? 'Imagem enviada do dispositivo' : profileImageUrl}
                                                        onChange={(event) => setProfileImageUrl(event.target.value)}
                                                        placeholder="URL da imagem"
                                                        disabled={profileImageUrl.startsWith('data:')}
                                                        className="bg-background/80"
                                                    />
                                                    <Button variant="outline" asChild>
                                                        <label>
                                                            <ImagePlus className="h-4 w-4" />
                                                            Enviar foto
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                className="sr-only"
                                                                onChange={(event) => handleProfileImageFile(event.target.files?.[0])}
                                                            />
                                                        </label>
                                                    </Button>
                                                    {profileImageUrl && (
                                                        <Button variant="ghost" type="button" onClick={() => setProfileImageUrl('')}>
                                                            Remover
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="profile-name">Nome</Label>
                                                    <Input
                                                    id="profile-name"
                                                    maxLength={80}
                                                    value={name}
                                                    onChange={(event) => setName(event.target.value)}
                                                    className="bg-background/80"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="profile-email" className="flex items-center gap-1.5">
                                                    <AtSign className="h-3.5 w-3.5" />
                                                    E-mail
                                                </Label>
                                                    <Input
                                                    id="profile-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(event) => setEmail(event.target.value)}
                                                    className="bg-background/80"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                                <span className="inline-flex items-center gap-1.5">
                                                    <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                                    Conta verificada
                                                </span>
                                                {profile?.createdAt && (
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <Calendar className="h-3.5 w-3.5" />
                                                        Desde {new Date(profile.createdAt).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                            <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                                                {updateProfileMutation.isPending ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Salvando...
                                                    </>
                                                ) : (
                                                    <>
                                                        <Save className="h-4 w-4" />
                                                        Salvar dados
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>

                        <Card className="gap-0 overflow-hidden bg-card/95 p-0 shadow-sm backdrop-blur">
                            <div className="border-b border-border bg-muted/20 p-5">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="h-5 w-5 text-primary" />
                                    <div>
                                        <h2 className="text-base font-semibold text-foreground">Segurança</h2>
                                        <p className="text-xs text-muted-foreground">Atualize sua senha quando necessário.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="rounded-lg border border-border bg-background/70 p-4">
                                    <p className="text-sm font-semibold text-foreground">Alteração de senha</p>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Por segurança, confirme sua senha atual antes de definir uma nova. Deixe estes campos em branco se não quiser alterar a senha.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="current-password">Senha atual</Label>
                                        <Input
                                            id="current-password"
                                            type="password"
                                            value={currentPassword}
                                            onChange={(event) => setCurrentPassword(event.target.value)}
                                            autoComplete="current-password"
                                            className="bg-background/80"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="new-password">Nova senha</Label>
                                        <Input
                                            id="new-password"
                                            type="password"
                                            value={newPassword}
                                            onChange={(event) => setNewPassword(event.target.value)}
                                            autoComplete="new-password"
                                            className="bg-background/80"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirm-password">Confirmar nova senha</Label>
                                        <Input
                                            id="confirm-password"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(event) => setConfirmPassword(event.target.value)}
                                            autoComplete="new-password"
                                            className="bg-background/80"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end border-t border-border pt-4">
                                    <Button onClick={handleSaveSecurity} disabled={updateProfileMutation.isPending}>
                                        {updateProfileMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Salvar segurança
                                    </Button>
                                </div>
                            </div>
                        </Card>

                        <Card className="gap-0 overflow-hidden bg-card/95 p-0 shadow-sm backdrop-blur">
                            <div className="border-b border-border bg-muted/20 p-5">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-primary" />
                                    <div>
                                        <h2 className="text-base font-semibold text-foreground">Notificações</h2>
                                        <p className="text-xs text-muted-foreground">Controle alertas de preço e avisos da conta.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-5 p-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <PreferenceSwitch
                                        checked={priceAlertsEnabled}
                                        description="Avisos quando produtos atingirem o preço desejado."
                                        label="Alertas de preço"
                                        onCheckedChange={setPriceAlertsEnabled}
                                    />
                                    <PreferenceSwitch
                                        checked={browserPushEnabled}
                                        description="Notificações do navegador para alertas importantes."
                                        label="Push no navegador"
                                        onCheckedChange={handleBrowserPushChange}
                                    />
                                    <PreferenceSwitch
                                        checked={weeklySummaryEnabled}
                                        description="Resumo com economia, listas e oportunidades."
                                        label="Resumo semanal"
                                        onCheckedChange={setWeeklySummaryEnabled}
                                    />
                                </div>

                                <div className="flex justify-end border-t border-border pt-4">
                                    <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                                        {updateProfileMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Salvar preferências
                                    </Button>
                                </div>

                                <div className="overflow-hidden rounded-lg border border-border bg-background/60">
                                    <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/20 p-4">
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground">Alertas ativos</h3>
                                            <p className="text-xs text-muted-foreground">{activeAlerts.length} produto{activeAlerts.length !== 1 ? 's' : ''} monitorado{activeAlerts.length !== 1 ? 's' : ''}.</p>
                                        </div>
                                        {unreadNotifications > 0 && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => markAsReadMutation.mutate()}
                                                disabled={markAsReadMutation.isPending}
                                            >
                                                Marcar lidas
                                            </Button>
                                        )}
                                    </div>

                                    <div className="divide-y divide-border">
                                        {activeAlerts.length === 0 ? (
                                            <div className="p-4 text-sm text-muted-foreground">
                                                Nenhum alerta ativo por enquanto.
                                            </div>
                                        ) : (
                                            activeAlerts.slice(0, 5).map(alert => (
                                                <div key={alert.id} className="flex items-center justify-between gap-4 p-4">
                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-foreground">{alert.productName}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {alert.marketName} · alvo R$ {Number(alert.desiredPrice).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => deactivateAlertMutation.mutate(alert.id)}
                                                        disabled={deactivateAlertMutation.isPending}
                                                        aria-label={`Desativar alerta de ${alert.productName}`}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card className="gap-0 overflow-hidden bg-card/95 p-0 shadow-sm backdrop-blur">
                            <div className="border-b border-border bg-muted/20 p-5">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <div>
                                        <h2 className="text-base font-semibold text-foreground">Localidade de compra</h2>
                                        <p className="text-xs text-muted-foreground">Define mercados próximos e distância exibida nos produtos.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-background/70 p-4 sm:grid-cols-[1fr_auto] sm:items-end">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-cep">CEP de referência</Label>
                                        <Input
                                            id="profile-cep"
                                            inputMode="numeric"
                                            value={formatCep(zipCode)}
                                            onChange={(event) => setZipCode(formatCep(event.target.value))}
                                            placeholder="00000-000"
                                            className="bg-background/80"
                                        />
                                    </div>
                                    <Button
                                        variant="outline"
                                        onClick={handleLookupCep}
                                        disabled={lookupCepMutation.isPending}
                                    >
                                        {lookupCepMutation.isPending ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Search className="h-4 w-4" />
                                        )}
                                        Buscar CEP
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_96px]">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-street">Endereço</Label>
                                        <Input
                                            id="profile-street"
                                            value={streetAddress}
                                            onChange={(event) => setStreetAddress(event.target.value)}
                                            placeholder="Rua, avenida ou ponto de referência"
                                            className="bg-background/80"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-state">UF</Label>
                                        <Input
                                            id="profile-state"
                                            maxLength={2}
                                            value={state}
                                            onChange={(event) => setState(event.target.value.toUpperCase())}
                                            placeholder="SP"
                                            className="bg-background/80"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-city">Cidade</Label>
                                        <Input
                                            id="profile-city"
                                            value={city}
                                            onChange={(event) => setCity(event.target.value)}
                                            className="bg-background/80"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-neighborhood">Bairro</Label>
                                        <Input
                                            id="profile-neighborhood"
                                            value={neighborhood}
                                            onChange={(event) => setNeighborhood(event.target.value)}
                                            placeholder="Ex.: Gonzaga"
                                            className="bg-background/80"
                                        />
                                    </div>
                                </div>

                                <div className="rounded-lg border border-border bg-background/70 p-4">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="profile-radius">Raio de busca</Label>
                                        <span className="text-sm font-medium text-primary">{searchRadius} km</span>
                                    </div>
                                    <input
                                        id="profile-radius"
                                        type="range"
                                        min={1}
                                        max={15}
                                        value={searchRadius}
                                        onChange={(event) => setSearchRadius(Number(event.target.value))}
                                        className="mt-3 w-full accent-primary"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 rounded-lg border border-primary/15 bg-primary/5 p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Busca por proximidade</p>
                                        <p className="text-xs text-muted-foreground">
                                            {locationStatus}
                                        </p>
                                    </div>
                                    <div className="flex flex-col gap-2 sm:flex-row">
                                        <Button variant="outline" onClick={handleUseCurrentLocation}>
                                            <LocateFixed className="h-4 w-4" />
                                            Usar localização atual
                                        </Button>
                                        <Button onClick={handleSaveProfile} disabled={updateProfileMutation.isPending}>
                                            {updateProfileMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Salvar localidade
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
                        <Card className="gap-4 bg-card/95 p-5 shadow-sm backdrop-blur">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">Resumo UniMarket</h2>
                                    <p className="text-xs text-muted-foreground">Atividade da conta</p>
                                </div>
                                <Zap className="h-5 w-5 text-primary" />
                            </div>

                            <div className="space-y-3">
                                <SummaryRow icon={ShoppingCart} label="Itens em listas" value={isShoppingSummaryLoading ? '...' : String(shoppingSummary.items)} />
                                <SummaryRow icon={Home} label="Listas criadas" value={isShoppingSummaryLoading ? '...' : String(shoppingSummary.lists)} />
                                <SummaryRow icon={Zap} label="Total em listas" value={isShoppingSummaryLoading ? '...' : `R$ ${shoppingSummary.total.toFixed(2)}`} />
                                <SummaryRow icon={Bell} label="Alertas ativos" value={String(activeAlerts.length)} />
                                <SummaryRow icon={Bell} label="Notificações novas" value={String(unreadNotifications)} />
                            </div>
                        </Card>

                        <Card className="gap-4 bg-card/95 p-5 shadow-sm backdrop-blur">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="h-5 w-5 text-primary" />
                                <h2 className="text-base font-semibold text-foreground">Preferências aplicadas</h2>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="rounded-lg border border-border bg-background/70 p-3">
                                    <p className="font-medium text-foreground">{city}{state ? `, ${state}` : ''}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {neighborhood || 'Bairro não informado'} - {zipCode ? formatCep(zipCode) : 'CEP não informado'} - até {searchRadius} km
                                    </p>
                                </div>
                                <div className="rounded-lg border border-border bg-background/70 p-3">
                                    <p className="font-medium text-foreground">
                                        {priceAlertsEnabled ? 'Alertas ativos' : 'Alertas pausados'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {weeklySummaryEnabled ? 'Resumo semanal ligado' : 'Resumo semanal desligado'}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card className="gap-4 border-destructive/30 bg-card/95 p-5 shadow-sm backdrop-blur">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                <h2 className="text-base font-semibold text-foreground">Excluir conta</h2>
                            </div>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Remove seu cadastro de cliente e encerra o acesso a listas, alertas e preferências salvas.
                            </p>
                            <Button variant="destructive" onClick={() => setDeleteAccountOpen(true)} disabled={!profile}>
                                <Trash2 className="h-4 w-4" />
                                Excluir minha conta
                            </Button>
                        </Card>

                        <Button className="w-full" onClick={() => navigate({ to: '/dashboard' })}>
                            <Navigation className="h-4 w-4" />
                            Voltar para comparar preços
                        </Button>
                    </aside>
                </div>
            </main>

            <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Excluir conta?</DialogTitle>
                        <DialogDescription>
                            Esta ação remove sua conta de cliente. Para continuar, confirme que deseja encerrar o acesso ao UniMarket.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteAccountOpen(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteAccountMutation.mutate()}
                            disabled={deleteAccountMutation.isPending || !profile}
                        >
                            {deleteAccountMutation.isPending ? 'Excluindo...' : 'Excluir conta'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}

interface PreferenceSwitchProps {
    checked: boolean
    description: string
    label: string
    onCheckedChange: (checked: boolean) => void
}

function MetricTile({
    label,
    value,
    tone = 'default',
}: {
    label: string
    value: string
    tone?: 'default' | 'primary'
}) {
    return (
        <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
            <p className={`text-lg font-semibold tabular-nums ${tone === 'primary' ? 'text-primary' : 'text-foreground'}`}>{value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
        </div>
    )
}

function PreferenceSwitch({ checked, description, label, onCheckedChange }: PreferenceSwitchProps) {
    return (
        <div className="rounded-lg border border-border bg-background/70 p-4 transition-colors hover:bg-background">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
                </div>
                <Switch checked={checked} onCheckedChange={onCheckedChange} />
            </div>
        </div>
    )
}

interface SummaryRowProps {
    icon: ComponentType<{ className?: string }>
    label: string
    value: string
}

function SummaryRow({ icon: Icon, label, value }: SummaryRowProps) {
    return (
        <div className="flex items-center justify-between rounded-lg border border-border bg-background/70 p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {label}
            </div>
            <span className="text-sm font-semibold tabular-nums text-foreground">{value}</span>
        </div>
    )
}
