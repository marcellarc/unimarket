import logoImg from '@/assets/logo-unimarket.png'
import { Badge, Button, Card, Input, Label, Switch } from '@/components/ui'
import { useLogout } from '@/hooks/use-logout'
import {
    deactivatePriceAlert,
    listNotifications,
    listPriceAlerts,
    markNotificationsAsRead,
} from '@/services/notification'
import { getCurrentUserProfile, updateCurrentUserProfile } from '@/services/user'
import type { PriceNotificationResponse } from '@/types/notification'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import Cookies from 'js-cookie'
import {
    ArrowLeft,
    AtSign,
    Bell,
    Calendar,
    CheckCircle2,
    Home,
    Loader2,
    LocateFixed,
    LogOut,
    MapPin,
    Navigation,
    Save,
    ShieldCheck,
    ShoppingCart,
    SlidersHorizontal,
    Trash2,
    User,
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

const shoppingSummary = {
    lists: 2,
    items: 20,
    savings: 57.50,
}

export function ProfilePage() {
    const navigate = useNavigate()
    const { logout } = useLogout()
    const queryClient = useQueryClient()

    const [name, setName] = useState(Cookies.get('userName') || '')
    const [email, setEmail] = useState(Cookies.get('userEmail') || '')
    const [password, setPassword] = useState('')
    const [city, setCity] = useState(() => getStoredString('unimarket.profile.city', 'Santos, SP'))
    const [neighborhood, setNeighborhood] = useState(() => getStoredString('unimarket.profile.neighborhood', ''))
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

    const unreadNotifications = notifications.filter(notification => !notification.read).length
    const activeAlerts = priceAlerts.filter(alert => alert.active)

    const profileScore = useMemo(() => {
        const filledFields = [name, email, city, neighborhood].filter(Boolean).length
        const enabledPreferences = [priceAlertsEnabled, weeklySummaryEnabled, browserPushEnabled].filter(Boolean).length
        return Math.min(100, Math.round(((filledFields + enabledPreferences) / 7) * 100))
    }, [browserPushEnabled, city, email, name, neighborhood, priceAlertsEnabled, weeklySummaryEnabled])

    useEffect(() => {
        if (!profile) {
            return
        }

        setName(profile.name)
        setEmail(profile.email)
        Cookies.set('userName', profile.name, cookieOptions)
        Cookies.set('userEmail', profile.email, cookieOptions)
    }, [profile])

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        window.localStorage.setItem('unimarket.profile.city', city)
        window.localStorage.setItem('unimarket.profile.neighborhood', neighborhood)
        window.localStorage.setItem('unimarket.profile.radius', String(searchRadius))
        window.localStorage.setItem('unimarket.priceAlertsEnabled', String(priceAlertsEnabled))
        window.localStorage.setItem('unimarket.weeklySummaryEnabled', String(weeklySummaryEnabled))
        window.localStorage.setItem('unimarket.browserPushEnabled', String(browserPushEnabled))
    }, [browserPushEnabled, city, neighborhood, priceAlertsEnabled, searchRadius, weeklySummaryEnabled])

    const updateProfileMutation = useMutation({
        mutationFn: () => updateCurrentUserProfile({
            name: name.trim(),
            email: email.trim(),
            password: password.trim() || undefined,
        }),
        onSuccess: async (updatedProfile) => {
            Cookies.set('userName', updatedProfile.name, cookieOptions)
            Cookies.set('userEmail', updatedProfile.email, cookieOptions)
            setPassword('')
            toast.success('Perfil atualizado')
            await queryClient.invalidateQueries({ queryKey: ['userProfile'] })
        },
        onError: (error: any) => {
            const responseData = error.response?.data
            const errorMessage =
                typeof responseData === 'string'
                    ? responseData
                    : responseData?.message ?? responseData?.error ?? 'Nao foi possivel atualizar o perfil'
            toast.error(errorMessage)
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
            toast.error('Nao foi possivel marcar as notificacoes como lidas')
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
    })

    const deactivateAlertMutation = useMutation({
        mutationFn: deactivatePriceAlert,
        onSuccess: async () => {
            toast.success('Alerta desativado')
            await queryClient.invalidateQueries({ queryKey: ['priceAlerts'] })
        },
        onError: () => toast.error('Nao foi possivel desativar o alerta'),
    })

    function handleSaveProfile() {
        if (name.trim().length < 2 || email.trim().length === 0) {
            toast.error('Informe nome e email validos')
            return
        }

        updateProfileMutation.mutate()
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
            toast.error('Localizacao indisponivel neste navegador')
            return
        }

        navigator.geolocation.getCurrentPosition(
            () => toast.success('Localizacao autorizada para melhorar as buscas'),
            () => toast.error('Nao foi possivel acessar sua localizacao'),
        )
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                        <img src={logoImg} alt="UniMarket" className="h-8 w-8 object-contain" />
                        <div>
                            <p className="text-sm font-bold text-foreground">UniMarket</p>
                            <p className="text-xs text-muted-foreground">Perfil do consumidor</p>
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

            <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
                <section className="mb-6 rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                <User className="h-8 w-8 text-primary" />
                            </div>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h1 className="text-2xl font-bold text-foreground">{name || 'Meu perfil'}</h1>
                                    <Badge variant="secondary" className="gap-1">
                                        <CheckCircle2 className="h-3 w-3" />
                                        Cliente
                                    </Badge>
                                </div>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Ajuste seus dados, alertas e localidade para comparar melhor os mercados perto de voce.
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 text-center">
                            <div className="rounded-lg border border-border bg-background px-4 py-3">
                                <p className="text-lg font-bold text-primary">{profileScore}%</p>
                                <p className="text-xs text-muted-foreground">completo</p>
                            </div>
                            <div className="rounded-lg border border-border bg-background px-4 py-3">
                                <p className="text-lg font-bold text-foreground">{activeAlerts.length}</p>
                                <p className="text-xs text-muted-foreground">alertas</p>
                            </div>
                            <div className="rounded-lg border border-border bg-background px-4 py-3">
                                <p className="text-lg font-bold text-foreground">{unreadNotifications}</p>
                                <p className="text-xs text-muted-foreground">novas</p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <div className="space-y-6">
                        <Card className="gap-0 rounded-lg p-0">
                            <div className="border-b border-border p-5">
                                <div className="flex items-center gap-2">
                                    <ShieldCheck className="h-5 w-5 text-primary" />
                                    <h2 className="text-base font-semibold text-foreground">Conta e seguranca</h2>
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                {isProfileLoading ? (
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Carregando perfil...
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                            <div className="space-y-2">
                                                <Label htmlFor="profile-name">Nome</Label>
                                                <Input
                                                    id="profile-name"
                                                    maxLength={14}
                                                    value={name}
                                                    onChange={(event) => setName(event.target.value)}
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="profile-email" className="flex items-center gap-1.5">
                                                    <AtSign className="h-3.5 w-3.5" />
                                                    Email
                                                </Label>
                                                <Input
                                                    id="profile-email"
                                                    type="email"
                                                    value={email}
                                                    onChange={(event) => setEmail(event.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="profile-password">Nova senha</Label>
                                            <Input
                                                id="profile-password"
                                                type="password"
                                                value={password}
                                                onChange={(event) => setPassword(event.target.value)}
                                                placeholder="Deixe em branco para manter a senha atual"
                                            />
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
                                                        Salvar alteracoes
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Card>

                        <Card className="gap-0 rounded-lg p-0">
                            <div className="border-b border-border p-5">
                                <div className="flex items-center gap-2">
                                    <Bell className="h-5 w-5 text-primary" />
                                    <h2 className="text-base font-semibold text-foreground">Notificacoes</h2>
                                </div>
                            </div>

                            <div className="space-y-5 p-5">
                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                    <PreferenceSwitch
                                        checked={priceAlertsEnabled}
                                        description="Avisos quando produtos atingirem o preco desejado."
                                        label="Alertas de preco"
                                        onCheckedChange={setPriceAlertsEnabled}
                                    />
                                    <PreferenceSwitch
                                        checked={browserPushEnabled}
                                        description="Notificacoes do navegador para alertas importantes."
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

                                <div className="rounded-lg border border-border">
                                    <div className="flex items-center justify-between gap-3 border-b border-border p-4">
                                        <div>
                                            <h3 className="text-sm font-semibold text-foreground">Alertas ativos</h3>
                                            <p className="text-xs text-muted-foreground">{activeAlerts.length} produto{activeAlerts.length !== 1 ? 's' : ''} monitorado{activeAlerts.length !== 1 ? 's' : ''}</p>
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

                        <Card className="gap-0 rounded-lg p-0">
                            <div className="border-b border-border p-5">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-5 w-5 text-primary" />
                                    <h2 className="text-base font-semibold text-foreground">Localidade de compra</h2>
                                </div>
                            </div>

                            <div className="space-y-4 p-5">
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-city">Cidade</Label>
                                        <Input
                                            id="profile-city"
                                            value={city}
                                            onChange={(event) => setCity(event.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="profile-neighborhood">Bairro</Label>
                                        <Input
                                            id="profile-neighborhood"
                                            value={neighborhood}
                                            onChange={(event) => setNeighborhood(event.target.value)}
                                            placeholder="Ex.: Gonzaga"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
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
                                        className="w-full accent-primary"
                                    />
                                </div>

                                <div className="flex flex-col gap-3 rounded-lg bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">Busca por proximidade</p>
                                        <p className="text-xs text-muted-foreground">Use a localizacao do navegador para priorizar mercados perto de voce.</p>
                                    </div>
                                    <Button variant="outline" onClick={handleUseCurrentLocation}>
                                        <LocateFixed className="h-4 w-4" />
                                        Usar localizacao
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </div>

                    <aside className="space-y-6">
                        <Card className="gap-4 rounded-lg p-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">Resumo UniMarket</h2>
                                    <p className="text-xs text-muted-foreground">Sua atividade de consumo</p>
                                </div>
                                <Zap className="h-5 w-5 text-primary" />
                            </div>

                            <div className="space-y-3">
                                <SummaryRow icon={ShoppingCart} label="Itens em listas" value={String(shoppingSummary.items)} />
                                <SummaryRow icon={Home} label="Listas criadas" value={String(shoppingSummary.lists)} />
                                <SummaryRow icon={Zap} label="Economia estimada" value={`R$ ${shoppingSummary.savings.toFixed(2)}`} />
                                <SummaryRow icon={Bell} label="Notificacoes novas" value={String(unreadNotifications)} />
                            </div>
                        </Card>

                        <Card className="gap-4 rounded-lg p-5">
                            <div className="flex items-center gap-2">
                                <SlidersHorizontal className="h-5 w-5 text-primary" />
                                <h2 className="text-base font-semibold text-foreground">Preferencias aplicadas</h2>
                            </div>
                            <div className="space-y-3 text-sm">
                                <div className="rounded-lg bg-muted p-3">
                                    <p className="font-medium text-foreground">{city}</p>
                                    <p className="text-xs text-muted-foreground">{neighborhood || 'Bairro nao informado'} · ate {searchRadius} km</p>
                                </div>
                                <div className="rounded-lg bg-muted p-3">
                                    <p className="font-medium text-foreground">
                                        {priceAlertsEnabled ? 'Alertas ativos' : 'Alertas pausados'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {weeklySummaryEnabled ? 'Resumo semanal ligado' : 'Resumo semanal desligado'}
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Button className="w-full" onClick={() => navigate({ to: '/dashboard' })}>
                            <Navigation className="h-4 w-4" />
                            Voltar para comparar precos
                        </Button>
                    </aside>
                </div>
            </main>
        </div>
    )
}

interface PreferenceSwitchProps {
    checked: boolean
    description: string
    label: string
    onCheckedChange: (checked: boolean) => void
}

function PreferenceSwitch({ checked, description, label, onCheckedChange }: PreferenceSwitchProps) {
    return (
        <div className="rounded-lg border border-border p-4">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
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
        <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {label}
            </div>
            <span className="text-sm font-semibold text-foreground">{value}</span>
        </div>
    )
}
