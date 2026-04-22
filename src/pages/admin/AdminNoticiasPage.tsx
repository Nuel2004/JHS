import { useEffect, useState } from 'react';
import { noticiaRepository } from '@/database/repositories';
import { useAuthStore } from '@/stores/authStore';
import type { Noticia, NoticiaCreate } from '@/interfaces/Noticia';
import { SectionLabel } from '@/components/landing/Helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { Plus, Pencil, Trash2, Eye, EyeOff, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const VACIA: NoticiaCreate = { titulo: '', cuerpo: '', imagen_url: '', destacada: false, publicada: true };

export default function AdminNoticiasPage() {
  const { sessionHermano } = useAuthStore();
  const hermano = sessionHermano!.hermano;
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<NoticiaCreate>(VACIA);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [guardando, setGuardando] = useState(false);

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
    setMostrarForm(true);
  };

  const guardar = async () => {
    if (!form.titulo || !form.cuerpo) { toast.error('Título y cuerpo son obligatorios'); return; }
    setGuardando(true);
    if (editandoId) {
      const { error } = await noticiaRepository.editar(editandoId, form);
      if (error) toast.error(error); else toast.success('Noticia actualizada');
    } else {
      const { error } = await noticiaRepository.crear(form, hermano.id);
      if (error) toast.error(error); else toast.success('Noticia publicada');
    }
    setForm(VACIA); setEditandoId(null); setMostrarForm(false); setGuardando(false);
    cargar();
  };

  const eliminar = async (id: number) => {
    if (!confirm('¿Eliminar esta noticia?')) return;
    const { error } = await noticiaRepository.eliminar(id);
    if (error) toast.error(error); else { toast.success('Eliminada'); cargar(); }
  };

  const cancelar = () => { setForm(VACIA); setEditandoId(null); setMostrarForm(false); };

  return (
    <div className="p-8">
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
          <p className="font-serif text-sm text-primary font-medium">{editandoId ? 'Editar noticia' : 'Nueva noticia'}</p>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-widest text-primary/50">Título</Label>
            <Input className="rounded-none border-secondary/30 bg-background"
              value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-widest text-primary/50">Cuerpo</Label>
            <textarea rows={6}
              className="w-full px-3 py-2 text-sm font-body bg-background border border-secondary/30 text-primary focus:outline-none focus:ring-1 focus:ring-secondary/40 resize-none"
              value={form.cuerpo} onChange={(e) => setForm({ ...form, cuerpo: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] uppercase tracking-widest text-primary/50">URL imagen (opcional)</Label>
            <Input className="rounded-none border-secondary/30 bg-background"
              value={form.imagen_url ?? ''} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} />
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
        <div className="flex justify-center py-16"><Loader2 size={22} className="animate-spin text-secondary" /></div>
      ) : (
        <div className="border border-secondary/10 divide-y divide-secondary/10">
          {noticias.map((n) => (
            <div key={n.id} className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {n.destacada && <Star size={11} className="text-secondary shrink-0" />}
                  {!n.publicada && <EyeOff size={11} className="text-primary/30 shrink-0" />}
                  <p className="font-serif text-sm text-primary truncate">{n.titulo}</p>
                </div>
                <p className="font-body text-[11px] text-primary/40">
                  {new Date(n.fecha_publicacion).toLocaleDateString('es-ES')}
                  {' · '}
                  {n.cuerpo.slice(0, 60)}…
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => iniciarEdicion(n)}
                  className="p-1.5 border border-secondary/20 text-primary/50 hover:text-secondary hover:border-secondary/40 transition-colors">
                  <Pencil size={12} />
                </button>
                <button onClick={() => eliminar(n.id)}
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
