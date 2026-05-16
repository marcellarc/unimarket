import {
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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Textarea,
} from '@/components/ui'
import { createProduct, listCategories, lookupProductByBarcode } from '@/services/product'
import type { CategoryResponse } from '@/types/product'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Barcode, Boxes, CircleDollarSign, Loader2, Plus } from 'lucide-react'
import { type ReactNode, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { marketProductSchema, type MarketProductFormData } from '../-components/schemas'

interface ProductFormDialogProps {
    marketId: number
}

const initialValues: MarketProductFormData = {
    productName: '',
    brand: '',
    categoryId: 0,
    barCode: '',
    description: '',
    imageUrl: '',
    price: 0,
    stockQuantity: 0,
}

export function ProductFormDialog({ marketId }: ProductFormDialogProps) {
    const [open, setOpen] = useState(false)
    const [lookupMessage, setLookupMessage] = useState<string | null>(null)
    const queryClient = useQueryClient()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<MarketProductFormData>({
        resolver: zodResolver(marketProductSchema),
        defaultValues: initialValues,
    })

    const {
        data: categories = [],
        isLoading: isLoadingCategories,
        isError: hasCategoryError,
    } = useQuery({
        queryKey: ['categories'],
        queryFn: listCategories,
        enabled: open,
    })

    const selectedCategoryId = watch('categoryId')
    const selectedCategory = categories.find((category) => category.id === selectedCategoryId)
    const barCodeField = register('barCode')
    const imageUrl = watch('imageUrl')
    const productName = watch('productName')
    const brand = watch('brand')
    const normalizedBarCode = (watch('barCode') || '').replace(/\D/g, '').slice(0, 14)

    useEffect(() => {
        if (open && !selectedCategoryId && categories.length > 0) {
            setValue('categoryId', categories[0].id, { shouldValidate: true })
        }
    }, [categories, open, selectedCategoryId, setValue])

    const lookupMutation = useMutation({
        mutationFn: lookupProductByBarcode,
        onSuccess: (product) => {
            setValue('productName', product.productName || '', { shouldDirty: true, shouldValidate: true })
            setValue('brand', product.brand || '', { shouldDirty: true, shouldValidate: true })
            setValue('description', product.description || '', { shouldDirty: true })
            setValue('imageUrl', product.imageUrl || '', { shouldDirty: true, shouldValidate: true })

            if (product.averagePrice && product.averagePrice > 0) {
                setValue('price', product.averagePrice, { shouldDirty: true, shouldValidate: true })
            }

            setLookupMessage('Dados do produto preenchidos automaticamente. Revise categoria, preço e estoque antes de salvar.')
            toast.success('Produto encontrado no catálogo.')
        },
        onError: () => {
            setLookupMessage('Não encontramos esse código. Preencha os dados manualmente para cadastrar.')
            toast.info('Cadastro manual disponível.')
        },
    })

    const { mutate, isPending } = useMutation({
        mutationFn: (data: MarketProductFormData) => createProduct(marketId, {
            ...data,
            productName: data.productName.trim(),
            brand: data.brand.trim(),
            barCode: data.barCode ? data.barCode.replace(/\D/g, '') : undefined,
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products', marketId] })
            queryClient.invalidateQueries({ queryKey: ['searchProductsByMarketId', marketId] })
            reset(initialValues)
            setLookupMessage(null)
            setOpen(false)
            toast.success('Produto cadastrado com sucesso.')
        },
        onError: (error) => {
            console.error('Erro ao criar produto:', error)
            toast.error(error instanceof Error ? error.message : 'Erro ao cadastrar produto.')
        },
    })

    function handleLookup() {
        if (normalizedBarCode.length < 8) {
            setLookupMessage('Digite ao menos 8 números do código de barras para buscar.')
            return
        }

        setLookupMessage(null)
        lookupMutation.mutate(normalizedBarCode)
    }

    function handleOpenChange(nextOpen: boolean) {
        setOpen(nextOpen)
        if (!nextOpen) {
            setLookupMessage(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button className="cursor-pointer">
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">Adicionar item</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Novo produto no estoque</DialogTitle>
                    <DialogDescription>
                        Cadastre o item com categoria, preço e saldo inicial.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit((data) => mutate(data))} className="space-y-4">
                    <div className="grid grid-cols-1 gap-3 rounded-lg border border-border bg-muted/30 p-4 md:grid-cols-[1fr_auto] md:items-end">
                        <Field label="Código de barras" error={errors.barCode?.message} hint="Use de 8 a 14 dígitos">
                            <Input
                                inputMode="numeric"
                                maxLength={14}
                                placeholder="7891234567890"
                                {...barCodeField}
                                onChange={(event) => {
                                    event.target.value = event.target.value.replace(/\D/g, '').slice(0, 14)
                                    barCodeField.onChange(event)
                                }}
                            />
                        </Field>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleLookup}
                            disabled={lookupMutation.isPending || normalizedBarCode.length < 8}
                            className="md:mb-[1.45rem]"
                        >
                            {lookupMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            Buscar dados
                        </Button>
                        {lookupMessage && (
                            <p className="text-xs leading-relaxed text-muted-foreground md:col-span-2">
                                {lookupMessage}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Nome do produto *" error={errors.productName?.message}>
                            <Input placeholder="Arroz Branco 5kg" {...register('productName')} />
                        </Field>
                        <Field label="Marca *" error={errors.brand?.message}>
                            <Input placeholder="Tio João" {...register('brand')} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Categoria *" error={errors.categoryId?.message}>
                            <CategorySelect
                                categories={categories}
                                disabled={isLoadingCategories || hasCategoryError || categories.length === 0}
                                error={hasCategoryError}
                                loading={isLoadingCategories}
                                selectedCategory={selectedCategory}
                                value={selectedCategoryId}
                                onChange={(categoryId) => setValue('categoryId', categoryId, { shouldDirty: true, shouldTouch: true, shouldValidate: true })}
                            />
                        </Field>
                        <Field label="URL da imagem" error={errors.imageUrl?.message}>
                            <Input type="url" placeholder="https://exemplo.com/imagem.jpg" {...register('imageUrl')} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-1 gap-4 rounded-lg border border-border bg-card p-4 md:grid-cols-2">
                        <Field label="Preço de venda *" error={errors.price?.message}>
                            <div className="relative">
                                <CircleDollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0,00"
                                    className="pl-9"
                                    {...register('price', { valueAsNumber: true })}
                                />
                            </div>
                        </Field>
                        <Field label="Estoque inicial *" error={errors.stockQuantity?.message}>
                            <div className="relative">
                                <Boxes className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    className="pl-9"
                                    {...register('stockQuantity', { valueAsNumber: true })}
                                />
                            </div>
                        </Field>
                    </div>

                    <Field label="Descrição">
                        <Textarea placeholder="Descrição do produto..." rows={3} {...register('description')} />
                    </Field>

                    {(imageUrl || productName || brand || normalizedBarCode) && (
                        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/20 p-3">
                            {imageUrl ? (
                                <img src={imageUrl} alt="" className="h-16 w-16 rounded-md border border-border object-cover" />
                            ) : (
                                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-md border border-border bg-background text-muted-foreground">
                                    <Barcode className="h-5 w-5" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-foreground">
                                    {productName || 'Prévia do produto'}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {[brand, selectedCategory?.name].filter(Boolean).join(' • ') || 'Marca e categoria aparecerão aqui'}
                                </p>
                                {normalizedBarCode && (
                                    <p className="mt-1 text-xs tabular-nums text-muted-foreground">
                                        Código {normalizedBarCode}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {hasCategoryError && (
                        <p className="rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                            Não foi possível carregar as categorias. Tente novamente em instantes.
                        </p>
                    )}

                    <DialogFooter className="gap-2 pt-2">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={isPending || isLoadingCategories || categories.length === 0}>
                            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                            {isPending ? 'Cadastrando...' : 'Cadastrar item'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

function CategorySelect({
    categories,
    disabled,
    error,
    loading,
    selectedCategory,
    value,
    onChange,
}: {
    categories: CategoryResponse[]
    disabled: boolean
    error: boolean
    loading: boolean
    selectedCategory?: CategoryResponse
    value: number
    onChange: (categoryId: number) => void
}) {
    const label = loading
        ? 'Carregando categorias...'
        : error
            ? 'Erro ao carregar'
            : selectedCategory?.name || 'Selecione a categoria'

    return (
        <Select
            disabled={disabled}
            value={value ? String(value) : undefined}
            onValueChange={(nextValue) => onChange(Number(nextValue))}
        >
            <SelectTrigger aria-label="Selecionar categoria">
                <SelectValue placeholder={label} />
            </SelectTrigger>
            <SelectContent className="z-[90]">
                {loading ? (
                    <SelectItem value="loading" disabled>
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            Carregando categorias...
                        </span>
                    </SelectItem>
                ) : categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    )
}

function Field({
    label, error, hint, children,
}: {
    label: string
    error?: string
    hint?: string
    children: ReactNode
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
