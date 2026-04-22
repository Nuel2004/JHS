import { useEffect, useState } from 'react';
import { hermanoRepository } from '@/database/repositories';
import type { Hermano, EstadoHermano, Genero } from '@/interfaces/Hermano';
import type { EditarHermanoDatos } from '@/database/repositories/HermanoRepository';
import { SectionLabel } from '@/components/landing/Helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import {
  CheckCircle2, Search, UserCheck, Home, Loader2,
  Pencil, X, UserX, Save, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ESTADO_CONFIG: Record<EstadoHermano, { label: string; color: string }> = {
  activo: { label: 'Activo', color: 'text-secondary border-secondary/30 bg-secondary/5' },
  pendiente_pago: { label: 'Pendiente', color: 'text-amber-600 border-amber-400/30 bg-amber-50' },
  baja: { label: 'Baja', color: 'text-red-500 border-red-400/30 bg-red-50' },
};

// ── Panel lateral de edición ─────────────────────────────────────────────────

interface EditPanelProps {
  hermano: Hermano;
  onClose: () => void;
  onSaved: (updated: Hermano) => void;
}

function EditPanel({ hermano, onClose, onSaved }: EditPanelProps) {
  const [form, setForm] = useState<EditarHermanoDatos>({
    nombre: hermano.nombre,
    apellidos: hermano.apellidos,
    genero: hermano.genero,
    direccion: hermano.direccion,
    fecha_nacimiento: hermano.fecha_nacimiento,
    telefono: hermano.telefono,
    bautizado: hermano.bautizado,
    estado: hermano.estado,
    notas_admin: hermano.notas_admin ?? '',
  });
  const [guardando, setGuardando] = useState(false);
  const [confirmandoBaja, setConfirmandoBaja] = useState(false);

  const set = <K extends keyof EditarHermanoDatos>(key: K, value: EditarHermanoDatos[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const guardar = async () => {
    setGuardando(true);
    const datos: EditarHermanoDatos = {
      ...form,
      notas_admin: form.notas_admin?.trim() || null,
    };
    const { error } = await hermanoRepository.editarHermano(hermano.id, datos);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Hermano actualizado');
      onSaved({ ...hermano, ...datos } as Hermano);
      onClose();
    }
    setGuardando(false);
  };

  const darDeBaja = async () => {
    setGuardando(true);
    const { error } = await hermanoRepository.darDeBaja(hermano.id);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Hermano dado de baja');
      onSaved({ ...hermano, estado: 'baja', es_cofrade: false });
      onClose();
    }
    setGuardando(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      {/* Overlay */}
      <div className="flex-1 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <aside className="w-full max-w-md bg-background border-l border-secondary/20 flex flex-col overflow-hidden">
        {/* Cabecera */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary/15">
          <div>
            <p className="font-body text-[9px] tracking-widest uppercase text-primary/40">Editar hermano</p>
            <p className="font-serif text-primary">{hermano.apellidos}, {hermano.nombre}</p>
          </div>
          <button onClick={onClose} className="p-1.5 text-primary/30 hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        {/* Formulario */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Nombre</Label>
              <Input
                className="rounded-none border-secondary/30 bg-background text-sm"
                value={form.nombre ?? ''}
                onChange={(e) => set('nombre', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Apellidos</Label>
              <Input
                className="rounded-none border-secondary/30 bg-background text-sm"
                value={form.apellidos ?? ''}
                onChange={(e) => set('apellidos', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Género</Label>
              <Select
                value={form.genero}
                onValueChange={(v) => set('genero', v as Genero)}
              >
                <SelectTrigger className="rounded-none border-secondary/30 bg-background text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mujer">Mujer</SelectItem>
                  <SelectItem value="Hombre">Hombre</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">F. Nacimiento</Label>
              <Input
                type="date"
                className="rounded-none border-secondary/30 bg-background text-sm"
                value={form.fecha_nacimiento ?? ''}
                onChange={(e) => set('fecha_nacimiento', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase tracking-widest text-primary/50">Teléfono</Label>
            <Input
              className="rounded-none border-secondary/30 bg-background text-sm"
              value={form.telefono ?? ''}
              onChange={(e) => set('telefono', e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase tracking-widest text-primary/50">Dirección</Label>
            <Input
              className="rounded-none border-secondary/30 bg-background text-sm"
              value={form.direccion ?? ''}
              onChange={(e) => set('direccion', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Estado</Label>
              <Select
                value={form.estado}
                onValueChange={(v) => set('estado', v as EstadoHermano)}
              >
                <SelectTrigger className="rounded-none border-secondary/30 bg-background text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="pendiente_pago">Pendiente pago</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Bautizado</Label>
              <div className="flex gap-2 h-9">
                {([true, false] as const).map((val) => (
                  <button
                    key={String(val)}
                    type="button"
                    onClick={() => set('bautizado', val)}
                    className={cn(
                      'flex-1 border text-xs font-body transition-colors',
                      form.bautizado === val
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-secondary/20 text-primary/40 hover:text-primary/70'
                    )}
                  >
                    {val ? 'Sí' : 'No'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase tracking-widest text-primary/50">Notas admin</Label>
            <textarea
              rows={4}
              className="w-full px-3 py-2 text-sm font-body bg-background border border-secondary/30 text-primary focus:outline-none focus:ring-1 focus:ring-secondary/40 resize-none rounded-none"
              placeholder="Observaciones internas (no visibles para el hermano)…"
              value={form.notas_admin ?? ''}
              onChange={(e) => set('notas_admin', e.target.value)}
            />
          </div>

          {/* Info de solo lectura */}
          <div className="border border-secondary/10 p-3 space-y-1.5">
            <p className="font-body text-[9px] tracking-widest uppercase text-primary/30 mb-2">Solo lectura</p>
            <InfoRow label="Email" value={hermano.email} />
            <InfoRow label="Puesto procesión" value={hermano.preferencia_paso ?? '—'} />
            <InfoRow label="Cofrade" value={hermano.es_cofrade ? 'Sí' : 'No'} />
            <InfoRow label="Pago presencial" value={hermano.pago_presencial ? 'Sí' : 'No'} />
            <InfoRow label="Alta" value={hermano.fecha_alta ? new Date(hermano.fecha_alta).toLocaleDateString('es-ES') : '—'} />
            {hermano.stripe_customer_id && (
              <InfoRow label="Stripe ID" value={hermano.stripe_customer_id} />
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-t border-secondary/15 flex items-center gap-3">
          <Button
            onClick={guardar}
            disabled={guardando}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-[10px] tracking-widest uppercase gap-2"
          >
            {guardando ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Guardar
          </Button>

          {hermano.estado !== 'baja' && (
            confirmandoBaja ? (
              <div className="flex gap-2">
                <button
                  onClick={darDeBaja}
                  disabled={guardando}
                  className="px-3 py-2 text-[10px] tracking-widest uppercase font-body border border-red-400 text-red-500 hover:bg-red-50 transition-colors"
                >
                  Confirmar baja
                </button>
                <button
                  onClick={() => setConfirmandoBaja(false)}
                  className="px-3 py-2 text-[10px] tracking-widest uppercase font-body border border-secondary/20 text-primary/40 hover:text-primary/70 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmandoBaja(true)}
                className="p-2 border border-red-200 text-red-400 hover:bg-red-50 transition-colors"
                title="Dar de baja"
              >
                <UserX size={14} />
              </button>
            )
          )}
        </div>
      </aside>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="font-body text-[10px] text-primary/35 uppercase tracking-widest shrink-0">{label}</span>
      <span className="font-body text-[11px] text-primary/60 text-right truncate">{value}</span>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────────────────

export default function AdminHermanosPage() {
  const [hermanos, setHermanos] = useState<Hermano[]>([]);
  const [filtro, setFiltro] = useState('');
  const [loading, setLoading] = useState(true);
  const [accionando, setAccionando] = useState<number | null>(null);
  const [editando, setEditando] = useState<Hermano | null>(null);

  useEffect(() => {
    hermanoRepository.obtenerTodos().then(({ data }) => {
      setHermanos(data ?? []);
      setLoading(false);
    });
  }, []);

  const filtrados = hermanos.filter((h) =>
    `${h.nombre} ${h.apellidos} ${h.email}`.toLowerCase().includes(filtro.toLowerCase())
  );

  const activar = async (h: Hermano) => {
    setAccionando(h.id);
    const { error } = await hermanoRepository.activarCofrade(h.id);
    if (error) toast.error(error);
    else {
      setHermanos((prev) => prev.map((x) => x.id === h.id ? { ...x, estado: 'activo', es_cofrade: true } : x));
      toast.success(`${h.nombre} activado como cofrade`);
    }
    setAccionando(null);
  };

  const marcarPresencial = async (h: Hermano) => {
    setAccionando(h.id);
    const { error } = await hermanoRepository.marcarPagoPresencial(h.id);
    if (error) toast.error(error);
    else {
      setHermanos((prev) => prev.map((x) => x.id === h.id ? { ...x, estado: 'activo', es_cofrade: true, pago_presencial: true } : x));
      toast.success('Pago presencial registrado');
    }
    setAccionando(null);
  };

  const onSaved = (updated: Hermano) => {
    setHermanos((prev) => prev.map((x) => x.id === updated.id ? updated : x));
  };

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6">
        <SectionLabel>Gestión</SectionLabel>
        <h1 className="font-display text-3xl md:text-4xl text-primary mt-1">Hermanos</h1>
        <p className="font-body text-sm text-primary/50 mt-1">{hermanos.length} registrados en total</p>
      </div>

      {/* Buscador */}
      <div className="relative mb-6 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" />
        <Input
          placeholder="Buscar por nombre o email…"
          className="pl-9 rounded-none border-secondary/30 bg-background text-sm"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 size={24} className="animate-spin text-secondary" /></div>
      ) : (
        <>
          {/* ── Vista MÓVIL: cards ─────────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {filtrados.map((h) => {
              const est = ESTADO_CONFIG[h.estado] ?? ESTADO_CONFIG.baja;
              return (
                <div key={h.id} className="border border-secondary/10 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-sm text-primary">{h.apellidos}, {h.nombre}</p>
                      <p className="font-body text-[10px] text-primary/40 mt-0.5">{h.email}</p>
                    </div>
                    <span className={cn('shrink-0 inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body', est.color)}>
                      {est.label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {h.estado !== 'activo' && (
                      <>
                        <button onClick={() => activar(h)} disabled={accionando === h.id}
                          className="px-3 py-1.5 border border-secondary/30 text-secondary text-[10px] tracking-widest uppercase font-body hover:bg-secondary/10 transition-colors disabled:opacity-40 flex items-center gap-1.5">
                          {accionando === h.id ? <Loader2 size={11} className="animate-spin" /> : <UserCheck size={11} />}
                          Activar
                        </button>
                        <button onClick={() => marcarPresencial(h)} disabled={accionando === h.id}
                          className="px-3 py-1.5 border border-secondary/30 text-secondary text-[10px] tracking-widest uppercase font-body hover:bg-secondary/10 transition-colors disabled:opacity-40 flex items-center gap-1.5">
                          <Home size={11} /> Presencial
                        </button>
                      </>
                    )}
                    {h.estado === 'activo' && (
                      <CheckCircle2 size={14} className="text-secondary" />
                    )}
                    <button onClick={() => setEditando(h)}
                      className="ml-auto px-3 py-1.5 border border-secondary/20 text-primary/40 text-[10px] tracking-widest uppercase font-body hover:text-secondary hover:border-secondary/40 transition-colors flex items-center gap-1.5">
                      <Pencil size={11} /> Editar
                    </button>
                  </div>
                </div>
              );
            })}
            {filtrados.length === 0 && (
              <p className="text-center font-body text-sm text-primary/35 py-10 border border-dashed border-secondary/20">
                No se encontraron hermanos.
              </p>
            )}
          </div>

          {/* ── Vista DESKTOP: tabla ───────────────────────────────── */}
          <div className="hidden md:block border border-secondary/10 divide-y divide-secondary/10">
          {/* Cabecera */}
          <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-muted/30">
            {[
              { label: 'Hermano', cls: 'col-span-3' },
              { label: 'Email', cls: 'col-span-3' },
              { label: 'Teléfono', cls: 'col-span-1' },
              { label: 'Estado', cls: 'col-span-2' },
              { label: 'Puesto', cls: 'col-span-1' },
              { label: 'Acciones', cls: 'col-span-2' },
            ].map(({ label, cls }) => (
              <p key={label} className={cn('font-body text-[9px] tracking-widest uppercase text-primary/40', cls)}>{label}</p>
            ))}
          </div>

          {filtrados.map((h) => {
            const est = ESTADO_CONFIG[h.estado] ?? ESTADO_CONFIG.baja;
            return (
              <div key={h.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                {/* Nombre */}
                <div className="col-span-3">
                  <p className="font-serif text-sm text-primary">{h.apellidos}, {h.nombre}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <p className="font-body text-[10px] text-primary/35">{h.genero}</p>
                    {h.bautizado && (
                      <span className="font-body text-[8px] text-primary/25 uppercase tracking-widest">· Bautizado</span>
                    )}
                  </div>
                </div>
                {/* Email */}
                <p className="col-span-3 font-body text-xs text-primary/55 truncate">{h.email}</p>
                {/* Teléfono */}
                <p className="col-span-1 font-body text-xs text-primary/55">{h.telefono}</p>
                {/* Estado */}
                <div className="col-span-2">
                  <span className={cn('inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body', est.color)}>
                    {est.label}
                  </span>
                  {h.pago_presencial && (
                    <span className="ml-1 inline-block text-[8px] text-primary/30 uppercase tracking-widest">· Pres.</span>
                  )}
                </div>
                {/* Puesto */}
                <p className="col-span-1 font-body text-[10px] text-primary/45 truncate">{h.preferencia_paso ?? '—'}</p>
                {/* Acciones */}
                <div className="col-span-2 flex gap-1.5 items-center">
                  {h.estado !== 'activo' && (
                    <>
                      <button onClick={() => activar(h)} disabled={accionando === h.id}
                        title="Activar como cofrade"
                        className="p-1.5 border border-secondary/30 text-secondary hover:bg-secondary/10 transition-colors disabled:opacity-40">
                        {accionando === h.id ? <Loader2 size={12} className="animate-spin" /> : <UserCheck size={12} />}
                      </button>
                      <button onClick={() => marcarPresencial(h)} disabled={accionando === h.id}
                        title="Registrar pago presencial"
                        className="p-1.5 border border-secondary/30 text-secondary hover:bg-secondary/10 transition-colors disabled:opacity-40">
                        <Home size={12} />
                      </button>
                    </>
                  )}
                  {h.estado === 'activo' && (
                    <CheckCircle2 size={15} className="text-secondary ml-1" />
                  )}
                  {/* Editar */}
                  <button
                    onClick={() => setEditando(h)}
                    title="Editar hermano"
                    className="p-1.5 border border-secondary/20 text-primary/40 hover:text-secondary hover:border-secondary/40 transition-colors ml-auto"
                  >
                    <Pencil size={12} />
                  </button>
                  <ChevronRight size={10} className="text-primary/20" />
                </div>
              </div>
            );
          })}

          {filtrados.length === 0 && (
            <p className="text-center font-body text-sm text-primary/35 py-10">No se encontraron hermanos.</p>
          )}
          </div>{/* fin hidden md:block */}
        </>
      )}

      {/* Panel de edición */}
      {editando && (
        <EditPanel
          hermano={editando}
          onClose={() => setEditando(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
