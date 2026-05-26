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
import {
    MAX_PROFILE_IMAGE_FILE_SIZE_BYTES,
    MAX_PROFILE_IMAGE_FILE_SIZE_MB,
    MAX_PROFILE_NAME_LENGTH,
    validateStrongPassword,
} from '@/utils/profile'
import { clearSessionState } from '@/utils/session'
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
    const [profileImageUrl, setProfileImageUrl] = useState('')
    const [profileImageFailed, setProfileImageFailed] = useState(false)
    const [zipCode, setZipCode] = useState('')
    const [streetAddress, setStreetAddress] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [neighborhood, setNeighborhood] = useState('')
    const [latitude, setLatitude] = useState<number | null>(null)
    const [longitude, setLongitude] = useState<number | null>(null)
    const [locationSource, setLocationSource] = useState('')
    const [searchRadius, setSearchRadius] = useState(5)
    const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true)
    const [weeklySummaryEnabled, setWeeklySummaryEnabled] = useState(true)
    const [browserPushEnabled, setBrowserPushEnabled] = useState(false)
    const [showSecurityForm, setShowSecurityForm] = useState(false)
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

    const showProfileImage = Boolean(profileImageUrl) && !profileImageFailed

    useEffect(() => {
        setProfileImageFailed(false)
    }, [profileImageUrl])

    useEffect(() => {
        if (!profile) {
            return
        }

        setName(profile.name)
        setEmail(profile.email)
        setProfileImageUrl(profile.profileImageUrl ?? '')
        setStreetAddress(profile.streetAddress ?? '')
        setNeighborhood(profile.neighborhood ?? '')
        setCity(profile.city ?? '')
        setState(profile.state ?? '')
        setZipCode(profile.zipCode ? formatCep(profile.zipCode) : '')
        setLocationSource(profile.locationSource ?? '')

        if (profile.latitude != null && profile.longitude != null) {
            setLatitude(profile.latitude)
            setLongitude(profile.longitude)
        } else {
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

    function clearPreciseLocation(nextLocationSource = '') {
        setLatitude(null)
        setLongitude(null)
        setLocationSource(nextLocationSource)
    }

    const updateProfileMutation = useMutation({
        mutationFn: (data: UpdateUserProfileRequest) => updateCurrentUserProfile(data),
        onSuccess: async (updatedProfile) => {
            Cookies.set('userName', updatedProfile.name, cookieOptions)
            Cookies.set('userEmail', updatedProfile.email, cookieOptions)
            setName(updatedProfile.name)
            setEmail(updatedProfile.email)
            setProfileImageUrl(updatedProfile.profileImageUrl ?? '')
            setStreetAddress(updatedProfile.streetAddress ?? '')
            setNeighborhood(updatedProfile.neighborhood ?? '')
            setCity(updatedProfile.city ?? '')
            setState(updatedProfile.state ?? '')
            setZipCode(updatedProfile.zipCode ? formatCep(updatedProfile.zipCode) : '')
            setLatitude(updatedProfile.latitude ?? null)
            setLongitude(updatedProfile.longitude ?? null)
            setLocationSource(updatedProfile.locationSource ?? '')
            setSearchRadius(updatedProfile.searchRadiusKm ?? 5)
            setPriceAlertsEnabled(updatedProfile.priceAlertsEnabled ?? true)
            setWeeklySummaryEnabled(updatedProfile.weeklySummaryEnabled ?? true)
            setBrowserPushEnabled(updatedProfile.browserPushEnabled ?? false)
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setShowSecurityForm(false)
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
            clearSessionState()
            queryClient.clear()
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

        if (name.trim().length > MAX_PROFILE_NAME_LENGTH) {
            toast.error(`O nome deve ter no máximo ${MAX_PROFILE_NAME_LENGTH} caracteres.`)
            return
        }

        updateProfileMutation.mutate(buildProfilePayload())
    }

    function handleSaveLocation() {
        if (latitude == null || longitude == null) {
            if (onlyDigits(zipCode).length !== 8 || !city.trim() || state.trim().length !== 2) {
                toast.error('Use sua localização atual ou informe um CEP válido antes de salvar.')
                return
            }
        }

        updateProfileMutation.mutate({
            ...buildProfilePayload(),
            locationSource: locationSource.trim() || 'CEP',
        })
    }

    function handleSaveSecurity() {
        if (!currentPassword) {
            toast.error('Informe sua senha atual para alterar.')
            return
        }

        const passwordError = validateStrongPassword(newPassword)
        if (passwordError) {
            toast.error(passwordError)
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

        if (file.size > MAX_PROFILE_IMAGE_FILE_SIZE_BYTES) {
            toast.error(`A imagem deve ter até ${MAX_PROFILE_IMAGE_FILE_SIZE_MB} MB.`)
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
            () => {
                clearPreciseLocation(hasSavedLocation ? 'CEP' : '')
                toast.error(hasSavedLocation
                    ? 'Não foi possível acessar sua localização. A busca usará o CEP salvo.'
                    : 'Não foi possível acessar sua localização. Informe um CEP para calcular a região.')
            },
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }

    return (
        <div className="app-gradient-bg min-h-screen">
            <header className="sticky top-0 z-40 border-b border-border bg-card/95 shadow-sm backdrop-blur">
                <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
                    <button
                        type="button"
                        onClick={() => navigate({ to: '/dashboard' })}
                        className="flex min-w-0 items-center gap-2.5 rounded-full pr-2 transition hover:opacity-85"
                        aria-label="Ir para o dashboard UniMarket"
                    >
                        <img src={logoImg} alt="UniMarket" className="h-9 w-9 shrink-0 object-contain" />
                        <div className="min-w-0 text-left">
                            <p className="auth-wordmark truncate text-lg font-semibold text-primary">UniMarket</p>
                            <p className="truncate text-xs text-muted-foreground">Conta do cliente</p>
                        </div>
                    </button>

                    <div className="flex shrink-0 items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate({ to: '/dashboard' })}
                            className="h-10 rounded-full border-primary/15 bg-white/80 px-3 text-muted-foreground hover:border-primary/35 hover:text-primary dark:bg-white/10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            <span className="hidden sm:inline">Dashboard</span>
                        </Button>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => logout()}
                            aria-label="Sair"
                            className="rounded-full border-primary/15 bg-white/80 text-muted-foreground hover:border-primary/35 hover:text-primary dark:bg-white/10"
                        >
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
                                {showProfileImage ? (
                                    <img
                                        src={profileImageUrl}
                                        alt={name || 'Perfil'}
                                        referrerPolicy="no-referrer"
                                        className="h-full w-full object-cover"
                                        onError={() => setProfileImageFailed(true)}
                                    />
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
                                                {showProfileImage ? (
                                                    <img
                                                        src={profileImageUrl}
                                                        alt={name || 'Foto do perfil'}
                                                        referrerPolicy="no-referrer"
                                                        className="h-full w-full object-cover"
                                                        onError={() => setProfileImageFailed(true)}
                                                    />
                                                ) : (
                                                    getInitials(name)
                                                )}
                                            </div>
                                            <div className="min-w-0 flex-1 space-y-3">
                                                <div>
                                                    <p className="text-sm font-semibold text-foreground">Foto do perfil</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        Use uma foto ou imagem de até {MAX_PROFILE_IMAGE_FILE_SIZE_MB} MB.
                                                    </p>
                                                </div>
                                                <div className="grid gap-2 sm:grid-cols-[1fr_auto_auto]">
                                                    <Input
                                                        value={profileImageUrl.startsWith('data:') ? 'Imagem enviada do dispositivo' : profileImageUrl}
                                                        onChange={(event) => setProfileImageUrl(event.target.value)}
                                                        placeholder="Digite aqui"
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
                                                    maxLength={MAX_PROFILE_NAME_LENGTH}
                                                    value={name}
                                                    onChange={(event) => setName(event.target.value)}
                                                    placeholder="Digite aqui"
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
                                                    placeholder="Digite aqui"
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
                            <div className="flex flex-col gap-3 border-b border-border bg-muted/20 p-5 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-2">
                                    <KeyRound className="h-5 w-5 text-primary" />
                                    <div>
                                        <h2 className="text-base font-semibold text-foreground">Segurança</h2>
                                        <p className="text-xs text-muted-foreground">
                                            A senha só aparece quando você decide alterá-la.
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    type="button"
                                    variant={showSecurityForm ? 'ghost' : 'outline'}
                                    size="sm"
                                    onClick={() => {
                                        setShowSecurityForm(!showSecurityForm)
                                        setCurrentPassword('')
                                        setNewPassword('')
                                        setConfirmPassword('')
                                    }}
                                >
                                    <KeyRound className="h-4 w-4" />
                                    {showSecurityForm ? 'Cancelar alteração' : 'Mudar senha'}
                                </Button>
                            </div>

                            <div className="space-y-4 p-5">
                                {showSecurityForm ? (
                                    <>
                                        <div className="rounded-lg border border-primary/15 bg-primary/5 p-4">
                                            <p className="text-sm font-semibold text-foreground">Alteração de senha</p>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                Por segurança, confirme sua senha atual antes de definir uma nova.
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
                                                    placeholder="Digite aqui"
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
                                                    placeholder="Digite aqui"
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
                                                    placeholder="Digite aqui"
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
                                    </>
                                ) : (
                                    <div className="rounded-lg border border-border bg-background/70 p-4">
                                        <p className="text-sm font-semibold text-foreground">Senha protegida</p>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Os campos de alteração ficam ocultos para deixar a tela mais limpa e evitar preenchimentos acidentais.
                                        </p>
                                    </div>
                                )}
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
                                            onChange={(event) => {
                                                setZipCode(formatCep(event.target.value))
                                                clearPreciseLocation('')
                                            }}
                                            placeholder="Digite aqui"
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
                                            onChange={(event) => {
                                                setStreetAddress(event.target.value)
                                                clearPreciseLocation(zipCode ? 'CEP' : '')
                                            }}
                                            placeholder="Digite aqui"
                                            className="bg-background/80"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-state">UF</Label>
                                        <Input
                                            id="profile-state"
                                            maxLength={2}
                                            value={state}
                                            onChange={(event) => {
                                                setState(event.target.value.toUpperCase())
                                                clearPreciseLocation(zipCode ? 'CEP' : '')
                                            }}
                                            placeholder="Digite aqui"
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
                                            onChange={(event) => {
                                                setCity(event.target.value)
                                                clearPreciseLocation(zipCode ? 'CEP' : '')
                                            }}
                                            placeholder="Digite aqui"
                                            className="bg-background/80"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-neighborhood">Bairro</Label>
                                        <Input
                                            id="profile-neighborhood"
                                            value={neighborhood}
                                            onChange={(event) => {
                                                setNeighborhood(event.target.value)
                                                clearPreciseLocation(zipCode ? 'CEP' : '')
                                            }}
                                            placeholder="Digite aqui"
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
                                        <Button onClick={handleSaveLocation} disabled={updateProfileMutation.isPending}>
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
                                    <p className="font-medium text-foreground">{[city, state].filter(Boolean).join(', ') || 'Localidade não informada'}</p>
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
