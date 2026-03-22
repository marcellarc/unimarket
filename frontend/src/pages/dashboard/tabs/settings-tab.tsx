import { Button, Card, Input, Label, Switch } from '@/components/ui';
import { Store, Bell, Lock, MapPin, Clock, Save, Database } from 'lucide-react';

export function SettingsTab() {
    const marketName = 'Supermercado Econômico';

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-foreground">Configurações da Loja</h2>
                <p className="text-sm text-muted-foreground">Gerencie como sua loja aparece no UniMarket</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <div className="space-y-6">

                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Store className="w-5 h-5 text-primary" />
                            <h3 className="text-base font-semibold text-foreground">Perfil do Supermercado</h3>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <Label htmlFor="storeName">Nome de Exibição</Label>
                                <Input id="storeName" defaultValue={marketName} className="mt-1.5 bg-background" />
                            </div>
                            <div>
                                <Label htmlFor="cnpj">CNPJ</Label>
                                <Input id="cnpj" defaultValue="12.345.678/0001-90" className="mt-1.5 bg-background" />
                            </div>
                            <div>
                                <Label htmlFor="email">E-mail de Contato Comercial</Label>
                                <Input id="email" defaultValue="contato@economia.com" className="mt-1.5 bg-background" />
                            </div>
                        </div>
                    </Card>


                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <MapPin className="w-5 h-5 text-blue-600" />
                            <h3 className="text-base font-semibold text-foreground">Localização no Mapa</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Essa localização é usada pela API do Google Maps para mostrar sua loja aos clientes da região.
                            </p>
                            <div>
                                <Label htmlFor="address">Endereço Completo</Label>
                                <Input id="address" defaultValue="Rua das Flores, 123 - Centro - Santos/SP" className="mt-1.5 bg-background" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="lat">Latitude</Label>
                                    <Input id="lat" defaultValue="-23.9618" disabled className="mt-1.5 bg-secondary text-muted-foreground" />
                                </div>
                                <div>
                                    <Label htmlFor="lng">Longitude</Label>
                                    <Input id="lng" defaultValue="-46.3322" disabled className="mt-1.5 bg-secondary text-muted-foreground" />
                                </div>
                            </div>
                            <Button variant="outline" size="sm" className="w-full">Atualizar Coordenadas no Mapa</Button>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Database className="w-5 h-5 text-emerald-600" />
                            <h3 className="text-base font-semibold text-foreground">Sincronização de Preços</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-sm text-muted-foreground mb-4">
                                Mantenha seus preços sempre atualizados no UniMarket para não perder competitividade.
                            </p>
                            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                                <div>
                                    <p className="font-medium text-sm text-foreground">Atualização Automática (API)</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Sincronizar direto com seu sistema</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <Button variant="outline" className="w-full text-sm">Gerenciar Chaves da API</Button>
                        </div>
                    </Card>


                    <Card className="p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Bell className="w-5 h-5 text-orange-600" />
                            <h3 className="text-base font-semibold text-foreground">Notificações e Alertas</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm text-foreground">Concorrência de Preço</p>
                                    <p className="text-xs text-muted-foreground">Alertar se um concorrente abaixar muito o preço</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm text-foreground">Novas Avaliações</p>
                                    <p className="text-xs text-muted-foreground">Notificar quando receber feedback de cliente</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm text-foreground">Relatório Semanal</p>
                                    <p className="text-xs text-muted-foreground">Resumo de buscas e produtos favoritados</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4">
                <Button variant="ghost">Cancelar</Button>
                <Button>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                </Button>
            </div>
        </div>
    );
}