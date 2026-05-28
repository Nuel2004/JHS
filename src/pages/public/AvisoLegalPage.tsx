import { SectionLabel } from '@/components/landing/Helpers';

export default function AvisoLegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
      <SectionLabel>Legal</SectionLabel>
      <h1 className="font-display text-3xl md:text-4xl text-primary mt-2 mb-10">
        Aviso Legal
      </h1>

      <div className="space-y-8 font-body text-sm text-primary/70 leading-relaxed">

        <section>
          <h2 className="font-display text-lg text-primary mb-3">1. Titular del sitio web</h2>
          <p>
            En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de la
            Sociedad de la Información y Comercio Electrónico (LSSI-CE), se informa de los
            siguientes datos identificativos:
          </p>
          <ul className="mt-3 space-y-1 pl-4 border-l-2 border-secondary/20">
            <li><span className="text-primary font-serif">Denominación:</span> Cofradía Jesús Salvador de los Hombres</li>
            <li><span className="text-primary font-serif">Localidad:</span> Montijo, Badajoz (España)</li>
            <li><span className="text-primary font-serif">Correo electrónico:</span> contacto disponible en la sección <a href="/contacto" className="text-secondary hover:underline">Contacto</a></li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">2. Objeto y ámbito de aplicación</h2>
          <p>
            El presente Aviso Legal regula el acceso y uso del sitio web de la Cofradía Jesús
            Salvador de los Hombres (en adelante, "el Sitio"). El acceso y la utilización del Sitio
            implica la aceptación expresa y sin reservas de todas las condiciones del presente Aviso
            Legal.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">3. Propiedad intelectual e industrial</h2>
          <p>
            Todos los contenidos del Sitio (incluyendo textos, imágenes, diseños, logotipos y
            software) son propiedad de la Cofradía o de sus colaboradores, y están protegidos por
            la legislación española e internacional sobre propiedad intelectual e industrial.
          </p>
          <p className="mt-2">
            Queda expresamente prohibida la reproducción, distribución, comunicación pública o
            transformación de dichos contenidos sin la autorización previa y escrita del titular.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">4. Exclusión de responsabilidad</h2>
          <p>
            La Cofradía no se responsabiliza de los daños y perjuicios de cualquier naturaleza que
            pudieran derivarse del acceso o uso del Sitio, ni de los contenidos de terceros a los que
            se pueda acceder mediante enlace desde el mismo.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">5. Legislación aplicable y jurisdicción</h2>
          <p>
            Las presentes condiciones se rigen por la legislación española. Para la resolución de
            cualquier controversia derivada del acceso o uso del Sitio, las partes se someten a los
            Juzgados y Tribunales de Badajoz, con renuncia expresa a cualquier otro fuero que pudiera
            corresponderles.
          </p>
        </section>

        <p className="text-xs text-primary/35 pt-4 border-t border-secondary/10">
          Última actualización: mayo de 2026
        </p>
      </div>
    </div>
  );
}
