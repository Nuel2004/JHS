import { Button } from "@/components/ui/button";
import { GoldenDivider } from "./Helpers";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

export function Hero() {
  return (
    <section
      id="inicio"
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 overflow-hidden bg-background"
    >
      {/* Fondo con gradientes sutiles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_35%,rgba(27,48,34,0.10),transparent_70%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background/80 to-transparent" />
        {/* Líneas decorativas laterales */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 opacity-20">
          <div className="h-24 w-px bg-secondary" />
          <span className="font-body text-[9px] tracking-[0.4em] uppercase text-secondary rotate-90 my-6 whitespace-nowrap">Fundada en Montijo</span>
          <div className="h-24 w-px bg-secondary" />
        </div>
        <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-2 opacity-20">
          <div className="h-24 w-px bg-secondary" />
          <span className="font-body text-[9px] tracking-[0.4em] uppercase text-secondary -rotate-90 my-6 whitespace-nowrap">Badajoz · España</span>
          <div className="h-24 w-px bg-secondary" />
        </div>
      </div>

      <div className="relative z-10 max-w-3xl w-full mx-auto">
        {/* Eyebrow */}
        <motion.p
          {...fadeUp(0)}
          className="font-body text-[10px] tracking-[0.5em] uppercase text-secondary mb-8 flex items-center justify-center gap-4"
        >
          <span className="inline-block h-px w-12 bg-secondary/40" />
          Hermandad · Montijo · Badajoz
          <span className="inline-block h-px w-12 bg-secondary/40" />
        </motion.p>

        {/* Título principal */}
        <motion.h1
          {...fadeUp(0.12)}
          className="font-display text-[clamp(2.6rem,8vw,5.5rem)] leading-[1.1] text-primary mb-3"
        >
          Jesús Salvador
          <br />
          <span className="text-secondary italic">de los Hombres</span>
        </motion.h1>

        {/* Subtítulo */}
        <motion.p
          {...fadeUp(0.22)}
          className="font-body text-xs md:text-sm tracking-[0.35em] uppercase text-primary/40 mb-10"
        >
          Cofradía de penitencia
        </motion.p>

        <motion.div {...fadeUp(0.3)}>
          <GoldenDivider />
        </motion.div>

        {/* Descripción */}
        <motion.p
          {...fadeUp(0.4)}
          className="font-body text-base md:text-lg leading-[1.9] text-primary/65 max-w-lg mx-auto mb-12"
        >
          Una cofradía con raíces en la fe y el servicio, que une a su comunidad
          en la Estación de Penitencia y en la vida cotidiana.
        </motion.p>

        {/* CTAs */}
        <motion.div {...fadeUp(0.5)} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/registro">
            <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-[11px] tracking-widest uppercase px-10 py-6 h-auto gap-2 group">
              Hacerse Hermano
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <a href="#roles">
            <Button
              variant="outline"
              className="w-full sm:w-auto border-secondary/50 text-secondary hover:bg-secondary/8 hover:border-secondary rounded-none font-serif text-[11px] tracking-widest uppercase px-10 py-6 h-auto"
            >
              Conoce la plataforma
            </Button>
          </a>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="mt-20 flex flex-col items-center gap-2 opacity-30"
        >
          <div className="w-px h-10 bg-primary/40 animate-pulse" />
          <span className="font-body text-[9px] tracking-[0.3em] uppercase text-primary/50">Descubrir</span>
        </motion.div>
      </div>
    </section>
  );
}
