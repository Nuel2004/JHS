export function Footer() {
    return (
        <footer className="bg-background border-t border-secondary/15 px-6 md:px-12 py-10 flex flex-col md:flex-row justify-between items-center gap-6 flex-wrap">
            <div>
                <p className="font-display text-primary text-base">Jesús Salvador de los Hombres</p>
                <p className="font-serif text-[10px] tracking-[0.2em] text-primary/60 mt-1">
                    Cofradía de Montijo · Badajoz
                </p>
            </div>
            <div className="flex gap-8 flex-wrap justify-center">
                {["Historia", "Noticias", "Tienda", "Contacto", "Privacidad"].map((l) => (
                    <a
                        key={l}
                        href="#"
                        className="font-serif text-[10px] tracking-[0.15em] uppercase text-primary/60 hover:text-secondary transition-colors no-underline"
                    >
                        {l}
                    </a>
                ))}
            </div>
            <p className="font-body text-[0.8rem] text-primary/40">
                © 2026 Jesús Salvador de los Hombres · Montijo
            </p>
        </footer>
    );
}