import {
    Badge, Button, Card,
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
    Input, Label, Skeleton,
} from '@/components/ui'
import { SettingsSectionNav } from '@/components/settings-section-nav'
import { getApiErrorMessage } from '@/lib/api-error'
import {
    deleteMarketAccount,
    getCurrentMarketProfile,
    syncCurrentMarketProfileFromCnpj,
    updateCurrentMarketProfile,
} from '@/services/supermarket'
import { validateStrongPassword } from '@/utils/profile'
import { clearSessionState } from '@/utils/session'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import Cookies from 'js-cookie'
import {
    AlertTriangle,
    BadgeCheck,
    ExternalLink,
    KeyRound,
    Loader2,
    LocateFixed,
    MapPin,
    RefreshCw,
    Save,
    Trash2,
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
    const navigate = useNavigate()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [streetAddress, setStreetAddress] = useState('')
    const [neighborhood, setNeighborhood] = useState('')
    const [city, setCity] = useState('')
    const [state, setState] = useState('')
    const [zipCode, setZipCode] = useState('')
    const [latitude, setLatitude] = useState('')
    const [longitude, setLongitude] = useState('')
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [priceAlertsEnabled, setPriceAlertsEnabled] = useState(true)
    const [reviewAlertsEnabled, setReviewAlertsEnabled] = useState(true)
    const [weeklyReportEnabled, setWeeklyReportEnabled] = useState(true)
    const [showSecurityForm, setShowSecurityForm] = useState(false)
    const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)
    const [activeSettingsSection, setActiveSettingsSection] = useState('market-registration-section')

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
        setPriceAlertsEnabled(profile.priceAlertsEnabled ?? true)
        setReviewAlertsEnabled(profile.reviewAlertsEnabled ?? true)
        setWeeklyReportEnabled(profile.weeklyReportEnabled ?? true)
    }, [profile])

    const completeness = useMemo(() => {
        const fields = [name, email, profile?.cnpj, streetAddress, neighborhood, city, state, zipCode]
        return Math.round((fields.filter(Boolean).length / fields.length) * 100)
    }, [city, email, name, neighborhood, profile?.cnpj, state, streetAddress, zipCode])

    const publicLocationQuery = useMemo(() => {
        if (latitude.trim() && longitude.trim()) {
            return `${latitude.trim()},${longitude.trim()}`
        }

        return [streetAddress, neighborhood, city, state, zipCode]
            .map(value => value.trim())
            .filter(Boolean)
            .join(', ')
    }, [city, latitude, longitude, neighborhood, state, streetAddress, zipCode])

    const publicGoogleMapsUrl = publicLocationQuery
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(publicLocationQuery)}`
        : ''
    const publicDirectionsUrl = publicLocationQuery
        ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(publicLocationQuery)}`
        : ''

    const settingsSections = useMemo(() => [
        {
            id: 'market-registration-section',
            label: 'Cadastro',
            description: 'Dados comerciais e CNPJ da loja.',
            icon: BadgeCheck,
        },
        {
            id: 'market-security-section',
            label: 'Segurança',
            description: 'Senha e exclusão da conta.',
            icon: KeyRound,
        },
        {
            id: 'market-location-section',
            label: 'Endereço',
            description: 'Localização exibida para clientes.',
            icon: MapPin,
        },
        {
            id: 'market-account-section',
            label: 'Conta',
            description: 'Visualização pública da loja.',
            icon: ExternalLink,
        },
    ], [])

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
            priceAlertsEnabled,
            reviewAlertsEnabled,
            weeklyReportEnabled,
        }),
        onSuccess: async (updatedProfile) => {
            Cookies.set('marketName', updatedProfile.name, cookieOptions)
            Cookies.set('marketEmail', email.trim(), cookieOptions)
            toast.success('Configurações salvas.')
            await queryClient.invalidateQueries({ queryKey: ['marketProfile'] })
            await queryClient.invalidateQueries({ queryKey: ['nearbyMarkets'] })
        },
        onError: () => toast.error('Não foi possível salvar as configurações.'),
    })

    const securityMutation = useMutation({
        mutationFn: () => updateCurrentMarketProfile({
            currentPassword: currentPassword.trim(),
            password: newPassword.trim(),
        }),
        onSuccess: async () => {
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setShowSecurityForm(false)
            toast.success('Senha atualizada.')
            await queryClient.invalidateQueries({ queryKey: ['marketProfile'] })
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error, 'Não foi possível atualizar a senha.'))
        },
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

    const deleteAccountMutation = useMutation({
        mutationFn: () => deleteMarketAccount(profile!.id),
        onSuccess: () => {
            clearSessionState()
            queryClient.clear()
            toast.success('Conta do supermercado excluída.')
            navigate({ to: '/login' })
        },
        onError: (error: unknown) => {
            toast.error(getApiErrorMessage(error, 'Não foi possível excluir a conta.'))
        },
    })

    function handleSaveSecurity() {
        if (!currentPassword) {
            toast.error('Informe a senha atual para alterar.')
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

        securityMutation.mutate()
    }

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
            <section className="overflow-hidden rounded-lg border border-border bg-card/95 shadow-sm backdrop-blur">
                <div className="flex flex-col gap-5 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0">
                        <p className="text-xs font-semibold uppercase tracking-wide text-primary">Configurações</p>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                            <h2 className="truncate text-2xl font-semibold tracking-tight text-foreground">{profile?.name ?? 'Minha loja'}</h2>
                            <Badge variant={profile?.registrationStatus?.toLowerCase() === 'ativa' ? 'default' : 'secondary'} className="font-normal">
                                <BadgeCheck className="h-3 w-3" />
                                {profile?.registrationStatus ?? 'Cadastro informado'}
                            </Badge>
                        </div>
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                            Mantenha os dados da loja corretos para que clientes encontrem endereço, contato e disponibilidade com confiança.
                        </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2 lg:w-[430px]">
                        <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
                            <p className="text-xs font-medium text-muted-foreground">Localização pública</p>
                            <p className="mt-1 truncate text-sm font-semibold text-foreground">
                                {[city, state].filter(Boolean).join(', ') || 'Pendente'}
                            </p>
                        </div>
                        <div className="rounded-lg border border-border bg-background/70 px-4 py-3">
                            <p className="text-xs font-medium text-muted-foreground">Cadastro preenchido</p>
                            <p className="mt-1 text-lg font-semibold tabular-nums text-primary">{completeness}%</p>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
            <SettingsSectionNav
                activeId={activeSettingsSection}
                ariaLabel="Seções das configurações do mercado"
                className="lg:sticky lg:top-24"
                items={settingsSections}
                onChange={setActiveSettingsSection}
            />

            <div className="min-w-0">
                <div className={activeSettingsSection === 'market-account-section' ? 'hidden' : 'space-y-6'}>
                    {activeSettingsSection === 'market-registration-section' && (
                    <Card id="market-registration-section" role="tabpanel" aria-labelledby="market-registration-section-tab" className="gap-0 p-0">
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
                                    <Input id="storeName" value={name} onChange={(event) => setName(event.target.value)} placeholder="Digite aqui" />
                                </Field>
                                <Field label="E-mail comercial" htmlFor="email">
                                    <Input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Digite aqui" />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="CNPJ" htmlFor="cnpj">
                                    <Input id="cnpj" value={formatCnpj(profile?.cnpj)} disabled className="bg-muted" />
                                </Field>
                            </div>
                        </div>
                    </Card>
                    )}

                    {activeSettingsSection === 'market-security-section' && (
                    <Card id="market-security-section" role="tabpanel" aria-labelledby="market-security-section-tab" className="gap-0 p-0">
                        <div className="flex flex-col gap-3 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                <KeyRound className="h-4 w-4 text-primary" />
                                <div>
                                    <h3 className="text-base font-semibold text-foreground">Segurança</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        A senha fica protegida e só aparece quando você decide alterá-la.
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
                                        <p className="text-sm font-medium text-foreground">Alteração de senha</p>
                                        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                            Informe a senha atual e defina uma nova senha para a conta do supermercado.
                                        </p>
                                    </div>

                                    <div className="grid gap-4 md:grid-cols-3">
                                        <Field label="Senha atual" htmlFor="market-current-password">
                                            <Input
                                                id="market-current-password"
                                                type="password"
                                                value={currentPassword}
                                                onChange={(event) => setCurrentPassword(event.target.value)}
                                                autoComplete="current-password"
                                                placeholder="Digite aqui"
                                            />
                                        </Field>
                                        <Field label="Nova senha" htmlFor="market-new-password">
                                            <Input
                                                id="market-new-password"
                                                type="password"
                                                value={newPassword}
                                                onChange={(event) => setNewPassword(event.target.value)}
                                                autoComplete="new-password"
                                                placeholder="Digite aqui"
                                            />
                                        </Field>
                                        <Field label="Confirmar nova senha" htmlFor="market-confirm-password">
                                            <Input
                                                id="market-confirm-password"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(event) => setConfirmPassword(event.target.value)}
                                                autoComplete="new-password"
                                                placeholder="Digite aqui"
                                            />
                                        </Field>
                                    </div>

                                    <div className="flex justify-end border-t border-border pt-4">
                                        <Button onClick={handleSaveSecurity} disabled={securityMutation.isPending}>
                                            {securityMutation.isPending ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Salvar senha
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                <div className="rounded-lg border border-border bg-muted/30 p-4">
                                    <p className="text-sm font-medium text-foreground">Senha protegida</p>
                                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                        Para manter o formulário limpo, os campos de senha ficam ocultos até você iniciar a alteração.
                                    </p>
                                </div>
                            )}

                            <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex items-start gap-3">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">Excluir supermercado</p>
                                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                                Remove o supermercado e seus vínculos de produtos do UniMarket.
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="destructive" onClick={() => setDeleteAccountOpen(true)} disabled={!profile}>
                                        <Trash2 className="h-4 w-4" />
                                        Excluir conta
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                    )}

                    {activeSettingsSection === 'market-location-section' && (
                    <Card id="market-location-section" role="tabpanel" aria-labelledby="market-location-section-tab" className="gap-0 p-0">
                        <div className="border-b border-border p-5">
                            <h3 className="text-base font-semibold text-foreground">Endereço e atendimento</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Esses dados ajudam clientes a encontrar sua loja e avaliar a proximidade.
                            </p>
                        </div>

                        <div className="space-y-4 p-5">
                            <Field label="Endereço" htmlFor="address">
                                <Input id="address" value={streetAddress} onChange={(event) => setStreetAddress(event.target.value)} placeholder="Digite aqui" />
                            </Field>

                            <div className="grid gap-4 md:grid-cols-[1fr_1fr_80px_120px]">
                                <Field label="Bairro" htmlFor="neighborhood">
                                    <Input id="neighborhood" value={neighborhood} onChange={(event) => setNeighborhood(event.target.value)} placeholder="Digite aqui" />
                                </Field>
                                <Field label="Cidade" htmlFor="city">
                                    <Input id="city" value={city} onChange={(event) => setCity(event.target.value)} placeholder="Digite aqui" />
                                </Field>
                                <Field label="UF" htmlFor="state">
                                    <Input id="state" maxLength={2} value={state} onChange={(event) => setState(event.target.value.toUpperCase())} placeholder="Digite aqui" />
                                </Field>
                                <Field label="CEP" htmlFor="zipCode">
                                    <Input id="zipCode" value={zipCode} onChange={(event) => setZipCode(formatZipCode(event.target.value))} placeholder="Digite aqui" />
                                </Field>
                            </div>

                            <div className="grid gap-4 md:grid-cols-2">
                                <Field label="Latitude" htmlFor="lat">
                                    <Input id="lat" value={latitude} onChange={(event) => setLatitude(event.target.value)} placeholder="Digite aqui" />
                                </Field>
                                <Field label="Longitude" htmlFor="lng">
                                    <Input id="lng" value={longitude} onChange={(event) => setLongitude(event.target.value)} placeholder="Digite aqui" />
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
                    )}

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

                {activeSettingsSection === 'market-account-section' && (
                <section id="market-account-section" role="tabpanel" aria-labelledby="market-account-section-tab" className="grid gap-6 lg:grid-cols-2">
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
                                disabled={!publicGoogleMapsUrl}
                                onClick={() => publicGoogleMapsUrl && window.open(publicGoogleMapsUrl, '_blank', 'noopener,noreferrer')}
                            >
                                <ExternalLink className="h-4 w-4" />
                                Abrir localização
                            </Button>
                            <Button
                                variant="outline"
                                disabled={!publicDirectionsUrl}
                                onClick={() => publicDirectionsUrl && window.open(publicDirectionsUrl, '_blank', 'noopener,noreferrer')}
                            >
                                <MapPin className="h-4 w-4" />
                                Ver rota até a loja
                            </Button>
                        </div>
                    </Card>
                </section>
                )}
            </div>
            </div>

            <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Excluir supermercado?</DialogTitle>
                        <DialogDescription>
                            Esta ação remove a conta do mercado e os produtos vinculados. Confirme apenas se deseja encerrar este cadastro.
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
