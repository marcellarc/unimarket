import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon?: LucideIcon;
    label: string;
    value: string;
    detail: string;
    tone?: 'default' | 'warning' | 'success';
}

const toneClass = {
    default: 'border-border bg-card/95',
    warning: 'border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/20',
    success: 'border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/20',
} as const

export function StatCard({ icon: Icon, label, value, detail, tone = 'default' }: StatCardProps) {
    return (
        <div className={`rounded-lg border p-4 shadow-sm backdrop-blur ${toneClass[tone]}`}>
            <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
            </div>
            <p className="text-2xl font-semibold tracking-tight text-foreground tabular-nums">{value}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{detail}</p>
        </div>
    );
}
