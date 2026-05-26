import { SectionLabel } from '@/components/landing/Helpers';

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
      <SectionLabel>Privacidad</SectionLabel>
      <h1 className="font-display text-3xl md:text-4xl text-primary mt-2 mb-10">
        Política de Cookies
      </h1>

      <div className="space-y-8 font-body text-sm text-primary/70 leading-relaxed">

        <section>
          <h2 className="font-display text-lg text-primary mb-3">1. ¿Qué son las cookies?</h2>
          <p>
            Las cookies son pequeños archivos de texto que un sitio web almacena en el dispositivo
            del usuario cuando este lo visita. Permiten que el sitio recuerde sus acciones y
            preferencias durante un período de tiempo.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">2. Cookies que utilizamos</h2>
          <p className="mb-4">
            Este sitio web utiliza únicamente <strong className="text-primary/90">cookies técnicas y de sesión</strong>,
            necesarias para el funcionamiento básico de la plataforma. No se utilizan cookies
            publicitarias ni de rastreo de terceros.
          </p>

          <div className="border border-secondary/15 overflow-hidden">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-secondary/5 border-b border-secondary/15">
                  <th className="text-left px-4 py-2.5 font-serif text-primary/70 tracking-wide">Nombre</th>
                  <th className="text-left px-4 py-2.5 font-serif text-primary/70 tracking-wide">Proveedor</th>
                  <th className="text-left px-4 py-2.5 font-serif text-primary/70 tracking-wide">Finalidad</th>
                  <th className="text-left px-4 py-2.5 font-serif text-primary/70 tracking-wide">Duración</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary/10">
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-primary/60">sb-*</td>
                  <td className="px-4 py-2.5 text-primary/60">Supabase</td>
                  <td className="px-4 py-2.5 text-primary/60">Mantener la sesión del usuario autenticado</td>
                  <td className="px-4 py-2.5 text-primary/60">Sesión / 1 semana</td>
                </tr>
                <tr className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2.5 font-mono text-primary/60">carrito-store</td>
                  <td className="px-4 py-2.5 text-primary/60">Propio</td>
                  <td className="px-4 py-2.5 text-primary/60">Guardar el carrito de compra localmente (localStorage)</td>
                  <td className="px-4 py-2.5 text-primary/60">Persistente</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-primary/45">
            La cookie <span className="font-mono">carrito-store</span> se almacena en el
            localStorage del navegador, no en una cookie HTTP, por lo que no se transmite al
            servidor.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">3. Cookies de terceros</h2>
          <p>
            Este sitio <strong className="text-primary/90">no instala cookies de terceros</strong> con
            fines publicitarios, analíticos o de seguimiento. Cuando el usuario realiza un pago a
            través de Stripe, es redirigido a la plataforma de Stripe, que tiene su propia política
            de privacidad independiente de este sitio.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">4. Cómo gestionar las cookies</h2>
          <p className="mb-3">
            Puedes configurar tu navegador para bloquear o eliminar las cookies. Ten en cuenta que
            deshabilitar las cookies técnicas puede impedir el correcto funcionamiento del sitio
            (inicio de sesión, carrito de compra, etc.).
          </p>
          <ul className="space-y-1 list-disc list-inside pl-2">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/es/kb/habilitar-y-deshabilitar-cookies-sitios-web-rastrear-preferencias" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/es-es/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">Safari</a></li>
            <li><a href="https://support.microsoft.com/es-es/microsoft-edge/eliminar-las-cookies-en-microsoft-edge-63947406-40ac-c3b8-57b9-2a946a29ae09" target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline">Microsoft Edge</a></li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">5. Más información</h2>
          <p>
            Para cualquier consulta sobre esta política, puedes contactar a través de la{' '}
            <a href="/contacto" className="text-secondary hover:underline">sección Contacto</a> o
            consultar la{' '}
            <a href="/privacidad" className="text-secondary hover:underline">Política de Privacidad</a>.
          </p>
        </section>

        <p className="text-xs text-primary/35 pt-4 border-t border-secondary/10">
          Última actualización: mayo de 2026
        </p>
      </div>
    </div>
  );
}
