const STATS = [
  { num: "10€", label: "Cuota anual" },
  { num: "GPS", label: "Seguimiento en vivo" },
  { num: "4", label: "Niveles de acceso" },
  { num: "100%", label: "Online" },
];

export function StatsBar() {
  return (
    <div className="bg-primary border-y border-secondary/20 relative overflow-hidden">
      {/* Textura sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_100%_at_50%_0%,rgba(184,134,11,0.07),transparent_60%)]" />

      <div className="relative z-10 flex items-center justify-center flex-wrap divide-x divide-secondary/15">
        {STATS.map((s) => (
          <div key={s.label} className="flex flex-col items-center text-center px-8 md:px-14 py-8">
            <span className="font-display text-[2rem] md:text-[2.5rem] text-secondary leading-none tracking-tight">
              {s.num}
            </span>
            <span className="font-body text-[9px] tracking-[0.3em] uppercase text-primary-foreground/45 mt-2 block">
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
