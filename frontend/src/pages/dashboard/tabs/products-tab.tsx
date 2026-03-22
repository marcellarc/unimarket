import { useState } from 'react';
import { Search, Plus, Edit, Trash2, Clock, ListPlus } from 'lucide-react';
import { Badge, Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';

const marketProducts = [
    { id: 1, name: 'Arroz Branco Tio João 5kg', category: 'Alimentos Básicos', price: 24.90, averageMarketPrice: 29.90, inLists: 145, lastUpdated: 'Hoje, 08:30' },
    { id: 2, name: 'Feijão Preto Camil 1kg', category: 'Alimentos Básicos', price: 8.50, averageMarketPrice: 9.50, inLists: 98, lastUpdated: 'Ontem, 18:00' },
    { id: 3, name: 'Óleo de Soja Liza 900ml', category: 'Óleos e Azeites', price: 7.20, averageMarketPrice: 7.00, inLists: 67, lastUpdated: 'Há 3 dias' },
];

export function ProductsTab() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const categories = ['all', ...new Set(marketProducts.map((p) => p.category))];

    const filteredProducts = marketProducts.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Atualização de Preços</h2>
                    <p className="text-sm text-muted-foreground">Mantenha seus preços competitivos na plataforma.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar produto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-card"
                        />
                    </div>
                </div>
            </div>

            <div className="flex gap-1.5 flex-wrap">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 text-xs rounded-md border transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-foreground/20'
                            }`}
                    >
                        {cat === 'all' ? 'Todos' : cat}
                    </button>
                ))}
                <Button size="sm" className="ml-auto">
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Atualizar Preço / Novo Produto</span>
                </Button>
            </div>

            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead className="hidden md:table-cell">Categoria</TableHead>
                            <TableHead>Seu Preço</TableHead>
                            <TableHead className="hidden sm:table-cell">Competitividade</TableHead>
                            <TableHead className="hidden sm:table-cell text-center">Nas Listas</TableHead>
                            <TableHead className="hidden md:table-cell text-right">Última Atualização</TableHead>
                            <TableHead className="w-20">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProducts.map((product) => {
                            const isCompetitive = product.price <= product.averageMarketPrice;
                            const priceDiff = ((product.averageMarketPrice - product.price) / product.averageMarketPrice) * 100;

                            return (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <Badge variant="secondary">{product.category}</Badge>
                                    </TableCell>
                                    <TableCell>
                                        <p className="text-sm font-bold text-foreground">R$ {product.price.toFixed(2)}</p>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <p className={`text-xs font-medium ${isCompetitive ? 'text-success' : 'text-destructive'}`}>
                                            {isCompetitive ? '↓' : '↑'} {Math.abs(priceDiff).toFixed(1)}% {isCompetitive ? 'abaixo da média' : 'acima da média'}
                                        </p>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell text-center">
                                        <div className="flex items-center justify-center gap-1.5 text-muted-foreground">
                                            <ListPlus className="w-3.5 h-3.5" />
                                            <span className="text-sm">{product.inLists}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span className="text-xs">{product.lastUpdated}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-1">
                                            <Button variant="ghost" size="icon" className="w-8 h-8">
                                                <Edit className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="w-8 h-8">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}