import { useState } from 'react';
import { Search, Trash2, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { Badge, Button, Card, Input, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { listProducts, searchProductsByMarketId } from '@/services/product';
import { ProductFormDialog } from '@/pages/dashboard/product-form-dialog';
import { EditProductDialog } from '@/pages/dashboard/edit-product-dialog';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '—';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '—';
        return date.toLocaleDateString('pt-BR', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
        });
    } catch { return '—'; }
};

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
        refetch,
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
    const filteredProducts = displayProducts.filter((product) =>
        selectedCategory === 'all' || product.brand === selectedCategory
    );

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
        <div className="space-y-5">
            {/* Cabeçalho */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Meus Preços</h2>
                    <p className="text-sm text-muted-foreground">
                        {products.length} produto{products.length !== 1 ? 's' : ''} cadastrado{products.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar produto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 bg-card focus-visible:ring-primary"
                        />
                    </div>
                    {/* Botão de adicionar — cursor-pointer via className no próprio componente */}
                    <ProductFormDialog marketId={marketId} />
                </div>
            </div>

            {/* Filtros de categoria */}
            {categories.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`cursor-pointer px-3 py-1 text-xs rounded-md border transition-colors ${selectedCategory === cat
                                    ? 'bg-primary text-primary-foreground border-primary'
                                    : 'bg-card text-muted-foreground border-border hover:border-foreground/30 hover:text-foreground'
                                }`}
                        >
                            {cat === 'all' ? `Todos (${products.length})` : cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Tabela */}
            <Card className="overflow-hidden">
                {isLoading || isSearching ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-6 h-6 text-muted-foreground animate-spin" />
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/40 hover:bg-muted/40">
                                <TableHead className="text-xs font-semibold text-foreground/60 uppercase tracking-wide pl-5">Produto</TableHead>
                                <TableHead className="hidden md:table-cell text-xs font-semibold text-foreground/60 uppercase tracking-wide">Marca</TableHead>
                                <TableHead className="text-xs font-semibold text-foreground/60 uppercase tracking-wide">Preço</TableHead>
                                <TableHead className="hidden sm:table-cell text-xs font-semibold text-foreground/60 uppercase tracking-wide">Estoque</TableHead>
                                <TableHead className="hidden md:table-cell text-xs font-semibold text-foreground/60 uppercase tracking-wide text-right">Atualizado em</TableHead>
                                <TableHead className="text-xs font-semibold text-foreground/60 uppercase tracking-wide text-right pr-5">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredProducts.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-16">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Search className="w-8 h-8 opacity-20" />
                                            <p className="text-sm">
                                                {searchQuery
                                                    ? `Nenhum resultado para "${searchQuery}"`
                                                    : 'Nenhum produto cadastrado ainda'}
                                            </p>
                                            {!searchQuery && (
                                                <ProductFormDialog marketId={marketId} />
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProducts.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="pl-5">
                                            <div>
                                                <p className="text-sm font-medium text-foreground leading-tight">
                                                    {product.productName}
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                    {product.marketName}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant="secondary" className="font-normal">
                                                {product.brand}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm font-bold text-foreground tabular-nums">
                                                R$ {(product.price || 0).toFixed(2)}
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <span className={`text-sm tabular-nums ${(product.stockQuantity || 0) <= 5 ? 'text-destructive font-medium' : 'text-foreground'}`}>
                                                {product.stockQuantity || 0} un.
                                            </span>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell text-right">
                                            <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                                                <Clock className="w-3 h-3" />
                                                <span className="text-xs tabular-nums">
                                                    {formatDate(product.updatedAt)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="pr-5">
                                            <div className="flex items-center justify-end gap-1">
                                                <EditProductDialog product={product} marketId={marketId} onSuccess={refetch} />
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="w-8 h-8 cursor-pointer text-muted-foreground hover:text-destructive hover:bg-transparent"
                                                    title="Deletar produto"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                )}
            </Card>

            {/* Rodapé com contagem */}
            {filteredProducts.length > 0 && (
                <p className="text-xs text-muted-foreground text-right">
                    Exibindo {filteredProducts.length} de {products.length} produto{products.length !== 1 ? 's' : ''}
                </p>
            )}
        </div>
    );
}
