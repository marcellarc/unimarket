import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react'
import {
    Badge,
    Button,
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    Input,
    Label,
} from '@/components/ui'
import { Barcode, Boxes, CircleDollarSign, Edit, Loader2, Package } from 'lucide-react'
import { updateProductPriceAndStock } from '@/services/product'
import type { MarketProductResponse } from '@/types/product'
import { toast } from 'sonner'

interface EditProductDialogProps {
    product: MarketProductResponse
    marketId: number
    onSuccess?: () => void
}

export function EditProductDialog({ product, marketId, onSuccess }: EditProductDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        price: product.price ?? 0,
        stockQuantity: product.stockQuantity ?? 0,
    })

    const inventoryValue = useMemo(
        () => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
            (formData.price || 0) * (formData.stockQuantity || 0),
        ),
        [formData.price, formData.stockQuantity],
    )

    useEffect(() => {
        if (!open) return

        setFormData({
            price: product.price ?? 0,
            stockQuantity: product.stockQuantity ?? 0,
        })
    }, [open, product.price, product.stockQuantity])

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target

        setFormData((current) => ({
            ...current,
            [name]: name === 'price'
                ? Number(value || 0)
                : Math.max(0, Number.parseInt(value || '0', 10)),
        }))
    }

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        if (formData.price <= 0) {
            toast.error('Informe um preço de venda maior que zero.')
            return
        }

        if (formData.stockQuantity < 0) {
            toast.error('O estoque não pode ser negativo.')
            return
        }

        try {
            setLoading(true)
            await updateProductPriceAndStock(marketId, product.productId, formData)
            setOpen(false)
            onSuccess?.()
            toast.success('Preço e estoque atualizados.')
        } catch (error) {
            console.error('Erro ao atualizar produto:', error)
            toast.error(error instanceof Error ? error.message : 'Erro ao atualizar produto.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Editar preço e estoque"
                    aria-label={`Editar ${product.productName}`}
                >
                    <Edit className="h-3.5 w-3.5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>Atualizar estoque e preço</DialogTitle>
                    <DialogDescription>
                        Ajuste o preço de venda e o saldo disponível deste produto no mercado.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    <div className="flex min-w-0 items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                        {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-md border border-border object-cover" />
                        ) : (
                            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                                <Package className="h-5 w-5" />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <div className="flex min-w-0 flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2">
                                <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{product.productName}</p>
                                {product.categoryName && (
                                    <Badge variant="secondary" className="w-fit max-w-full truncate font-normal">
                                        {product.categoryName}
                                    </Badge>
                                )}
                            </div>
                            <p className="mt-1 break-words text-xs text-muted-foreground">
                                {[product.brand, product.barCode ? `EAN ${product.barCode}` : null].filter(Boolean).join(' • ') || 'Produto do catálogo'}
                            </p>
                        </div>
                    </div>

                    <div className="grid min-w-0 gap-3 sm:grid-cols-2 sm:gap-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="price">Preço (R$)</Label>
                            <div className="relative">
                                <CircleDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="price"
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="stockQuantity">Estoque</Label>
                            <div className="relative">
                                <Boxes className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    id="stockQuantity"
                                    name="stockQuantity"
                                    type="number"
                                    min="0"
                                    value={formData.stockQuantity}
                                    onChange={handleInputChange}
                                    className="pl-9"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid min-w-0 gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Barcode className="h-4 w-4 text-primary" />
                            <span className="min-w-0 truncate">{product.barCode || 'Sem código de barras'}</span>
                        </div>
                        <div className="min-w-0 text-sm sm:text-right">
                            <span className="text-muted-foreground">Valor em estoque: </span>
                            <span className="break-words font-semibold tabular-nums text-foreground">{inventoryValue}</span>
                        </div>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
