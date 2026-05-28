import { useEffect } from 'react';
import { ExternalLink } from 'lucide-react';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';

function IconFacebook({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.931-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

export default function RedesSocialesPage() {
  useEffect(() => {
    if (!document.getElementById('facebook-jssdk')) {
      const s = document.createElement('script');
      s.id = 'facebook-jssdk';
      s.async = true;
      s.defer = true;
      s.crossOrigin = 'anonymous';
      s.src = 'https://connect.facebook.net/es_ES/sdk.js#xfbml=1&version=v21.0';
      document.body.appendChild(s);
    } else {
      (window as any).FB?.XFBML?.parse();
    }
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12">
      <SectionLabel>Cofradía JHS</SectionLabel>
      <h1 className="font-display text-4xl sm:text-5xl text-primary mt-1 mb-2">Redes Sociales</h1>
      <p className="font-body text-sm text-primary/50 mb-2">
        Síguenos en nuestras redes para estar al tanto de toda la actividad de la hermandad.
      </p>
      <GoldenDivider className="justify-start" />

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* ── Facebook ─────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconFacebook className="size-4 text-secondary" />
            <p className="font-body text-[10px] tracking-widest uppercase text-primary/40">Facebook</p>
          </div>

          <div id="fb-root" />

          <div className="overflow-hidden border border-secondary/15">
            <div
              className="fb-page"
              data-href="https://www.facebook.com/cofradiajhs"
              data-tabs="timeline"
              data-width=""
              data-height="600"
              data-small-header="true"
              data-adapt-container-width="true"
              data-hide-cover="false"
              data-show-facepile="false"
            />
          </div>

          <a
            href="https://www.facebook.com/cofradiajhs"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 font-body text-[10px] tracking-widest uppercase text-secondary hover:text-secondary/70 transition-colors"
          >
            Ver página en Facebook
            <ExternalLink size={10} />
          </a>
        </div>

        {/* ── Instagram ────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <IconInstagram className="size-4 text-secondary" />
            <p className="font-body text-[10px] tracking-widest uppercase text-primary/40">Instagram</p>
          </div>

          <div className="border border-secondary/15 flex flex-col items-center justify-center text-center gap-6 py-16 px-8 bg-gradient-to-br from-secondary/3 to-transparent">
            <div className="size-16 rounded-full border-2 border-secondary/30 flex items-center justify-center">
              <IconInstagram className="size-7 text-secondary/50" />
            </div>
            <div>
              <p className="font-display text-2xl text-primary">@cofradiajhs</p>
              <p className="font-body text-[11px] text-primary/40 mt-1 tracking-wide">
                Hermandad Jesús Salvador · Montijo
              </p>
            </div>
            <p className="font-body text-sm text-primary/50 max-w-xs leading-relaxed">
              Fotografías de la procesión, actos y momentos de la hermandad. Síguenos para no perderte nada.
            </p>
            <a
              href="https://www.instagram.com/cofradiajhs/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-secondary/40 px-6 py-3 font-body text-[10px] tracking-widest uppercase text-secondary hover:bg-secondary/5 transition-colors"
            >
              Seguir en Instagram
              <ExternalLink size={10} />
            </a>
          </div>

          <a
            href="https://www.instagram.com/cofradiajhs/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 font-body text-[10px] tracking-widest uppercase text-secondary hover:text-secondary/70 transition-colors"
          >
            Ver perfil en Instagram
            <ExternalLink size={10} />
          </a>
        </div>

      </div>
    </div>
  );
}