import {
    Button, Dialog, DialogContent, DialogDescription,
    DialogHeader, DialogTitle, DialogTrigger, Input, Label, Textarea,
} from '@/components/ui'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { marketProductSchema, type MarketProductFormData } from '../-components/schemas'
import { createProduct } from '@/services/product'

interface ProductFormDialogProps {
    marketId: number
}

export function ProductFormDialog({ marketId }: ProductFormDialogProps) {
    const [open, setOpen] = useState(false)
    const queryClient = useQueryClient()

    const { register, handleSubmit, reset, formState: { errors } } = useForm<MarketProductFormData>({
        resolver: zodResolver(marketProductSchema),
        defaultValues: { productName: '', brand: '', categoryId: 1, barCode: '', description: '', imageUrl: '' },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (data: MarketProductFormData) => createProduct(marketId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', marketId] })
            reset()
            setOpen(false)
        },
        onError: (error) => {
            console.error('Erro ao criar produto:', error)
        },
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Novo Produto</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Cadastrar Produto</DialogTitle>
                    <DialogDescription>
                        Adicione um produto ao catálogo e defina preço e estoque
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(data => mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Nome *" error={errors.productName?.message}>
                            <Input placeholder="Arroz Branco 5kg" {...register('productName')} />
                        </Field>
                        <Field label="Marca *" error={errors.brand?.message}>
                            <Input placeholder="Tio João" {...register('brand')} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Código de Barras" error={errors.barCode?.message} hint="Opcional — 13 dígitos">
                            <Input placeholder="1234567890123" {...register('barCode')} />
                        </Field>
                        <Field label="Categoria *" error={errors.categoryId?.message}>
                            <select
                                className="w-full px-3 py-2 bg-background border border-input rounded-md text-sm"
                                {...register('categoryId', { valueAsNumber: true })}
                            >
                                <option value={1}>Alimentos Básicos</option>
                                <option value={2}>Óleos e Azeites</option>
                                <option value={3}>Bebidas</option>
                                <option value={4}>Higiene e Limpeza</option>
                                <option value={5}>Lácteos</option>
                                <option value={6}>Carnes</option>
                                <option value={7}>Frutas e Verduras</option>
                                <option value={8}>Secos e Grãos</option>
                            </select>
                        </Field>
                    </div>

                    {/* Preço e estoque — específicos do mercado 
                    <div className="grid grid-cols-2 gap-4 p-3 bg-muted rounded-lg">
                        <Field label="Preço (R$) *" error={errors.price?.message}>
                            <Input type="number" step="0.01" min="0" placeholder="0,00" {...register('price', { valueAsNumber: true })} />
                        </Field>
                        <Field label="Estoque *" error={errors.stockQuantity?.message}>
                            <Input type="number" min="0" placeholder="0" {...register('stockQuantity', { valueAsNumber: true })} />
                        </Field>
                    </div>*/}

                    <Field label="URL da Imagem" error={errors.imageUrl?.message}>
                        <Input type="url" placeholder="https://exemplo.com/imagem.jpg" {...register('imageUrl')} />
                    </Field>

                    <Field label="Descrição">
                        <Textarea placeholder="Descrição do produto..." rows={3} {...register('description')} />
                    </Field>

                    <div className="flex gap-3 justify-end pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                            {isPending ? 'Criando...' : 'Criar Produto'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}


function Field({
    label, error, hint, children,
}: {
    label: string
    error?: string
    hint?: string
    children: React.ReactNode
}) {
    return (
        <div className="space-y-1">
            <Label className="text-xs font-semibold">{label}</Label>
            {children}
            {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    )
}