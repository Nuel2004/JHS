import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export function CtaFinal() {
  return (
    <section className="bg-primary relative overflow-hidden">
      {/* Gradiente decorativo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,rgba(184,134,11,0.10),transparent_70%)]" />

      {/* Línea dorada superior */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-24 md:py-32 text-center">
        {/* Eyebrow */}
        <p className="font-body text-[10px] tracking-[0.5em] uppercase text-secondary/70 mb-6 flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-secondary/30 inline-block" />
          Únete
          <span className="h-px w-10 bg-secondary/30 inline-block" />
        </p>

        <h2 className="font-display text-[clamp(2rem,6vw,3.5rem)] leading-[1.15] text-primary-foreground mb-4">
          Forma parte de<br />
          <span className="text-secondary">la hermandad</span>
        </h2>

        <p className="font-body text-sm text-primary-foreground/50 max-w-md mx-auto mb-10 leading-relaxed">
          Participa en la Estación de Penitencia, accede a la tienda oficial
          y gestiona tu cuota desde cualquier dispositivo.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/registro">
            <Button className="w-full sm:w-auto bg-secondary text-secondary-foreground hover:bg-secondary/85 rounded-none font-body text-[11px] tracking-widest uppercase px-10 py-6 h-auto gap-2 group">
              Solicitar Alta
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link to="/contacto">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-primary-foreground/20 text-primary-foreground/60 hover:border-secondary/50 hover:text-secondary hover:bg-transparent rounded-none font-body text-[11px] tracking-widest uppercase px-10 py-6 h-auto"
            >
              Más información
            </Button>
          </Link>
        </div>
      </div>

      {/* Línea dorada inferior */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-secondary/40 to-transparent" />
    </section>
  );
}
