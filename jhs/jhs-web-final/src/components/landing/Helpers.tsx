import { cn } from "@/lib/utils";

export function GoldenDivider({ className }: { className?: string }) {
    return (
        <div className={cn("flex items-center justify-center gap-4 my-6", className)}>
            {/* Usamos gradient hacia el color secondary (dorado) */}
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-secondary" />
            <span className="text-secondary text-lg">✦</span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-secondary" />
        </div>
    );
}

export function SectionLabel({ children, className }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={cn(
            "flex items-center gap-3 mb-3",
            "font-body text-[10px] tracking-[0.4em] uppercase text-secondary",
            className,
        )}>
            {children}
            <div className="h-px w-10 bg-secondary opacity-50" />
        </div>
    );
}