import { SectionLabel } from '@/components/landing/Helpers';

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 md:px-8 py-16">
      <SectionLabel>Privacidad</SectionLabel>
      <h1 className="font-display text-3xl md:text-4xl text-primary mt-2 mb-10">
        Política de Privacidad
      </h1>

      <div className="space-y-8 font-body text-sm text-primary/70 leading-relaxed">

        <section>
          <h2 className="font-display text-lg text-primary mb-3">1. Responsable del tratamiento</h2>
          <ul className="space-y-1 pl-4 border-l-2 border-secondary/20">
            <li><span className="text-primary font-serif">Identidad:</span> Cofradía Jesús Salvador de los Hombres</li>
            <li><span className="text-primary font-serif">Localidad:</span> Montijo, Badajoz (España)</li>
            <li><span className="text-primary font-serif">Contacto:</span> disponible en <a href="/contacto" className="text-secondary hover:underline">la sección Contacto</a></li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">2. Datos que recopilamos</h2>
          <p>En el proceso de registro y uso de la plataforma se recogen los siguientes datos:</p>
          <ul className="mt-3 space-y-1 list-disc list-inside pl-2">
            <li>Nombre y apellidos</li>
            <li>Dirección de correo electrónico</li>
            <li>Género y fecha de nacimiento (opcional)</li>
            <li>Fotografía del certificado de bautismo (si el hermano es cofrade activo)</li>
            <li>Datos de navegación básicos mediante cookies técnicas de sesión</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">3. Finalidad del tratamiento</h2>
          <p>Los datos recogidos se utilizan exclusivamente para:</p>
          <ul className="mt-3 space-y-1 list-disc list-inside pl-2">
            <li>Gestionar el alta y la cuenta del hermano en la Cofradía</li>
            <li>Verificar la condición de cofrade activo</li>
            <li>Enviar comunicaciones relacionadas con la actividad de la Cofradía</li>
            <li>Gestionar pedidos de la tienda y el pago de cuotas</li>
            <li>Coordinar la procesión mediante seguimiento GPS voluntario</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">4. Base legal</h2>
          <p>
            El tratamiento se basa en el <strong className="text-primary/90">consentimiento expreso</strong> del
            interesado al registrarse, así como en la ejecución de la relación asociativa entre el
            hermano y la Cofradía (art. 6.1.a y 6.1.b del RGPD).
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">5. Conservación de datos</h2>
          <p>
            Los datos se conservarán mientras el hermano mantenga su cuenta activa o hasta que
            solicite su baja. Una vez solicitada, los datos serán eliminados o anonimizados en un
            plazo máximo de 30 días, salvo obligación legal de conservación.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">6. Cesión a terceros</h2>
          <p>
            Los datos <strong className="text-primary/90">no se ceden a terceros</strong> con fines comerciales.
            Únicamente se comparten con proveedores de servicios técnicos necesarios para el
            funcionamiento de la plataforma (Supabase para la base de datos y autenticación, Stripe
            para el procesamiento de pagos, Vercel para el alojamiento web), todos ellos con las
            garantías adecuadas conforme al RGPD.
          </p>
        </section>

        <section>
          <h2 className="font-display text-lg text-primary mb-3">7. Derechos del interesado</h2>
          <p>Puedes ejercer en cualquier momento los siguientes derechos:</p>
          <ul className="mt-3 space-y-1 list-disc list-inside pl-2">
            <li><strong className="text-primary/90">Acceso:</strong> conocer qué datos tenemos sobre ti</li>
            <li><strong className="text-primary/90">Rectificación:</strong> corregir datos inexactos</li>
            <li><strong className="text-primary/90">Supresión:</strong> solicitar la eliminación de tus datos</li>
            <li><strong className="text-primary/90">Oposición:</strong> oponerte al tratamiento</li>
            <li><strong className="text-primary/90">Portabilidad:</strong> recibir tus datos en formato estructurado</li>
          </ul>
          <p className="mt-3">
            Para ejercer estos derechos, contacta a través de la{' '}
            <a href="/contacto" className="text-secondary hover:underline">sección Contacto</a>.
            También tienes derecho a presentar una reclamación ante la{' '}
            <strong className="text-primary/90">Agencia Española de Protección de Datos (AEPD)</strong> en{' '}
            <span className="text-primary/60">www.aepd.es</span>.
          </p>
        </section>

        <p className="text-xs text-primary/35 pt-4 border-t border-secondary/10">
          Última actualización: mayo de 2026
        </p>
      </div>
    </div>
  );
}
