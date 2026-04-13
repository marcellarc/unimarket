import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/index';
import { Button, Input, Label } from '@/components/ui';
import { Edit, Loader2 } from 'lucide-react';
import { updateProductPriceAndStock } from '@/services/product';
import type { MarketProductResponse } from '@/types/product';

interface EditProductDialogProps {
    product: MarketProductResponse;
    marketId: number;
    onSuccess?: () => void;
}

export function EditProductDialog({ product, marketId, onSuccess }: EditProductDialogProps) {
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        price: product.price,
        stockQuantity: product.stockQuantity,
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'price' ? parseFloat(value) : parseInt(value),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setLoading(true);
            await updateProductPriceAndStock(marketId, product.id, formData);
            setOpen(false);
            onSuccess?.();
        } catch (error) {
            console.error('Erro ao atualizar produto:', error);
            alert(error instanceof Error ? error.message : 'Erro ao atualizar produto');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="w-8 h-8" title="Editar">
                    <Edit className="w-3.5 h-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Atualizar Preço e Estoque</DialogTitle>
                    <DialogDescription>
                        {product.productName}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="price">Preço (R$)</Label>
                        <Input
                            id="price"
                            name="price"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="mt-1.5"
                            required
                        />
                    </div>

                    <div>
                        <Label htmlFor="stockQuantity">Quantidade em Estoque</Label>
                        <Input
                            id="stockQuantity"
                            name="stockQuantity"
                            type="number"
                            min="0"
                            value={formData.stockQuantity}
                            onChange={handleInputChange}
                            className="mt-1.5"
                            required
                        />
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {loading ? 'Atualizando...' : 'Atualizar'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
