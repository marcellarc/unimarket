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
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-medium text-foreground">{m.value}%</span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${m.value}%` }}
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}