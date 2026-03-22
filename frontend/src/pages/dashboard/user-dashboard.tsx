import {
    Badge, Button, Card,
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    Input,
} from '@/components/ui';
import { useNavigate } from '@tanstack/react-router';
import {
    Bell,
    ChevronRight,
    List,
    LogOut,
    MapPin,
    Menu,
    Percent,
    Plus,
    Search,
    ShoppingCart,
    Sparkles,
    Star,
    Store,
    Tag,
    TrendingDown,
    User,
} from 'lucide-react';
import { useState } from 'react';

// mock data - produtos em destaque
const featuredProducts = [
    {
        id: 1,
        name: 'Arroz Branco Tio João 5kg',
        category: 'Alimentos Básicos',
        lowestPrice: 24.90,
        averagePrice: 29.90,
        savings: 16.7,
        markets: [
            { name: 'Supermercado Econômico', price: 24.90, distance: '0.5 km' },
            { name: 'Mercado da Família', price: 26.50, distance: '1.2 km' },
            { name: 'Super Compras', price: 29.90, distance: '2.0 km' },
        ],
    },
    {
        id: 2,
        name: 'Feijão Preto Camil 1kg',
        category: 'Alimentos Básicos',
        lowestPrice: 7.99,
        averagePrice: 9.50,
        savings: 15.9,
        markets: [
            { name: 'Mercado da Família', price: 7.99, distance: '1.2 km' },
            { name: 'Supermercado Econômico', price: 8.50, distance: '0.5 km' },
            { name: 'Super Compras', price: 9.90, distance: '2.0 km' },
        ],
    },
    {
        id: 3,
        name: 'Óleo de Soja Liza 900ml',
        category: 'Óleos e Azeites',
        lowestPrice: 6.49,
        averagePrice: 7.90,
        savings: 17.8,
        markets: [
            { name: 'Super Compras', price: 6.49, distance: '2.0 km' },
            { name: 'Supermercado Econômico', price: 7.20, distance: '0.5 km' },
            { name: 'Mercado da Família', price: 7.99, distance: '1.2 km' },
        ],
    },
    {
        id: 4,
        name: 'Macarrão Galo 500g',
        category: 'Massas',
        lowestPrice: 3.99,
        averagePrice: 4.80,
        savings: 16.9,
        markets: [
            { name: 'Supermercado Econômico', price: 3.99, distance: '0.5 km' },
            { name: 'Mercado da Família', price: 4.50, distance: '1.2 km' },
            { name: 'Super Compras', price: 4.99, distance: '2.0 km' },
        ],
    },
];

// promoções
const promotions = [
    {
        id: 1,
        market: 'Supermercado Econômico',
        discount: '30% OFF',
        product: 'Leite Integral Itambé 1L',
        validUntil: '2026-03-10',
    },
    {
        id: 2,
        market: 'Mercado da Família',
        discount: '2 por 1',
        product: 'Refrigerante Coca-Cola 2L',
        validUntil: '2026-03-08',
    },
    {
        id: 3,
        market: 'Super Compras',
        discount: '25% OFF',
        product: 'Frango Congelado 1kg',
        validUntil: '2026-03-09',
    },
];

// listas de compras
const shoppingLists = [
    {
        id: 1,
        name: 'Compras do Mês',
        items: 12,
        total: 289.50,
        savings: 45.20,
    },
    {
        id: 2,
        name: 'Feira da Semana',
        items: 8,
        total: 85.90,
        savings: 12.30,
    },
];

