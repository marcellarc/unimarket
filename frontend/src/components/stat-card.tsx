import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    icon: LucideIcon;
    label: string;
    value: string;
    detail: string;
}

export function StatCard({ icon: Icon, label, value, detail }: StatCardProps) {
    return (
        <div className="bg-card border border-border rounded-md p-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                    <Icon className="w-4 h-4 text-muted-foreground" />
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
            </div>
            <p className="text-2xl font-semibold text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{detail}</p>
        </div>
    );
}