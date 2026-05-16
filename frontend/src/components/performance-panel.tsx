interface Metric {
    label: string;
    value: number;
}

interface PerformancePanelProps {
    metrics: Metric[];
}

export function PerformancePanel({ metrics }: PerformancePanelProps) {
    return (
        <div className="space-y-4">
            {metrics.map((m) => (
                <div key={m.label}>
                    <div className="mb-1.5 flex justify-between gap-3 text-sm">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-medium tabular-nums text-foreground">{m.value}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                        <div
                            className="h-full rounded-full bg-primary transition-all"
                            style={{ width: `${m.value}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
