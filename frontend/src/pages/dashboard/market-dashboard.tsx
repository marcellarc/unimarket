import logoImg from '@/assets/logo-unimarket-auth.png';
import {
    Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui';
import { useLogout } from '@/hooks/use-logout';
import { getCurrentMarketProfile } from '@/services/supermarket';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import Cookies from 'js-cookie';
import {
    ChevronDown,
    LayoutDashboard,
    Lock,
    LogOut,
    MapPin,
    Menu,
    MessageSquare,
    Package,
    Settings,
    Store,
    type LucideIcon
} from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { OverviewTab, ProductsTab, ReviewsTab, SettingsTab } from './tabs';

type TabType = 'overview' | 'products' | 'reviews' | 'competitors' | 'reports' | 'settings';

interface MenuItem {
    id: TabType;
    label: string;
    icon: LucideIcon;
    badge?: number;
}

const menuItems: MenuItem[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'products', label: 'Estoque', icon: Package },
    { id: 'reviews', label: 'Avaliações', icon: MessageSquare },
    { id: 'settings', label: 'Configurações', icon: Settings },
];

export default function MarketDashboard() {
    const navigate = useNavigate();
    const { logout } = useLogout()
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const isLogged = Cookies.get('accessToken') !== undefined;
    const marketName = Cookies.get('marketName') || 'Visitante';
    const { data: marketProfile } = useQuery({
        queryKey: ['marketProfile'],
        queryFn: getCurrentMarketProfile,
        enabled: isLogged,
    })
    const locationLabel = [marketProfile?.city, marketProfile?.state].filter(Boolean).join(', ') || 'Localização pendente'

    const activeMenuItem = useMemo(() => menuItems.find(item => item.id === activeTab), [activeTab])
    const navigateToProducts = useCallback(() => setActiveTab('products'), [])

    const renderContent = useCallback(() => {
        if (!isLogged && (activeTab === 'products' || activeTab === 'settings')) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Lock className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Acesso Restrito</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        A aba de {activeMenuItem?.label} é exclusiva para supermercados parceiros. Faça login para gerenciar sua loja.
                    </p>
                    <Button onClick={() => navigate({ to: '/login' })}>
                        Fazer Login
                    </Button>
                </div>
            );
        }


        switch (activeTab) {
            case 'overview': return <OverviewTab onNavigateToProducts={navigateToProducts} />;
            case 'products': return <ProductsTab />;
            case 'reviews': return <ReviewsTab />;
            case 'settings': return <SettingsTab />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mb-4 opacity-20" />
                        <p>Módulo de {activeMenuItem?.label} em desenvolvimento...</p>
                    </div>
                );
        }
    }, [activeMenuItem, activeTab, isLogged, navigate, navigateToProducts]);

    return (
        <div className="app-gradient-bg flex h-screen overflow-hidden">

            <aside className={`bg-card/95 border-r border-t-4 border-border border-t-uniyellow flex flex-col transition-all duration-300 ease-in-out shrink-0 z-10 backdrop-blur ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-16 flex items-center justify-center border-b border-border shrink-0">

                    <img
                        src={logoImg}
                        alt="Logo UniMarket"
                        className="w-7 h-7 shrink-0 object-contain"
                    />

                    {isSidebarOpen && (
                        <span className="font-semibold text-lg text-foreground ml-2 truncate transition-opacity duration-300">
                            UniMarket
                            <span className="ml-2 rounded-full bg-uniyellow/20 px-2 py-0.5 text-xs font-semibold text-primary">
                                Parceiro
                            </span>
                        </span>
                    )}
                </div>

                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                title={!isSidebarOpen ? item.label : undefined}
                                className={`w-full flex items-center cursor-pointer py-2.5 rounded-md transition-all duration-200 ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent hover:text-foreground'} ${isSidebarOpen ? 'px-3 justify-start' : 'px-0 justify-center'}`}
                            >
                                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'} ${isSidebarOpen ? 'mr-3' : ''}`} />
                                {isSidebarOpen && (
                                    <>
                                        <span className="text-sm font-medium truncate">{item.label}</span>
                                        {item.badge && (
                                            <Badge variant={isActive ? 'default' : 'secondary'} className="ml-auto h-5 px-1.5 py-0 text-xs">
                                                {item.badge}
                                            </Badge>
                                        )}
                                    </>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </aside>

            <div className="flex-1 flex flex-col min-w-0">
                <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card/95 px-4 shadow-sm backdrop-blur sm:px-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="rounded-full border-primary/15 bg-white/80 text-muted-foreground hover:border-primary/35 hover:text-primary dark:bg-white/10">
                            <Menu className="w-5 h-5" />
                        </Button>
                        <div className="hidden min-w-0 sm:block">
                            <p className="text-xs font-semibold uppercase text-primary">Central UniMarket</p>
                            <p className="truncate text-sm font-medium text-foreground">{activeMenuItem?.label}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="mr-2 hidden items-center rounded-full border border-primary/10 bg-white/70 px-3 py-1.5 text-sm text-muted-foreground dark:bg-white/10 md:flex">
                            <MapPin className="w-4 h-4 mr-1 text-primary" /> {locationLabel}
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-10 rounded-full border-primary/15 bg-white/80 py-1 pl-1.5 pr-2 hover:border-primary/35 dark:bg-white/10 sm:pr-3">
                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                                        <Store className="w-4 h-4 text-primary cursor-pointer" />
                                    </div>
                                    <span className="hidden max-w-32 truncate text-sm font-medium text-foreground lg:inline">
                                        {marketName}
                                    </span>
                                    <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground sm:block" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-1">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-medium text-foreground">{marketName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isLogged ? 'Gestão de preços' : 'Conta de visitante'}
                                    </p>
                                </div>
                                <DropdownMenuSeparator />

                                {/* Só mostra Configurações se estiver logado */}
                                {isLogged && (
                                    <>
                                        <DropdownMenuItem onClick={() => setActiveTab('settings')} className="cursor-pointer">
                                            <Settings className="w-4 h-4 mr-2" />Configurações
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                    </>
                                )}

                                <DropdownMenuItem onClick={() => logout()} className="text-destructive cursor-pointer">
                                    <LogOut className="w-4 h-4 mr-2" />
                                    {isLogged ? 'Sair' : 'Fazer Login'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}
