import { useEffect, useState } from 'react';
import { noticiaRepository } from '@/database/repositories';
import type { Noticia } from '@/interfaces/Noticia';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { Loader2, FileText } from 'lucide-react';

function NoticiaCard({ noticia }: { noticia: Noticia }) {
  const fecha = new Date(noticia.fecha_publicacion).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <article className="border-b border-secondary/10 pb-8 last:border-0">
      {noticia.imagen_url && (
        noticia.imagen_url.toLowerCase().endsWith('.pdf') ? (
          <a
            href={noticia.imagen_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 mb-5 border border-secondary/20 px-4 py-3 text-secondary hover:bg-secondary/5 transition-colors w-fit font-body text-[11px] tracking-widest uppercase"
          >
            <FileText size={14} />
            Ver documento adjunto
          </a>
        ) : (
          <img
            src={noticia.imagen_url}
            alt={noticia.titulo}
            className="w-full h-auto mb-5 grayscale-[20%]"
          />
        )
      )}
      <div className="flex items-center gap-3 mb-3">
        <span className="font-body text-[10px] tracking-[0.3em] uppercase text-primary/35">{fecha}</span>
        {noticia.destacada && (
          <span className="px-2 py-0.5 text-[9px] tracking-widest uppercase border border-secondary/40 text-secondary">
            Destacada
          </span>
        )}
      </div>
      <h2 className="font-display text-xl text-primary mb-2 leading-snug">{noticia.titulo}</h2>
      <p className="font-body text-sm text-primary/60 leading-relaxed line-clamp-3">{noticia.cuerpo}</p>
    </article>
  );
}

export default function NoticiasPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    noticiaRepository.obtenerPublicadas().then(({ data, error }) => {
      if (error) setError(error);
      else setNoticias(data ?? []);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <SectionLabel>Hermandad Jesús Salvador</SectionLabel>
      <h1 className="font-display text-5xl text-primary mt-1 mb-2">Noticias</h1>
      <p className="font-body text-sm text-primary/50 mb-2">
        Novedades, eventos y comunicados de la hermandad.
      </p>
      <GoldenDivider className="justify-start" />

      <div className="mt-10">
        {loading && (
          <div className="flex justify-center py-16">
            <Loader2 size={22} className="animate-spin text-secondary" />
          </div>
        )}
        {error && <p className="font-body text-sm text-red-500">{error}</p>}
        {!loading && noticias.length === 0 && (
          <p className="font-body text-sm text-primary/40 py-10 text-center">
            No hay noticias publicadas aún.
          </p>
        )}
        <div className="space-y-10">
          {noticias.map((n) => <NoticiaCard key={n.id} noticia={n} />)}
        </div>
      </div>
    </div>
  );
}