export function UserDashboard() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        navigate({ to: '/login' });
    };

    const userName = localStorage.getItem('userName') || 'Usuário';
    const totalSavings = shoppingLists.reduce((acc, list) => acc + list.savings, 0);

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50">

            <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">

                        <div className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-emerald-500 to-blue-600 p-2 rounded-xl shadow-md">
                                <ShoppingCart className="size-6 text-white" />
                            </div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                                UniMarket
                            </h1>
                        </div>


                        <div className="hidden md:flex flex-1 max-w-xl mx-8">
                            <div className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="Buscar produtos..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        </div>


                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="icon" className="relative">
                                <Bell className="size-5" />
                                <span className="absolute -top-1 -right-1 size-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    3
                                </span>
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon">
                                        <Menu className="size-5" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-56">
                                    <div className="flex items-center gap-3 p-2">
                                        <div className="size-10 bg-linear-to-br from-emerald-500 to-blue-600 rounded-full flex items-center justify-center">
                                            <User className="size-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm">{userName}</p>
                                            <p className="text-xs text-gray-500">Consumidor</p>
                                        </div>
                                    </div>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                        <User className="size-4 mr-2" />
                                        Meu Perfil
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                        <List className="size-4 mr-2" />
                                        Minhas Listas
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                                        <LogOut className="size-4 mr-2" />
                                        Sair
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </div>


                    <div className="md:hidden pb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Buscar produtos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 w-full"
                            />
                        </div>
                    </div>
                </div>
            </header>


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">
                        Olá, {userName}! 👋
                    </h2>
                    <p className="text-gray-600">
                        Bem-vindo ao seu painel de economia. Aqui você encontra as melhores ofertas!
                    </p>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="p-6 bg-linear-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <TrendingDown className="size-6" />
                            </div>
                            <Sparkles className="size-5 opacity-70" />
                        </div>
                        <p className="text-emerald-100 text-sm mb-1">Economia Total</p>
                        <p className="text-3xl font-bold">R$ {totalSavings.toFixed(2)}</p>
                        <p className="text-emerald-100 text-xs mt-2">↓ R$ 12,30 esta semana</p>
                    </Card>

                    <Card className="p-6 bg-linear-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <List className="size-6" />
                            </div>
                            <Tag className="size-5 opacity-70" />
                        </div>
                        <p className="text-blue-100 text-sm mb-1">Listas Ativas</p>
                        <p className="text-3xl font-bold">{shoppingLists.length}</p>
                        <p className="text-blue-100 text-xs mt-2">{shoppingLists.reduce((acc, l) => acc + l.items, 0)} itens no total</p>
                    </Card>

                    <Card className="p-6 bg-linear-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
                                <Percent className="size-6" />
                            </div>
                            <Star className="size-5 opacity-70" />
                        </div>
                        <p className="text-purple-100 text-sm mb-1">Promoções Ativas</p>
                        <p className="text-3xl font-bold">{promotions.length}</p>
                        <p className="text-purple-100 text-xs mt-2">Válidas até 10/03</p>
                    </Card>
                </div>


                <Card className="mb-8 overflow-hidden border-2 border-orange-200 bg-linear-to-r from-orange-50 to-amber-50">
                    <div className="p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Tag className="size-5 text-orange-600" />
                            <h3 className="text-xl font-bold text-gray-900">Promoções Imperdíveis 🔥</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {promotions.map((promo) => (
                                <div key={promo.id} className="bg-white rounded-lg p-4 shadow-sm border border-orange-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <Badge className="bg-orange-500 text-white hover:bg-orange-600">
                                            {promo.discount}
                                        </Badge>
                                        <MapPin className="size-4 text-gray-400" />
                                    </div>
                                    <p className="font-semibold text-gray-900 mb-1">{promo.product}</p>
                                    <p className="text-sm text-gray-600 mb-2">{promo.market}</p>
                                    <p className="text-xs text-gray-500">Válido até {new Date(promo.validUntil).toLocaleDateString('pt-BR')}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>


                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    <div className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-2xl font-bold text-gray-900">Produtos em Destaque</h3>
                            <Button variant="outline" size="sm">
                                Ver Todos
                                <ChevronRight className="size-4 ml-2" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {featuredProducts.map((product) => (
                                <Card
                                    key={product.id}
                                    className={`p-6 cursor-pointer transition-all duration-200 ${selectedProduct === product.id
                                        ? 'ring-2 ring-emerald-500 shadow-lg'
                                        : 'hover:shadow-md'
                                        }`}
                                    onClick={() => setSelectedProduct(selectedProduct === product.id ? null : product.id)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h4 className="font-bold text-gray-900">{product.name}</h4>
                                                <Badge variant="outline" className="text-xs">
                                                    {product.category}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 mb-3">
                                                <div>
                                                    <p className="text-xs text-gray-500">Menor Preço</p>
                                                    <p className="text-2xl font-bold text-emerald-600">
                                                        R$ {product.lowestPrice.toFixed(2)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 line-through">
                                                        Média: R$ {product.averagePrice.toFixed(2)}
                                                    </p>
                                                    <div className="flex items-center gap-1 text-emerald-600">
                                                        <TrendingDown className="size-4" />
                                                        <p className="text-sm font-semibold">
                                                            Economize {product.savings.toFixed(1)}%
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {selectedProduct === product.id && (
                                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
                                            <p className="text-sm font-semibold text-gray-700 mb-3">
                                                Onde comprar:
                                            </p>
                                            {product.markets.map((market, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <Store className="size-5 text-gray-400" />
                                                        <div>
                                                            <p className="font-semibold text-sm text-gray-900">
                                                                {market.name}
                                                            </p>
                                                            <div className="flex items-center gap-1 text-gray-500">
                                                                <MapPin className="size-3" />
                                                                <p className="text-xs">{market.distance}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold text-lg text-gray-900">
                                                            R$ {market.price.toFixed(2)}
                                                        </p>
                                                        {idx === 0 && (
                                                            <Badge className="bg-emerald-500 text-white text-xs mt-1">
                                                                Melhor Preço
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>


                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-gray-900">Minhas Listas</h3>
                            <Button size="sm" className="bg-linear-to-r from-emerald-500 to-blue-600">
                                <Plus className="size-4 mr-2" />
                                Nova
                            </Button>
                        </div>

                        <div className="space-y-4">
                            {shoppingLists.map((list) => (
                                <Card key={list.id} className="p-5 hover:shadow-md transition-shadow cursor-pointer">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 bg-emerald-100 rounded-lg">
                                                <List className="size-4 text-emerald-600" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900">{list.name}</h4>
                                                <p className="text-xs text-gray-500">{list.items} itens</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-600">Total</p>
                                            <p className="font-bold text-gray-900">R$ {list.total.toFixed(2)}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-emerald-600">Economia</p>
                                            <p className="font-bold text-emerald-600">R$ {list.savings.toFixed(2)}</p>
                                        </div>
                                    </div>
                                    <Button className="w-full mt-4" variant="outline" size="sm">
                                        Ver Detalhes
                                    </Button>
                                </Card>
                            ))}

                            <Card className="p-6 bg-linear-to-br from-blue-50 to-emerald-50 border-2 border-dashed border-blue-200">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center size-12 bg-blue-100 rounded-full mb-3">
                                        <Plus className="size-6 text-blue-600" />
                                    </div>
                                    <p className="font-semibold text-gray-900 mb-2">
                                        Crie sua primeira lista!
                                    </p>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Compare preços e economize nas suas compras
                                    </p>
                                    <Button className="bg-linear-to-r from-emerald-500 to-blue-600">
                                        Começar Agora
                                    </Button>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-emerald-200">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-emerald-100 rounded-xl">
                                <Search className="size-8 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Buscar Produtos</h4>
                                <p className="text-sm text-gray-600">
                                    Encontre os melhores preços em todos os supermercados
                                </p>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 border-transparent hover:border-blue-200">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-blue-100 rounded-xl">
                                <Store className="size-8 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 mb-1">Ver Supermercados</h4>
                                <p className="text-sm text-gray-600">
                                    Confira todos os estabelecimentos próximos a você
                                </p>
                            </div>
                        </div>
                    </Card>
                </div>
            </main>
        </div>
    );
}
