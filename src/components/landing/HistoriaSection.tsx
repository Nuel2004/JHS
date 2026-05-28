import { motion } from "framer-motion";
import { GoldenDivider, SectionLabel } from "./Helpers";

const HITOS = [
  { year: "1981", text: "Organización de la cofradía y primera salida de la «Burrita» por las calles de Montijo." },
  { year: "1987", text: "Constitución de la primera Junta de Gobierno, fijación del hábito nazareno y redacción de los primeros estatutos." },
  { year: "1991", text: "Reestreno del paso de madera que acompaña a la imagen titular." },
  { year: "1998", text: "Restauración de la imagen de Jesús Salvador de los Hombres a cargo de Luis Peña Maldonado." },
  { year: "2006", text: "XXV aniversario. La cofradía comienza a alternar su salida entre las parroquias de San Pedro Apóstol y San Gregorio Ostiense." },
  { year: "2019", text: "La Archidiócesis de Mérida-Badajoz aprueba oficialmente los estatutos actualizados (Decreto Prot. 2019/438)." },
];

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
});

export function HistoriaSection() {
  return (
    <section id="historia" className="bg-background py-28 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Cabecera */}
        <motion.div {...fadeUp(0)}>
          <SectionLabel>Desde 1981</SectionLabel>
        </motion.div>

        <motion.h2 {...fadeUp(0.08)} className="font-display text-3xl md:text-4xl text-primary mb-4 leading-tight">
          Una historia de fe<br />
          <span className="text-secondary italic">enraizada en Montijo</span>
        </motion.h2>

        <motion.div {...fadeUp(0.14)}>
          <GoldenDivider className="justify-start my-5" />
        </motion.div>

        <motion.p {...fadeUp(0.2)} className="font-body text-base md:text-lg leading-[1.9] text-primary/65 max-w-2xl mb-16">
          La Cofradía Jesús Salvador de los Hombres, conocida popularmente como{" "}
          <span className="text-secondary font-semibold">«La Burrita»</span>, nació en Montijo en{" "}
          <span className="text-primary/90">1981</span> impulsada por la devoción al Domingo de Ramos.
          Tiene su sede canónica en la Parroquia de San Pedro Apóstol y une a su comunidad
          en la procesión del Domingo de Ramos y en la vida social y caritativa de la localidad.
        </motion.p>

        {/* Timeline */}
        <div className="relative">
          {/* Línea vertical */}
          <div className="absolute left-[5.5rem] top-0 bottom-0 w-px bg-secondary/15 hidden md:block" />

          <div className="space-y-10">
            {HITOS.map((hito, i) => (
              <motion.div
                key={hito.year}
                {...fadeUp(0.1 + i * 0.07)}
                className="flex flex-col md:flex-row md:items-start gap-3 md:gap-8"
              >
                {/* Año */}
                <div className="flex md:flex-col items-center md:items-end gap-3 md:gap-0 md:w-20 shrink-0">
                  <span className="font-display text-secondary text-lg leading-none">{hito.year}</span>
                  {/* Nodo en la línea */}
                  <div className="md:hidden h-px w-8 bg-secondary/30" />
                  <div className="hidden md:block size-2 rounded-full border border-secondary bg-background mt-1 translate-x-[calc(100%+1.5rem+1px)]" />
                </div>

                {/* Contenido */}
                <div className="flex-1 border border-secondary/10 hover:border-secondary/30 transition-colors duration-300 px-6 py-4">
                  <p className="font-body text-sm md:text-base leading-[1.8] text-primary/70">{hito.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Nota patrimonial */}
        <motion.div
          {...fadeUp(0.5)}
          className="mt-16 border border-secondary/20 px-8 py-6 flex flex-col md:flex-row md:items-center gap-6"
        >
          <div className="shrink-0 text-secondary text-3xl font-display">✦</div>
          <div>
            <p className="font-body text-[11px] tracking-[0.35em] uppercase text-secondary mb-1">Imagen titular</p>
            <p className="font-body text-sm leading-[1.8] text-primary/65">
              <span className="text-primary/90 font-medium">Jesús Salvador de los Hombres</span>, obra seriada de los
              Talleres El Arte Cristiano de Olot, restaurada en 1998 por el imaginero extremeño
              Luis Peña Maldonado. Se custodia en la Ermita de Jesús de Montijo.
            </p>
          </div>
        </motion.div>

      </div>
    </section>
  );
}