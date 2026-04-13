import logoImg from '@/assets/logo-unimarket.png';
import {
    Badge, Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui';
import { useNavigate } from '@tanstack/react-router';
import {
    BarChart3,
    LayoutDashboard, LogOut,
    MapPin,
    Menu,
    MessageSquare,
    Package,
    Settings,
    Store,
    User,
    Lock
} from 'lucide-react';
import { useState } from 'react';
import { OverviewTab, ProductsTab, ReviewsTab, SettingsTab } from './tabs';
import { useLogout } from '@/hooks/use-logout';
import Cookies from 'js-cookie'

type TabType = 'overview' | 'products' | 'reviews' | 'competitors' | 'reports' | 'settings';

interface MenuItem {
    id: TabType;
    label: string;
    icon: any;
    badge?: number;
}

const menuItems: MenuItem[] = [
    { id: 'overview', label: 'Visão Geral', icon: LayoutDashboard },
    { id: 'products', label: 'Meus Preços', icon: Package },
    { id: 'reviews', label: 'Avaliações', icon: MessageSquare, badge: 5 },
    { id: 'competitors', label: 'Concorrência', icon: Store },
    { id: 'reports', label: 'Relatórios de Buscas', icon: BarChart3 },
    { id: 'settings', label: 'Configurações', icon: Settings },
];

export default function MarketDashboard() {
    const navigate = useNavigate();
    const { logout } = useLogout()
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const isLogged = Cookies.get('accessToken') !== undefined;
    const marketName = Cookies.get('marketName') || 'Visitante';

    const renderContent = () => {
        if (!isLogged && (activeTab === 'products' || activeTab === 'settings')) {
            return (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <Lock className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground mb-2">Acesso Restrito</h2>
                    <p className="text-muted-foreground mb-6 max-w-md">
                        A aba de {menuItems.find(m => m.id === activeTab)?.label} é exclusiva para supermercados parceiros. Faça login para gerenciar sua loja.
                    </p>
                    <Button onClick={() => navigate({ to: '/login' })}>
                        Fazer Login
                    </Button>
                </div>
            );
        }


        switch (activeTab) {
            case 'overview': return <OverviewTab onNavigateToProducts={() => setActiveTab('products')} />;
            case 'products': return <ProductsTab />;
            case 'reviews': return <ReviewsTab />;
            case 'settings': return <SettingsTab />;
            default:
                return (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        <Package className="w-12 h-12 mb-4 opacity-20" />
                        <p>Módulo de {menuItems.find(m => m.id === activeTab)?.label} em desenvolvimento...</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden">

            <aside className={`bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out shrink-0 z-10 ${isSidebarOpen ? 'w-64' : 'w-20'}`}>
                <div className="h-14 flex items-center justify-center border-b border-border shrink-0">

                    <img
                        src={logoImg}
                        alt="Logo UniMarket"
                        className="w-7 h-7 shrink-0 object-contain"
                    />

                    {isSidebarOpen && (
                        <span className="font-semibold text-lg text-foreground ml-2 truncate transition-opacity duration-300">
                            UniMarket
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
                                            <Badge variant={isActive ? 'default' : 'secondary'} className="ml-auto text-[10px] px-1.5 py-0 h-5">
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
                <header className="h-14 bg-card border-b border-border flex items-center justify-between px-4 sm:px-6 shrink-0">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="cursor-pointer text-muted-foreground hover:text-foreground">
                            <Menu className="w-5 h-5" />
                        </Button>
                        <span className="text-sm text-muted-foreground hidden sm:inline-flex items-center gap-2">
                            Painel <span className="text-border">/</span> <span className="text-foreground font-medium">{menuItems.find(m => m.id === activeTab)?.label}</span>
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:flex items-center mr-4 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 mr-1 text-primary" /> Santos, SP
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="relative h-8 w-8 rounded-full cursor-pointer">
                                    <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10">
                                        <User className="w-4 h-4 text-primary cursor-pointer" />
                                    </div>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-1">
                                <div className="px-3 py-2">
                                    <p className="text-sm font-medium text-foreground">{marketName}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {isLogged ? 'Gestão de Preços' : 'Conta de Visitante'}
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

                <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 lg:p-8">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {renderContent()}
                    </div>
                </main>
            </div>
        </div>
    );
}