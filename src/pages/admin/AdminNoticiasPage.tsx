import { useEffect, useRef, useState } from 'react';
import { noticiaRepository } from '@/database/repositories';
import { useAuthStore } from '@/stores/authStore';
import type { Noticia, NoticiaCreate } from '@/interfaces/Noticia';
import { SectionLabel } from '@/components/landing/Helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, EyeOff, Star, Loader2, Paperclip, X, FileText } from 'lucide-react';
import { supabaseAdmin } from '@/database/supabase/Client';

const VACIA: NoticiaCreate = { titulo: '', cuerpo: '', imagen_url: '', destacada: false, publicada: true };

export default function AdminNoticiasPage() {
  const { sessionHermano } = useAuthStore();
  const hermano = sessionHermano!.hermano;
  const [noticias, setNoticias]     = useState<Noticia[]>([]);
  const [loading, setLoading]       = useState(true);
  const [form, setForm]             = useState<NoticiaCreate>(VACIA);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando]   = useState(false);
  const [archivo, setArchivo]       = useState<File | null>(null);
  const fileInputRef                = useRef<HTMLInputElement>(null);

  const cargar = () => {
    noticiaRepository.obtenerTodas().then(({ data }) => {
      setNoticias(data ?? []);
      setLoading(false);
    });
  };

  useEffect(() => { cargar(); }, []);

  const iniciarEdicion = (n: Noticia) => {
    setForm({ titulo: n.titulo, cuerpo: n.cuerpo, imagen_url: n.imagen_url ?? '', destacada: n.destacada, publicada: n.publicada });
    setEditandoId(n.id);
    setArchivo(null);
    setMostrarForm(true);
  };

  const quitarArchivo = () => {
    setArchivo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const guardar = async () => {
    if (!form.titulo || !form.cuerpo) { toast.error('Título y cuerpo son obligatorios'); return; }
    setGuardando(true);

    let imagenUrl = form.imagen_url;

    // Si hay un archivo seleccionado, subirlo primero
    if (archivo) {
      const { url, error } = await noticiaRepository.subirImagen(archivo);
      if (error || !url) {
        toast.error(error ?? 'Error al subir el archivo');
        setGuardando(false);
        return;
      }
      imagenUrl = url;
    } else if (imagenUrl && imagenUrl.startsWith('http') && !imagenUrl.includes('supabase.co')) {
      // URL externa: re-subir a Supabase Storage para que sea persistente
      const { data, error } = await supabaseAdmin.functions.invoke('upload-image-from-url', {
        body: { url: imagenUrl, bucket: 'noticias' },
      });
      if (error || !data?.url) {
        toast.error('No se pudo guardar la imagen de forma persistente. Descárgala y súbela como archivo.');
        setGuardando(false);
        return;
      }
      imagenUrl = data.url;
    }

    const datosFinales: NoticiaCreate = { ...form, imagen_url: imagenUrl };

    if (editandoId) {
      const { error } = await noticiaRepository.editar(editandoId, datosFinales);
      if (error) toast.error(error); else toast.success('Noticia actualizada');
    } else {
      const { error } = await noticiaRepository.crear(datosFinales, hermano.id);
      if (error) toast.error(error); else toast.success('Noticia publicada');
    }

    setForm(VACIA);
    setEditandoId(null);
    setMostrarForm(false);
    setGuardando(false);
    setArchivo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    const { error } = await noticiaRepository.eliminar(id);
    if (error) toast.error(error); else { toast.success('Eliminada'); cargar(); }
  };

  const cancelar = () => {
    setForm(VACIA);
    setEditandoId(null);
    setMostrarForm(false);
    setArchivo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const esPDF = archivo?.name.toLowerCase().endsWith('.pdf');
  const imagenActual = form.imagen_url;

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-start justify-between mb-6">
        <div>
          <SectionLabel>Gestión</SectionLabel>
          <h1 className="font-display text-4xl text-primary mt-1">Noticias</h1>
        </div>
        {!mostrarForm && (
          <Button onClick={() => setMostrarForm(true)}
            className="bg-primary text-primary-foreground rounded-none font-serif text-[10px] tracking-widest uppercase px-5 py-4 gap-2">
            <Plus size={12} /> Nueva noticia
          </Button>
        )}
      </div>

      {/* Formulario */}
      {mostrarForm && (
        <div className="mb-8 border border-secondary/20 p-6 space-y-4 bg-muted/20">
          <p className="font-serif text-sm text-primary font-medium">
            {editandoId ? 'Editar noticia' : 'Nueva noticia'}
          </p>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-widest text-primary/50">Título</Label>
            <Input className="rounded-none border-secondary/30 bg-background"
              value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-widest text-primary/50">Cuerpo</Label>
            <textarea rows={6}
              aria-label="Cuerpo de la noticia"
              className="w-full px-3 py-2 text-sm font-body bg-background border border-secondary/30 text-primary focus:outline-none focus:ring-1 focus:ring-secondary/40 resize-none"
              value={form.cuerpo} onChange={(e) => setForm({ ...form, cuerpo: e.target.value })} />
          </div>

          {/* Imagen / PDF */}
          <div className="space-y-2">
            <Label className="text-[10px] uppercase tracking-widest text-primary/50">
              Imagen o PDF (opcional)
            </Label>

            {/* Imagen actual al editar */}
            {editandoId && imagenActual && !archivo && (
              <div className="flex items-center gap-3 p-2 border border-secondary/15 bg-secondary/3">
                {imagenActual.toLowerCase().endsWith('.pdf') ? (
                  <FileText size={16} className="text-secondary shrink-0" />
                ) : (
                  <img src={imagenActual} alt="" className="h-10 w-16 object-cover shrink-0" />
                )}
                <span className="font-body text-[11px] text-primary/50 truncate flex-1">
                  Archivo actual
                </span>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imagen_url: '' })}
                  className="text-primary/30 hover:text-red-400 transition-colors"
                  title="Quitar imagen actual"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {/* Archivo seleccionado */}
            {archivo ? (
              <div className="flex items-center gap-2 p-2 border border-secondary/20 bg-secondary/3">
                {esPDF
                  ? <FileText size={14} className="text-secondary shrink-0" />
                  : <Paperclip size={14} className="text-secondary shrink-0" />
                }
                <span className="font-body text-xs text-primary/70 truncate flex-1">
                  {archivo.name}
                </span>
                <button
                  type="button"
                  onClick={quitarArchivo}
                  className="text-primary/30 hover:text-red-400 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 border border-dashed border-secondary/30 px-4 py-2.5 font-body text-[10px] tracking-widest uppercase text-secondary hover:bg-secondary/5 transition-colors w-full sm:w-auto"
              >
                <Paperclip size={11} />
                Seleccionar archivo
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              aria-label="Subir imagen o PDF de la noticia"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                setArchivo(f);
                if (f) setForm(prev => ({ ...prev, imagen_url: '' }));
              }}
            />

            {/* Alternativamente, pegar URL directa */}
            {!archivo && (
              <div className="pt-1">
                <p className="font-body text-[9px] tracking-widest uppercase text-primary/25 mb-1">
                  o pega una URL
                </p>
                <Input
                  aria-label="URL de imagen o PDF de la noticia"
                  className="rounded-none border-secondary/20 bg-background text-xs"
                  placeholder="https://..."
                  value={form.imagen_url ?? ''}
                  onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
                />
              </div>
            )}
          </div>

          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer font-body text-xs text-primary/60">
              <input type="checkbox" checked={form.publicada}
                onChange={(e) => setForm({ ...form, publicada: e.target.checked })} />
              Publicada
            </label>
            <label className="flex items-center gap-2 cursor-pointer font-body text-xs text-primary/60">
              <input type="checkbox" checked={form.destacada}
                onChange={(e) => setForm({ ...form, destacada: e.target.checked })} />
              Destacada
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={guardar} disabled={guardando}
              className="bg-primary text-primary-foreground rounded-none font-serif text-[10px] tracking-widest uppercase px-6 py-4 gap-2">
              {guardando ? <Loader2 size={12} className="animate-spin" /> : 'Guardar'}
            </Button>
            <Button onClick={cancelar} variant="ghost"
              className="rounded-none font-serif text-[10px] tracking-widest uppercase text-primary/50">
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 size={22} className="animate-spin text-secondary" />
        </div>
      ) : (
        <div className="border border-secondary/10 divide-y divide-secondary/10">
          {noticias.map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {n.destacada && <Star size={11} className="text-secondary shrink-0" />}
                  {!n.publicada && <EyeOff size={11} className="text-primary/30 shrink-0" />}
                  {n.imagen_url && (
                    n.imagen_url.toLowerCase().endsWith('.pdf')
                      ? <FileText size={11} className="text-primary/30 shrink-0" />
                      : <Paperclip size={11} className="text-primary/30 shrink-0" />
                  )}
                  <p className="font-serif text-sm text-primary truncate">{n.titulo}</p>
                </div>
                <p className="font-body text-[11px] text-primary/40">
                  {new Date(n.fecha_publicacion).toLocaleDateString('es-ES')}
                  {' · '}
                  {n.cuerpo.slice(0, 60)}…
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button type="button" onClick={() => iniciarEdicion(n)}
                  className="p-1.5 border border-secondary/20 text-primary/50 hover:text-secondary hover:border-secondary/40 transition-colors">
                  <Pencil size={12} />
                </button>
                <button type="button" onClick={() => eliminar(n.id)}
                  className="p-1.5 border border-red-200 text-red-400 hover:bg-red-50 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          {noticias.length === 0 && (
            <p className="text-center font-body text-sm text-primary/35 py-10">No hay noticias aún.</p>
          )}
        </div>
      )}
    </div>
  );
}