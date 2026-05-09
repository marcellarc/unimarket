import { Badge, Button, Card, Input, Label, Skeleton, Switch } from '@/components/ui'
import {
    getCurrentMarketProfile,
    syncCurrentMarketProfileFromCnpj,
    updateCurrentMarketProfile,
} from '@/services/supermarket'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Cookies from 'js-cookie'
import {
    BadgeCheck,
    Bell,
    Building2,
    ExternalLink,
    Loader2,
    LocateFixed,
    MapPin,
    RefreshCw,
    Route,
    Save,
    Store,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

const cookieOptions = {
    expires: 1,
    secure: import.meta.env.PROD,
    sameSite: 'strict' as const,
}

function formatCnpj(value?: string | null) {
    const digits = (value ?? '').replace(/\D/g, '').slice(0, 14)

    return digits
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
}

export function SettingsTab() {
    const queryClient = useQueryClient()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [streetAddress, setStreetAddress] = useState('')
    const [neighborhood, setNeighborhood] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [zipCode, setZipCode] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [password, setPassword] = useState('')
    const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true)
    const [reviewAlertsEnabled, setReviewAlertsEnabled] = useState(true)
    const [weeklyReportEnabled, setWeeklyReportEnabled] = useState(true)

    const { data: profile, isLoading } = useQuery({
        queryKey: ['marketProfile'],
        queryFn: getCurrentMarketProfile,
    })

    useEffect(() => {
        if (!profile) {
            return
        }

        setName(profile.name ?? '')
        setEmail(profile.email ?? Cookies.get('marketEmail') ?? '')
        setStreetAddress(profile.streetAddress ?? '')
        setNeighborhood(profile.neighborhood ?? '')
        setCity(profile.city ?? '')
        setState(profile.state ?? '')
        setZipCode(profile.zipCode ?? '')
        setLatitude(profile.latitude != null ? String(profile.latitude) : '')
        setLongitude(profile.longitude != null ? String(profile.longitude) : '')
    }, [profile])

    const completeness = useMemo(() => {
        const fields = [
            name,
            email,
            profile?.cnpj,
            streetAddress,
            neighborhood,
            city,
            state,
            zipCode,
            latitude,
            longitude,
        ]

        return Math.round((fields.filter(Boolean).length / fields.length) * 100)
    }, [city, email, latitude, longitude, name, neighborhood, profile?.cnpj, state, streetAddress, zipCode])

    const saveMutation = useMutation({
        mutationFn: () => updateCurrentMarketProfile({
            name: name.trim(),
            email: email.trim(),
            streetAddress: streetAddress.trim(),
            neighborhood: neighborhood.trim(),
            city: city.trim(),
            state: state.trim().toUpperCase(),
            zipCode: zipCode.replace(/\D/g, ''),
            latitude: latitude.trim() ? Number(latitude) : undefined,
            longitude: longitude.trim() ? Number(longitude) : undefined,
            password: password.trim() || undefined,
        }),
        onSuccess: async (updatedProfile) => {
            Cookies.set('marketName', updatedProfile.name, cookieOptions)
            Cookies.set('marketEmail', email.trim(), cookieOptions)
            setPassword('')
            toast.success('Configuracoes salvas')
            await queryClient.invalidateQueries({ queryKey: ['marketProfile'] })
            await queryClient.invalidateQueries({ queryKey: ['nearbyMarkets'] })
        },
        onError: () => toast.error('Nao foi possivel salvar as configuracoes'),
    })

    const syncMutation = useMutation({
        mutationFn: syncCurrentMarketProfileFromCnpj,
        onSuccess: async (updatedProfile) => {
            setName(updatedProfile.name ?? '')
            setStreetAddress(updatedProfile.streetAddress ?? '')
            setNeighborhood(updatedProfile.neighborhood ?? '')
            setCity(updatedProfile.city ?? '')
            setState(updatedProfile.state ?? '')
            setZipCode(updatedProfile.zipCode ?? '')
            setLatitude(updatedProfile.latitude != null ? String(updatedProfile.latitude) : '')
            setLongitude(updatedProfile.longitude != null ? String(updatedProfile.longitude) : '')
            toast.success('Dados do CNPJ sincronizados')
            await queryClient.invalidateQueries({ queryKey: ['marketProfile'] })
            await queryClient.invalidateQueries({ queryKey: ['nearbyMarkets'] })
        },
        onError: () => toast.error('Nao foi possivel consultar o CNPJ agora'),
    })

    function handleUseCurrentLocation() {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            toast.error('Localizacao indisponivel neste navegador')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(String(position.coords.latitude))
                setLongitude(String(position.coords.longitude))
                toast.success('Coordenadas capturadas')
            },
            () => toast.error('Não foi possível acessar sua localização.'),
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-14 w-14" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-56" />
                            <Skeleton className="h-4 w-96 max-w-full" />
                        </div>
                    </div>
                </section>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                    <Card className="gap-4 rounded-lg p-5">
                        <Skeleton className="h-5 w-48" />
                        <div className="grid gap-4 md:grid-cols-2">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} className="h-10 w-full" />
                            ))}
                        </div>
                    </Card>
                    <Card className="gap-4 rounded-lg p-5">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-24 w-full" />
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10">
                            <Store className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <h2 className="text-2xl font-bold text-foreground">{profile?.name ?? 'Minha loja'}</h2>
                                <Badge variant={profile?.registrationStatus?.toLowerCase() === 'ativa' ? 'default' : 'secondary'} className="gap-1">
                                    <BadgeCheck className="h-3 w-3" />
                                    {profile?.registrationStatus ?? 'CNPJ cadastrado'}
                                </Badge>
                            </div>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Estes dados definem como sua loja aparece para clientes e como o UniMarket calcula proximidade.
                            </p>
                        </div>
                    </div>

                    <div className="gap-3 text-center">
                        <div className="rounded-lg border border-border bg-background px-4 py-3">
                            <p className="text-lg font-bold text-primary">{completeness}%</p>
                            <p className="text-xs text-muted-foreground">completo</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-6">
                    <Card className="gap-0 rounded-lg p-0">
                        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-5 w-5 text-primary" />
                                <h3 className="text-base font-semibold text-foreground">Perfil do supermercado</h3>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => syncMutation.mutate()}
                                disabled={syncMutation.isPending}
                            >
                                {syncMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4" />
                                )}
                                Sincronizar CNPJ
                            </Button>
                        </div>

                        <div className="space-y-4 p-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="storeName">Nome de exibicao</Label>
                                    <Input id="storeName" value={name} onChange={(event) => setName(event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email comercial</Label>
                                    <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="cnpj">CNPJ</Label>
                                    <Input id="cnpj" value={formatCnpj(profile?.cnpj)} disabled className="bg-muted" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Nova senha</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        placeholder="Deixe em branco para manter"
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="gap-0 rounded-lg p-0">
                        <div className="border-b border-border p-5">
                            <div className="flex items-center gap-2">
                                <MapPin className="h-5 w-5 text-primary" />
                                <h3 className="text-base font-semibold text-foreground">Localizacao para clientes</h3>
                            </div>
                        </div>

                        <div className="space-y-4 p-5">
                            <div className="space-y-2">
                                <Label htmlFor="address">Endereço</Label>
                                <Input id="address" value={streetAddress} onChange={(event) => setStreetAddress(event.target.value)} />
                            </div>

                            <div className="grid gap-4 md:grid-cols-4">
                                <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor="neighborhood">Bairro</Label>
                                    <Input id="neighborhood" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} />
                                </div>
                                <div className="space-y-2 md:col-span-1">
                                    <Label htmlFor="city">Cidade</Label>
                                    <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">UF</Label>
                                    <Input id="state" maxLength={2} value={state} onChange={(event) => setState(event.target.value.toUpperCase())} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zipCode">CEP</Label>
                                    <Input id="zipCode" value={zipCode} onChange={(event) => setZipCode(event.target.value)} />
                                </div>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="lat">Latitude</Label>
                                    <Input id="lat" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="-23.9608" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lng">Longitude</Label>
                                    <Input id="lng" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="-46.3336" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 rounded-lg bg-muted p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Coordenadas precisas melhoram a busca local</p>
                                    <p className="text-xs text-muted-foreground">A BrasilAPI traz endereco pelo CNPJ; o Google Geocoding pode preencher coordenadas quando configurado.</p>
                                </div>
                                <Button variant="outline" onClick={handleUseCurrentLocation}>
                                    <LocateFixed className="h-4 w-4" />
                                    Usar localização atual
                                </Button>
                            </div>
                        </div>
                    </Card>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                        <Button variant="ghost" onClick={() => queryClient.invalidateQueries({ queryKey: ['marketProfile'] })}>
                            Cancelar
                        </Button>
                        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                            {saveMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Save className="h-4 w-4" />
                            )}
                            Salvar configuracoes
                        </Button>
                    </div>
                </div>

                <aside className="space-y-6">

                    <Card className="gap-4 rounded-lg p-5">
                        <div className="flex items-center gap-2">
                            <Route className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold text-foreground">Mapa e descoberta local</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Clientes veem sua loja na busca por proximidade quando cidade/UF ou coordenadas estao preenchidas.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                disabled={!profile?.googleMapsUrl}
                                onClick={() => profile?.googleMapsUrl && window.open(profile.googleMapsUrl, '_blank', 'noopener,noreferrer')}
                            >
                                <ExternalLink className="h-4 w-4" />
                                Abrir no Google Maps
                            </Button>
                            <Button
                                variant="outline"
                                disabled={!profile?.directionsUrl}
                                onClick={() => profile?.directionsUrl && window.open(profile.directionsUrl, '_blank', 'noopener,noreferrer')}
                            >
                                <MapPin className="h-4 w-4" />
                                Ver rota ate a loja
                            </Button>
                        </div>
                    </Card>

                    <Card className="gap-4 rounded-lg p-5">
                        <div className="flex items-center gap-2">
                            <Bell className="h-5 w-5 text-primary" />
                            <h3 className="text-base font-semibold text-foreground">Notificacoes</h3>
                        </div>
                        <PreferenceSwitch
                            checked={priceAlertsEnabled}
                            description="Avisar quando seus produtos aparecerem em alertas de preço."
                            label="Concorrência de preço"
                            onCheckedChange={setPriceAlertsEnabled}
                        />
                        <PreferenceSwitch
                            checked={reviewAlertsEnabled}
                            description="Notificar quando clientes enviarem avaliacoes."
                            label="Novas avaliacoes"
                            onCheckedChange={setReviewAlertsEnabled}
                        />
                        <PreferenceSwitch
                            checked={weeklyReportEnabled}
                            description="Resumo semanal de buscas, listas e visibilidade local."
                            label="Relatorio semanal"
                            onCheckedChange={setWeeklyReportEnabled}
                        />
                    </Card>
                </aside>
            </div>
        </div>
    )
}

function PreferenceSwitch({
    checked,
    description,
    label,
    onCheckedChange,
}: {
    checked: boolean
    description: string
    label: string
    onCheckedChange: (checked: boolean) => void
}) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    )
}
