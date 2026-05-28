import { useEffect, useState } from 'react';
import { hermanoRepository } from '@/database/repositories';
import type { Hermano, EstadoHermano, Genero, RolUsuario } from '@/interfaces/Hermano';
import type { EditarHermanoDatos, CrearPorAdminDatos } from '@/database/repositories/HermanoRepository';
import { SectionLabel } from '@/components/landing/Helpers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'react-hot-toast';
import {
  Search, Plus, X, Save, Loader2, Trash2, ShieldAlert, ShieldCheck, Shield, UserX,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ROL_CONFIG: Record<RolUsuario, { label: string; color: string; Icon: React.ElementType }> = {
  hermano:    { label: 'Hermano',    color: 'border-secondary/15 text-primary/40 bg-transparent',    Icon: Shield },
  admin:      { label: 'Admin',      color: 'border-secondary/50 text-secondary bg-secondary/5',     Icon: ShieldCheck },
  superadmin: { label: 'Superadmin', color: 'border-amber-400/60 text-amber-600 bg-amber-50',        Icon: ShieldAlert },
};

const ESTADO_CONFIG: Record<EstadoHermano, { label: string; color: string }> = {
  activo:         { label: 'Activo',    color: 'text-secondary border-secondary/30 bg-secondary/5' },
  pendiente_pago: { label: 'Pendiente', color: 'text-amber-600 border-amber-400/30 bg-amber-50' },
  baja:           { label: 'Baja',      color: 'text-red-500 border-red-400/30 bg-red-50' },
};

// ── Panel edición ────────────────────────────────────────────────────────────

interface EditPanelProps {
  hermano: Hermano;
  onClose: () => void;
  onSaved: (updated: Hermano) => void;
  onDeleted: (id: number) => void;
}

function EditPanel({ hermano, onClose, onSaved, onDeleted }: EditPanelProps) {
  const [form, setForm] = useState<EditarHermanoDatos>({
    nombre:          hermano.nombre,
    apellidos:       hermano.apellidos,
    genero:          hermano.genero,
    direccion:       hermano.direccion,
    fecha_nacimiento: hermano.fecha_nacimiento,
    telefono:        hermano.telefono,
    bautizado:       hermano.bautizado,
    estado:          hermano.estado,
    notas_admin:     hermano.notas_admin ?? '',
  });
  const [guardando, setGuardando]             = useState(false);
  const [cambiandoRol, setCambiandoRol]       = useState(false);
  const [confirmandoElim, setConfirmandoElim] = useState(false);
  const [eliminando, setEliminando]           = useState(false);

  const set = <K extends keyof EditarHermanoDatos>(key: K, val: EditarHermanoDatos[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const guardar = async () => {
    setGuardando(true);
    const datos: EditarHermanoDatos = { ...form, notas_admin: form.notas_admin?.trim() || null };
    const { error } = await hermanoRepository.editarHermano(hermano.id, datos);
    if (error) { toast.error(error); } else {
      toast.success('Hermano actualizado');
      onSaved({ ...hermano, ...datos } as Hermano);
      onClose();
    }
    setGuardando(false);
  };

  const cambiarRol = async (nuevoRol: RolUsuario) => {
    if (nuevoRol === hermano.rol) return;
    setCambiandoRol(true);
    const { error } = await hermanoRepository.cambiarRol(hermano.id, nuevoRol);
    if (error) { toast.error(error); } else {
      toast.success(`Rol cambiado a ${nuevoRol}`);
      onSaved({ ...hermano, rol: nuevoRol });
    }
    setCambiandoRol(false);
  };

  const eliminar = async () => {
    setEliminando(true);
    const { error } = await hermanoRepository.eliminar(hermano.id, hermano.auth_id);
    if (error) { toast.error(error); setEliminando(false); return; }
    toast.success(`${hermano.nombre} eliminado`);
    onDeleted(hermano.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      <button type="button" aria-label="Cerrar" className="flex-1 bg-black/30 border-none p-0" onClick={onClose} />
      <aside className="w-full max-w-md bg-background border-l border-secondary/20 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary/15">
          <div>
            <p className="font-body text-[9px] tracking-widest uppercase text-primary/40">Editar hermano</p>
            <p className="font-serif text-primary">{hermano.apellidos}, {hermano.nombre}</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-primary/30 hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Rol — sección destacada */}
          <div className="border border-secondary/20 p-3 space-y-2">
            <p className="font-body text-[9px] tracking-widest uppercase text-primary/30">Rol de usuario</p>
            <div className="flex gap-2">
              {(['hermano', 'admin', 'superadmin'] as RolUsuario[]).map((r) => {
                const cfg = ROL_CONFIG[r];
                const Icon = cfg.Icon;
                const active = hermano.rol === r;
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => cambiarRol(r)}
                    disabled={cambiandoRol || active}
                    className={cn(
                      'flex-1 flex flex-col items-center gap-1 py-2 border text-[9px] tracking-widest uppercase font-body transition-colors disabled:cursor-default',
                      active ? cfg.color + ' ring-1 ring-inset ring-current' : 'border-secondary/15 text-primary/30 hover:text-primary/60'
                    )}
                  >
                    {cambiandoRol && !active ? <Loader2 size={11} className="animate-spin" /> : <Icon size={11} />}
                    {cfg.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Datos personales */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Nombre</Label>
              <Input className="rounded-none border-secondary/30 bg-background text-sm"
                value={form.nombre ?? ''} onChange={(e) => set('nombre', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Apellidos</Label>
              <Input className="rounded-none border-secondary/30 bg-background text-sm"
                value={form.apellidos ?? ''} onChange={(e) => set('apellidos', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Género</Label>
              <Select value={form.genero} onValueChange={(v) => set('genero', v as Genero)}>
                <SelectTrigger className="rounded-none border-secondary/30 bg-background text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mujer">Mujer</SelectItem>
                  <SelectItem value="Hombre">Hombre</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">F. Nacimiento</Label>
              <Input type="date" className="rounded-none border-secondary/30 bg-background text-sm"
                value={form.fecha_nacimiento ?? ''} onChange={(e) => set('fecha_nacimiento', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase tracking-widest text-primary/50">Teléfono</Label>
            <Input className="rounded-none border-secondary/30 bg-background text-sm"
              value={form.telefono ?? ''} onChange={(e) => set('telefono', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase tracking-widest text-primary/50">Dirección</Label>
            <Input className="rounded-none border-secondary/30 bg-background text-sm"
              value={form.direccion ?? ''} onChange={(e) => set('direccion', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Estado</Label>
              <Select value={form.estado} onValueChange={(v) => set('estado', v as EstadoHermano)}>
                <SelectTrigger className="rounded-none border-secondary/30 bg-background text-sm"><SelectValue /></SelectTrigger>
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
                  <button key={String(val)} type="button" onClick={() => set('bautizado', val)}
                    className={cn('flex-1 border text-xs font-body transition-colors',
                      form.bautizado === val
                        ? 'border-secondary bg-secondary/10 text-secondary'
                        : 'border-secondary/20 text-primary/40 hover:text-primary/70')}>
                    {val ? 'Sí' : 'No'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase tracking-widest text-primary/50">Notas admin</Label>
            <textarea rows={3} aria-label="Notas de administrador"
              className="w-full px-3 py-2 text-sm font-body bg-background border border-secondary/30 text-primary focus:outline-none focus:ring-1 focus:ring-secondary/40 resize-none rounded-none"
              placeholder="Observaciones internas…"
              value={form.notas_admin ?? ''} onChange={(e) => set('notas_admin', e.target.value)} />
          </div>

          {/* Solo lectura */}
          <div className="border border-secondary/10 p-3 space-y-1.5">
            <p className="font-body text-[9px] tracking-widest uppercase text-primary/30 mb-2">Solo lectura</p>
            {[
              { label: 'Email',           value: hermano.email },
              { label: 'Auth ID',         value: hermano.auth_id ?? '—' },
              { label: 'Cofrade',         value: hermano.es_cofrade ? 'Sí' : 'No' },
              { label: 'Pago presencial', value: hermano.pago_presencial ? 'Sí' : 'No' },
              { label: 'Alta',            value: hermano.fecha_alta ? new Date(hermano.fecha_alta).toLocaleDateString('es-ES') : '—' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between gap-2">
                <span className="font-body text-[10px] text-primary/35 uppercase tracking-widest shrink-0">{label}</span>
                <span className="font-body text-[11px] text-primary/60 text-right truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="px-6 py-4 border-t border-secondary/15 flex items-center gap-3">
          <Button onClick={guardar} disabled={guardando}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-[10px] tracking-widest uppercase gap-2">
            {guardando ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Guardar
          </Button>

          {confirmandoElim ? (
            <div className="flex gap-2">
              <button type="button" onClick={eliminar} disabled={eliminando}
                className="px-3 py-2 text-[10px] tracking-widest uppercase font-body border border-red-400 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40 flex items-center gap-1.5">
                {eliminando ? <Loader2 size={11} className="animate-spin" /> : null}
                Confirmar
              </button>
              <button type="button" onClick={() => setConfirmandoElim(false)}
                className="px-3 py-2 text-[10px] tracking-widest uppercase font-body border border-secondary/20 text-primary/40 hover:text-primary/70 transition-colors">
                Cancelar
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setConfirmandoElim(true)}
              title="Eliminar hermano permanentemente"
              className="p-2 border border-red-200 text-red-400 hover:bg-red-50 transition-colors">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

// ── Panel creación ────────────────────────────────────────────────────────────

interface CreatePanelProps {
  onClose: () => void;
  onCreated: () => void;
}

const CREAR_VACIO: CrearPorAdminDatos = {
  email: '', password: '', nombre: '', apellidos: '',
  genero: 'Hombre', direccion: '', fecha_nacimiento: '', telefono: '',
  rol: 'hermano', estado: 'pendiente_pago', bautizado: false,
};

function CreatePanel({ onClose, onCreated }: CreatePanelProps) {
  const [form, setForm]       = useState<CrearPorAdminDatos>(CREAR_VACIO);
  const [creando, setCreando] = useState(false);

  const set = <K extends keyof CrearPorAdminDatos>(key: K, val: CrearPorAdminDatos[K]) =>
    setForm((p) => ({ ...p, [key]: val }));

  const crear = async () => {
    if (!form.email || !form.password || !form.nombre || !form.apellidos) {
      toast.error('Email, contraseña, nombre y apellidos son obligatorios');
      return;
    }
    setCreando(true);
    const { error } = await hermanoRepository.crearPorAdmin(form);
    if (error) { toast.error(error); } else {
      toast.success(`${form.nombre} ${form.apellidos} creado`);
      onCreated();
      onClose();
    }
    setCreando(false);
  };

  return (
    <div className="fixed inset-0 z-40 flex">
      <button type="button" aria-label="Cerrar" className="flex-1 bg-black/30 border-none p-0" onClick={onClose} />
      <aside className="w-full max-w-md bg-background border-l border-secondary/20 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-secondary/15">
          <div>
            <p className="font-body text-[9px] tracking-widest uppercase text-primary/40">Superadmin</p>
            <p className="font-serif text-primary">Nuevo hermano</p>
          </div>
          <button type="button" onClick={onClose} className="p-1.5 text-primary/30 hover:text-primary transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase tracking-widest text-primary/50">Email</Label>
            <Input className="rounded-none border-secondary/30 bg-background text-sm" type="email"
              value={form.email} onChange={(e) => set('email', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase tracking-widest text-primary/50">Contraseña temporal</Label>
            <Input className="rounded-none border-secondary/30 bg-background text-sm" type="password"
              value={form.password} onChange={(e) => set('password', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Nombre</Label>
              <Input className="rounded-none border-secondary/30 bg-background text-sm"
                value={form.nombre} onChange={(e) => set('nombre', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Apellidos</Label>
              <Input className="rounded-none border-secondary/30 bg-background text-sm"
                value={form.apellidos} onChange={(e) => set('apellidos', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Género</Label>
              <Select value={form.genero} onValueChange={(v) => set('genero', v as Genero)}>
                <SelectTrigger className="rounded-none border-secondary/30 bg-background text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mujer">Mujer</SelectItem>
                  <SelectItem value="Hombre">Hombre</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">F. Nacimiento</Label>
              <Input type="date" className="rounded-none border-secondary/30 bg-background text-sm"
                value={form.fecha_nacimiento} onChange={(e) => set('fecha_nacimiento', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase tracking-widest text-primary/50">Teléfono</Label>
            <Input className="rounded-none border-secondary/30 bg-background text-sm"
              value={form.telefono} onChange={(e) => set('telefono', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase tracking-widest text-primary/50">Dirección</Label>
            <Input className="rounded-none border-secondary/30 bg-background text-sm"
              value={form.direccion} onChange={(e) => set('direccion', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Rol inicial</Label>
              <Select value={form.rol} onValueChange={(v) => set('rol', v as RolUsuario)}>
                <SelectTrigger className="rounded-none border-secondary/30 bg-background text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hermano">Hermano</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Superadmin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] uppercase tracking-widest text-primary/50">Estado inicial</Label>
              <Select value={form.estado} onValueChange={(v) => set('estado', v as EstadoHermano)}>
                <SelectTrigger className="rounded-none border-secondary/30 bg-background text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="pendiente_pago">Pendiente pago</SelectItem>
                  <SelectItem value="baja">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[9px] uppercase tracking-widest text-primary/50">Bautizado</Label>
            <div className="flex gap-2 h-9">
              {([true, false] as const).map((val) => (
                <button key={String(val)} type="button" onClick={() => set('bautizado', val)}
                  className={cn('flex-1 border text-xs font-body transition-colors',
                    form.bautizado === val
                      ? 'border-secondary bg-secondary/10 text-secondary'
                      : 'border-secondary/20 text-primary/40 hover:text-primary/70')}>
                  {val ? 'Sí' : 'No'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-secondary/15">
          <Button onClick={crear} disabled={creando}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-[10px] tracking-widest uppercase gap-2">
            {creando ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
            Crear hermano
          </Button>
        </div>
      </aside>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function AdminSuperadminPage() {
  const [hermanos, setHermanos]     = useState<Hermano[]>([]);
  const [filtro, setFiltro]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [editando, setEditando]     = useState<Hermano | null>(null);
  const [creando, setCreando]       = useState(false);

  const cargar = () => {
    setLoading(true);
    hermanoRepository.obtenerTodos().then(({ data }) => {
      setHermanos(data ?? []);
      setLoading(false);
    });
  };

  useEffect(() => { cargar(); }, []);

  const filtrados = hermanos.filter((h) =>
    `${h.nombre} ${h.apellidos} ${h.email} ${h.rol}`.toLowerCase().includes(filtro.toLowerCase())
  );

  const onSaved  = (updated: Hermano) => setHermanos((prev) => prev.map((x) => x.id === updated.id ? updated : x));
  const onDeleted = (id: number)      => setHermanos((prev) => prev.filter((x) => x.id !== id));

  const totalActivos = hermanos.filter((h) => h.estado === 'activo').length;
  const totalAdmins  = hermanos.filter((h) => h.rol === 'admin' || h.rol === 'superadmin').length;

  return (
    <div className="p-4 md:p-8">
      {/* Cabecera */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <SectionLabel>Superadmin</SectionLabel>
          <h1 className="font-display text-3xl md:text-4xl text-primary mt-1">Gestión de Hermanos</h1>
          <div className="flex gap-4 mt-2">
            <span className="font-body text-[10px] tracking-widest uppercase text-primary/40">
              {hermanos.length} total
            </span>
            <span className="font-body text-[10px] tracking-widest uppercase text-secondary">
              {totalActivos} activos
            </span>
            <span className="font-body text-[10px] tracking-widest uppercase text-amber-600">
              {totalAdmins} administradores
            </span>
          </div>
        </div>
        <Button onClick={() => setCreando(true)}
          className="bg-primary text-primary-foreground rounded-none font-serif text-[10px] tracking-widest uppercase px-5 py-4 gap-2">
          <Plus size={12} /> Nuevo hermano
        </Button>
      </div>

      {/* Buscador */}
      <div className="relative mb-6 max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" />
        <Input placeholder="Buscar por nombre, email o rol…"
          className="pl-9 rounded-none border-secondary/30 bg-background text-sm"
          value={filtro} onChange={(e) => setFiltro(e.target.value)} />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={24} className="animate-spin text-secondary" />
        </div>
      ) : (
        <>
          {/* Vista móvil */}
          <div className="md:hidden space-y-3">
            {filtrados.map((h) => {
              const est = ESTADO_CONFIG[h.estado];
              const rol = ROL_CONFIG[h.rol];
              const RolIcon = rol.Icon;
              return (
                <div key={h.id} className="border border-secondary/10 p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-serif text-sm text-primary">{h.apellidos}, {h.nombre}</p>
                      <p className="font-body text-[10px] text-primary/40 mt-0.5">{h.email}</p>
                    </div>
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body', rol.color)}>
                        <RolIcon size={8} /> {rol.label}
                      </span>
                      <span className={cn('inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body', est.color)}>
                        {est.label}
                      </span>
                    </div>
                  </div>
                  <button type="button" onClick={() => setEditando(h)}
                    className="w-full py-1.5 border border-secondary/20 text-primary/40 text-[10px] tracking-widest uppercase font-body hover:text-secondary hover:border-secondary/40 transition-colors">
                    Editar
                  </button>
                </div>
              );
            })}
            {filtrados.length === 0 && (
              <p className="text-center font-body text-sm text-primary/35 py-10 border border-dashed border-secondary/20">
                No se encontraron hermanos.
              </p>
            )}
          </div>

          {/* Vista desktop */}
          <div className="hidden md:block border border-secondary/10 divide-y divide-secondary/10">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 bg-muted/30">
              {[
                { label: 'Hermano', cls: 'col-span-3' },
                { label: 'Email',   cls: 'col-span-3' },
                { label: 'Rol',     cls: 'col-span-2' },
                { label: 'Estado',  cls: 'col-span-2' },
                { label: 'Puesto',  cls: 'col-span-1' },
                { label: 'Acción',  cls: 'col-span-1' },
              ].map(({ label, cls }) => (
                <p key={label} className={cn('font-body text-[9px] tracking-widest uppercase text-primary/40', cls)}>{label}</p>
              ))}
            </div>

            {filtrados.map((h) => {
              const est = ESTADO_CONFIG[h.estado];
              const rol = ROL_CONFIG[h.rol];
              const RolIcon = rol.Icon;
              return (
                <div key={h.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center hover:bg-muted/20 transition-colors">
                  <div className="col-span-3">
                    <p className="font-serif text-sm text-primary">{h.apellidos}, {h.nombre}</p>
                    <p className="font-body text-[10px] text-primary/35 mt-0.5">{h.genero}</p>
                  </div>
                  <p className="col-span-3 font-body text-xs text-primary/55 truncate">{h.email}</p>
                  <div className="col-span-2">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body', rol.color)}>
                      <RolIcon size={8} /> {rol.label}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className={cn('inline-block px-2 py-0.5 text-[9px] tracking-widest uppercase border font-body', est.color)}>
                      {est.label}
                    </span>
                  </div>
                  <p className="col-span-1 font-body text-[10px] text-primary/45 truncate">{h.preferencia_paso ?? '—'}</p>
                  <div className="col-span-1 flex justify-end">
                    <button type="button" onClick={() => setEditando(h)}
                      title="Editar"
                      className="p-1.5 border border-secondary/20 text-primary/40 hover:text-secondary hover:border-secondary/40 transition-colors">
                      <UserX size={12} />
                    </button>
                  </div>
                </div>
              );
            })}

            {filtrados.length === 0 && (
              <p className="text-center font-body text-sm text-primary/35 py-10">No se encontraron hermanos.</p>
            )}
          </div>
        </>
      )}

      {editando && (
        <EditPanel
          hermano={editando}
          onClose={() => setEditando(null)}
          onSaved={onSaved}
          onDeleted={onDeleted}
        />
      )}

      {creando && (
        <CreatePanel
          onClose={() => setCreando(false)}
          onCreated={cargar}
        />
      )}
    </div>
  );
}
