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
    ExternalLink,
    Loader2,
    LocateFixed,
    MapPin,
    RefreshCw,
    Save,
} from 'lucide-react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
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

function formatZipCode(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 8)
    return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits
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
        if (!profile) return

        setName(profile.name ?? '')
        setEmail(profile.email ?? Cookies.get('marketEmail') ?? '')
        setStreetAddress(profile.streetAddress ?? '')
        setNeighborhood(profile.neighborhood ?? '')
        setCity(profile.city ?? '')
        setState(profile.state ?? '')
        setZipCode(profile.zipCode ? formatZipCode(profile.zipCode) : '')
        setLatitude(profile.latitude != null ? String(profile.latitude) : '')
        setLongitude(profile.longitude != null ? String(profile.longitude) : '')
    }, [profile])

    const completeness = useMemo(() => {
        const fields = [name, email, profile?.cnpj, streetAddress, neighborhood, city, state, zipCode]
        return Math.round((fields.filter(Boolean).length / fields.length) * 100)
    }, [city, email, name, neighborhood, profile?.cnpj, state, streetAddress, zipCode])

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
            toast.success('Configurações salvas.')
            await queryClient.invalidateQueries({ queryKey: ['marketProfile'] })
            await queryClient.invalidateQueries({ queryKey: ['nearbyMarkets'] })
        },
        onError: () => toast.error('Não foi possível salvar as configurações.'),
    })

    const syncMutation = useMutation({
        mutationFn: syncCurrentMarketProfileFromCnpj,
        onSuccess: async (updatedProfile) => {
            setName(updatedProfile.name ?? '')
            setStreetAddress(updatedProfile.streetAddress ?? '')
            setNeighborhood(updatedProfile.neighborhood ?? '')
            setCity(updatedProfile.city ?? '')
            setState(updatedProfile.state ?? '')
            setZipCode(updatedProfile.zipCode ? formatZipCode(updatedProfile.zipCode) : '')
            setLatitude(updatedProfile.latitude != null ? String(updatedProfile.latitude) : '')
            setLongitude(updatedProfile.longitude != null ? String(updatedProfile.longitude) : '')
            toast.success('Cadastro atualizado com os dados oficiais.')
            await queryClient.invalidateQueries({ queryKey: ['marketProfile'] })
            await queryClient.invalidateQueries({ queryKey: ['nearbyMarkets'] })
        },
        onError: () => toast.error('Não foi possível atualizar o cadastro agora.'),
    })

    function handleUseCurrentLocation() {
        if (typeof navigator === 'undefined' || !navigator.geolocation) {
            toast.error('Localização indisponível neste navegador.')
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(String(position.coords.latitude))
                setLongitude(String(position.coords.longitude))
                toast.success('Localização atual registrada.')
            },
            () => toast.error('Não foi possível acessar sua localização.'),
            { enableHighAccuracy: true, timeout: 10000 },
        )
    }

    if (isLoading) {
        return (
            <div className="space-y-6">
                <section className="rounded-lg border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-12 w-12" />
                        <div className="flex-1 space-y-2">
                            <Skeleton className="h-6 w-56" />
                            <Skeleton className="h-4 w-96 max-w-full" />
                        </div>
                    </div>
                </section>
                <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                    <Card className="gap-4 p-5">
                        <Skeleton className="h-5 w-48" />
                        <div className="grid gap-4 md:grid-cols-2">
                            {Array.from({ length: 6 }).map((_, index) => (
                                <Skeleton key={index} className="h-10 w-full" />
                            ))}
                        </div>
                    </Card>
                    <Card className="gap-4 p-5">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-24 w-full" />
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <section className="rounded-lg border border-border bg-card/95 p-5 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Configurações</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <h2 className="text-2xl font-semibold tracking-tight text-foreground">{profile?.name ?? 'Minha loja'}</h2>
                            <Badge variant={profile?.registrationStatus?.toLowerCase() === 'ativa' ? 'default' : 'secondary'} className="font-normal">
                                <BadgeCheck className="h-3 w-3" />
                                {profile?.registrationStatus ?? 'Cadastro informado'}
                            </Badge>
                        </div>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            Mantenha os dados da loja corretos para que clientes encontrem endereço, contato e disponibilidade com confiança.
                        </p>
                    </div>

                    <div className="w-full rounded-lg border border-border bg-background/70 px-4 py-3 text-left sm:w-auto">
                        <p className="text-lg font-semibold tabular-nums text-primary">{completeness}%</p>
                        <p className="text-xs text-muted-foreground">perfil preenchido</p>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
                <div className="space-y-6">
                    <Card className="gap-0 p-0">
                        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-foreground">Dados da loja</h3>
                                <p className="mt-1 text-sm text-muted-foreground">Nome, contato e acesso administrativo.</p>
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
                                Atualizar cadastro
                            </Button>
                        </div>

                        <div className="space-y-4 p-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Nome de exibição" htmlFor="storeName">
                                    <Input id="storeName" value={name} onChange={(event) => setName(event.target.value)} />
                                </Field>
                                <Field label="E-mail comercial" htmlFor="email">
                                    <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="CNPJ" htmlFor="cnpj">
                                    <Input id="cnpj" value={formatCnpj(profile?.cnpj)} disabled className="bg-muted" />
                                </Field>
                                <Field label="Nova senha" htmlFor="password" hint="Deixe em branco para manter a senha atual.">
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        autoComplete="new-password"
                                    />
                                </Field>
                            </div>
                        </div>
                    </Card>

                    <Card className="gap-0 p-0">
                        <div className="border-b border-border p-5">
                            <h3 className="text-base font-semibold text-foreground">Endereço e atendimento</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Esses dados ajudam clientes a encontrar sua loja e avaliar a proximidade.
                            </p>
                        </div>

                        <div className="space-y-4 p-5">
                            <Field label="Endereço" htmlFor="address">
                                <Input id="address" value={streetAddress} onChange={(event) => setStreetAddress(event.target.value)} />
                            </Field>

                            <div className="grid gap-4 md:grid-cols-[1fr_1fr_80px_120px]">
                                <Field label="Bairro" htmlFor="neighborhood">
                                    <Input id="neighborhood" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} />
                                </Field>
                                <Field label="Cidade" htmlFor="city">
                                    <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} />
                                </Field>
                                <Field label="UF" htmlFor="state">
                                    <Input id="state" maxLength={2} value={state} onChange={(event) => setState(event.target.value.toUpperCase())} />
                                </Field>
                                <Field label="CEP" htmlFor="zipCode">
                                    <Input id="zipCode" value={zipCode} onChange={(event) => setZipCode(formatZipCode(event.target.value))} />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Latitude" htmlFor="lat">
                                    <Input id="lat" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="-23.9608" />
                                </Field>
                                <Field label="Longitude" htmlFor="lng">
                                    <Input id="lng" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="-46.3336" />
                                </Field>
                            </div>

                            <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm font-medium text-foreground">Quer melhorar a precisão?</p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">
                                        Use a localização atual quando estiver no estabelecimento.
                                    </p>
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
                            Salvar configurações
                        </Button>
                    </div>
                </div>

                <aside className="space-y-6">
                    <Card className="gap-4 p-5">
                        <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-base font-semibold text-foreground">Como clientes veem sua loja</h3>
                        </div>
                        <p className="text-sm leading-relaxed text-muted-foreground">
                            Quando endereço e cidade estão completos, a loja aparece melhor nas buscas por região e nas comparações de mercado.
                        </p>
                        <div className="flex flex-col gap-2">
                            <Button
                                variant="outline"
                                disabled={!profile?.googleMapsUrl}
                                onClick={() => profile?.googleMapsUrl && window.open(profile.googleMapsUrl, '_blank', 'noopener,noreferrer')}
                            >
                                <ExternalLink className="h-4 w-4" />
                                Abrir localização
                            </Button>
                            <Button
                                variant="outline"
                                disabled={!profile?.directionsUrl}
                                onClick={() => profile?.directionsUrl && window.open(profile.directionsUrl, '_blank', 'noopener,noreferrer')}
                            >
                                <MapPin className="h-4 w-4" />
                                Ver rota até a loja
                            </Button>
                        </div>
                    </Card>

                    <Card className="gap-4 p-5">
                        <div className="flex items-center gap-2">
                            <Bell className="h-4 w-4 text-muted-foreground" />
                            <h3 className="text-base font-semibold text-foreground">Preferências de aviso</h3>
                        </div>
                        <PreferenceSwitch
                            checked={priceAlertsEnabled}
                            description="Receber avisos quando produtos entrarem em alertas de preço."
                            label="Alertas de preço"
                            onCheckedChange={setPriceAlertsEnabled}
                        />
                        <PreferenceSwitch
                            checked={reviewAlertsEnabled}
                            description="Receber aviso quando clientes enviarem novas avaliações."
                            label="Avaliações"
                            onCheckedChange={setReviewAlertsEnabled}
                        />
                        <PreferenceSwitch
                            checked={weeklyReportEnabled}
                            description="Receber um resumo periódico de buscas, listas e visibilidade."
                            label="Resumo periódico"
                            onCheckedChange={setWeeklyReportEnabled}
                        />
                    </Card>
                </aside>
            </div>
        </div>
    )
}

function Field({
    children,
    hint,
    htmlFor,
    label,
}: {
    children: ReactNode
    hint?: string
    htmlFor: string
    label: string
}) {
    return (
        <div className="space-y-2">
            <Label htmlFor={htmlFor}>{label}</Label>
            {children}
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
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
        <div className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    )
}
