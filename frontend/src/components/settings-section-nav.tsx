import { cn } from '@/lib/utils'
import type { ComponentType } from 'react'

export interface SettingsSectionItem {
    description: string
    icon: ComponentType<{ className?: string }>
    id: string
    label: string
}

interface SettingsSectionNavProps {
    activeId: string
    ariaLabel: string
    className?: string
    items: SettingsSectionItem[]
    onChange: (id: string) => void
}

export function SettingsSectionNav({ activeId, ariaLabel, className, items, onChange }: SettingsSectionNavProps) {
    return (
        <nav
            aria-label={ariaLabel}
            className={cn(
                'rounded-lg border border-border bg-card/95 p-2 shadow-sm backdrop-blur',
                className,
            )}
        >
            <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
                {items.map((item) => {
                    const Icon = item.icon
                    const isActive = activeId === item.id

                    return (
                        <button
                            key={item.id}
                            type="button"
                            aria-current={isActive ? 'page' : undefined}
                            id={`${item.id}-tab`}
                            onClick={() => onChange(item.id)}
                            className={cn(
                                'group flex min-w-56 items-start gap-3 rounded-md border border-transparent p-3 text-left transition hover:border-border hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card lg:min-w-0',
                                isActive && 'border-primary/25 bg-primary/10 text-foreground shadow-sm',
                            )}
                        >
                            <span
                                className={cn(
                                    'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border bg-background text-muted-foreground transition',
                                    isActive && 'border-primary/25 bg-primary text-primary-foreground',
                                )}
                                aria-hidden="true"
                            >
                                <Icon className="h-4 w-4" />
                            </span>
                            <span className="min-w-0">
                                <span className={cn('block text-sm font-semibold text-foreground', !isActive && 'text-muted-foreground group-hover:text-foreground')}>
                                    {item.label}
                                </span>
                                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                                    {item.description}
                                </span>
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
