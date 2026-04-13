import { useState } from 'react';
import { Search, Trash2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Badge, Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { listProducts, searchProductsByMarketId } from '@/services/product';
import { ProductFormDialog } from '@/pages/dashboard/product-form-dialog';
import { EditProductDialog } from '@/pages/dashboard/edit-product-dialog';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';

export function ProductsTab() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    const marketIdStr = Cookies.get('marketId');
    const marketId = marketIdStr ? parseInt(marketIdStr) : 0;


    const {
        data: products = [],
        isLoading,
        isError,
        error,
        refetch
    } = useQuery({
        queryKey: ['products', marketId],
        queryFn: () => listProducts(marketId),
        enabled: !!marketId,
    });

    const {
        data: searchedProducts = [],
        isLoading: isSearching,
    } = useQuery({
        queryKey: ['searchProductsByMarketId', marketId, searchQuery],
        queryFn: () => searchProductsByMarketId(marketId, { name: searchQuery }),
        enabled: searchQuery.length > 0 && !!marketId,
    });

    const categories = ['all', ...new Set(products.map((p) => p.brand).filter(Boolean))];

    const displayProducts = searchQuery.length > 0 ? searchedProducts : products;

    const filteredProducts = displayProducts.filter((product) => {
        const matchesCategory = selectedCategory === 'all' || product.brand === selectedCategory;
        return matchesCategory;
    });

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-destructive/10 p-4 rounded-full mb-4">
                    <AlertCircle className="w-10 h-10 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Erro ao carregar produtos</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                    {error instanceof Error ? error.message : 'Falha na conexão'}
                </p>
                <Button onClick={() => refetch()}>Tentar Novamente</Button>
            </div>
        );
    }

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
                            className="pl-9 bg-card focus-visible:ring-primary"
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

                <ProductFormDialog marketId={marketId} />
            </div>

            <Card>
                {isLoading || isSearching ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Produto</TableHead>
                                <TableHead className="hidden md:table-cell">Marca</TableHead>
                                <TableHead>Seu Preço</TableHead>
                                <TableHead className="hidden sm:table-cell">Estoque</TableHead>
                                <TableHead className="hidden md:table-cell text-right">Última Atualização</TableHead>
                                <TableHead className="w-20">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
                                        <p className="text-muted-foreground">Nenhum produto encontrado</p>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => {
                                    const formatDate = (dateString: string) => {
                                        try {
                                            const date = new Date(dateString);
                                            return date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                                        } catch {
                                            return dateString;
                                        }
                                    };

                                    return (
                                        <TableRow key={product.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="text-sm font-medium text-foreground">{product.productName}</p>
                                                    <p className="text-xs text-muted-foreground">{product.marketName}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell">
                                                <Badge variant="secondary">{product.brand}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <p className="text-sm font-bold text-foreground">
                                                    R$ {(product.price || 0).toFixed(2)}
                                                </p>
                                            </TableCell>
                                            <TableCell className="hidden sm:table-cell">
                                                <p className="text-sm text-foreground">{product.stockQuantity || 0} un.</p>
                                            </TableCell>
                                            <TableCell className="hidden md:table-cell text-right">
                                                <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-xs">{formatDate(product.updatedAt)}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-1">
                                                    <EditProductDialog
                                                        product={product}
                                                        marketId={marketId}
                                                    />
                                                    <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive hover:text-destructive" title="Deletar">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                )}
            </Card>
        </div>
    );
}