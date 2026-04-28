# Corrección de enlaces y navbar admin móvil — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corregir todos los enlaces rotos del proyecto y añadir navegación móvil (hamburger + drawer) en el panel admin.

**Architecture:** Cuatro archivos afectados, todos independientes entre sí. Los tres primeros son correcciones de enlaces directas. El cuarto (AdminLayout) añade estado de drawer con framer-motion, manteniendo el sidebar desktop intacto.

**Tech Stack:** React 19, TypeScript, React Router v6, framer-motion, Tailwind CSS, lucide-react.

---

## Estructura de archivos

| Acción | Archivo | Cambio |
|--------|---------|--------|
| Modificar | `src/components/layout/Footer.tsx` | 3 href="#" → rutas correctas |
| Modificar | `src/pages/hermano/DashboardPage.tsx` | rutas rotas + card GPS como `<a>` |
| Modificar | `src/pages/admin/AdminDashboardPage.tsx` | `<a href>` → `<Link to>` |
| Modificar | `src/layouts/AdminLayout.tsx` | drawer móvil con hamburger |

---

## Task 1: Corregir enlaces del Footer

**Archivo:** `src/components/layout/Footer.tsx`

El archivo actual tiene todos los links del footer con `href="#"`. Hay que actualizar tres de ellos.

- [ ] **Step 1: Reemplazar el contenido de Footer.tsx**

Reemplaza el archivo completo con:

```tsx
export function Footer() {
    return (
        <footer className="bg-background border-t border-secondary/15 px-6 md:px-12 py-10 flex flex-col md:flex-row justify-between items-center gap-6 flex-wrap">
            <div>
                <p className="font-display text-primary text-base">Jesús Salvador de los Hombres</p>
                <p className="font-serif text-[10px] tracking-[0.2em] text-primary/60 mt-1">
                    Cofradía de Montijo · Badajoz
                </p>
            </div>
            <div className="flex gap-8 flex-wrap justify-center">
                <a
                    href="#"
                    className="font-serif text-[10px] tracking-[0.15em] uppercase text-primary/60 hover:text-secondary transition-colors no-underline"
                >
                    Historia
                </a>
                <a
                    href="/noticias"
                    className="font-serif text-[10px] tracking-[0.15em] uppercase text-primary/60 hover:text-secondary transition-colors no-underline"
                >
                    Noticias
                </a>
                <a
                    href="/#tienda"
                    className="font-serif text-[10px] tracking-[0.15em] uppercase text-primary/60 hover:text-secondary transition-colors no-underline"
                >
                    Tienda
                </a>
                <a
                    href="/contacto"
                    className="font-serif text-[10px] tracking-[0.15em] uppercase text-primary/60 hover:text-secondary transition-colors no-underline"
                >
                    Contacto
                </a>
                <a
                    href="#"
                    className="font-serif text-[10px] tracking-[0.15em] uppercase text-primary/60 hover:text-secondary transition-colors no-underline"
                >
                    Privacidad
                </a>
            </div>
            <p className="font-body text-[0.8rem] text-primary/40">
                © 2026 Jesús Salvador de los Hombres · Montijo
            </p>
        </footer>
    );
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npm run build
```

Debe completar sin errores TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "fix: corregir enlaces del footer (noticias, tienda, contacto)"
```

---

## Task 2: Corregir enlaces rotos en DashboardPage hermano

**Archivo:** `src/pages/hermano/DashboardPage.tsx`

Dos problemas: `/tienda` no existe como ruta (debe ser `/mi/tienda`), y `/procesion` no existe como ruta (el GPS está en la landing pública con `id="procesion"`). Además el card de GPS estaba marcado `cofrade: true` pero el mapa es público.

La solución introduce un campo `href?: string` opcional en el array ACCESOS para que el card de GPS use `<a href="/#procesion">` en lugar de `<Link to>`.

- [ ] **Step 1: Reemplazar el contenido de DashboardPage.tsx**

```tsx
import { useAuthStore } from '@/stores/authStore';
import { Link } from 'react-router-dom';
import { GoldenDivider, SectionLabel } from '@/components/landing/Helpers';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Clock, AlertCircle, MapPin, ShoppingBag, Cross, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

function EstadoBadge({ estado, esCofrade }: { estado: string; esCofrade: boolean }) {
  if (estado === 'activo' && esCofrade) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest uppercase font-body border border-secondary/40 text-secondary bg-secondary/5">
        <CheckCircle2 size={11} /> Hermano Cofrade Activo
      </span>
    );
  }
  if (estado === 'pendiente_pago') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest uppercase font-body border border-amber-400/50 text-amber-600 bg-amber-50">
        <Clock size={11} /> Pendiente de pago
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] tracking-widest uppercase font-body border border-red-400/40 text-red-500 bg-red-50">
      <AlertCircle size={11} /> {estado}
    </span>
  );
}

type AccesoItem = {
  to?: string;
  href?: string;
  icon: React.ElementType;
  title: string;
  desc: string;
  cofrade: boolean;
};

const ACCESOS: AccesoItem[] = [
  {
    to: '/mi/puesto',
    icon: Cross,
    title: 'Mi puesto en procesión',
    desc: 'Elige qué portarás en la estación de penitencia',
    cofrade: true,
  },
  {
    to: '/mi/cuotas',
    icon: CheckCircle2,
    title: 'Mis cuotas',
    desc: 'Estado de tu cuota anual y métodos de pago',
    cofrade: false,
  },
  {
    to: '/mi/tienda',
    icon: ShoppingBag,
    title: 'Tienda',
    desc: 'Palmas, medallas y materiales oficiales',
    cofrade: false,
  },
  {
    href: '/#procesion',
    icon: MapPin,
    title: 'GPS en vivo',
    desc: 'Sigue el paso en tiempo real durante la procesión',
    cofrade: false,
  },
];

export default function DashboardPage() {
  const { sessionHermano, isCofrade } = useAuthStore();
  const hermano = sessionHermano!.hermano;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 md:py-14">

      {/* Cabecera */}
      <div className="mb-8 md:mb-10">
        <SectionLabel>Mi área</SectionLabel>
        <h1 className="font-display text-3xl md:text-4xl text-primary mt-1">
          Bienvenido, {hermano.nombre}
        </h1>
        <p className="font-body text-sm text-primary/45 mt-1">{hermano.apellidos}</p>
        <div className="mt-4">
          <EstadoBadge estado={hermano.estado} esCofrade={hermano.es_cofrade} />
        </div>
        <GoldenDivider className="justify-start mt-6" />
      </div>

      {/* Aviso cuota pendiente */}
      {hermano.estado === 'pendiente_pago' && (
        <div className="mb-8 border border-amber-400/30 bg-amber-50/60 p-4 md:p-5 flex items-start gap-4">
          <AlertCircle className="text-amber-500 mt-0.5 shrink-0" size={18} />
          <div className="flex-1 min-w-0">
            <p className="font-serif text-sm text-primary font-medium">Cuota pendiente</p>
            <p className="font-body text-xs text-primary/60 mt-0.5 leading-relaxed">
              Abona tu cuota anual de <strong>10 €</strong> para activarte como Hermano Cofrade
              y desbloquear todas las funciones.
            </p>
            <Link to="/mi/cuotas">
              <Button
                size="sm"
                className="mt-3 bg-primary text-primary-foreground rounded-none font-body text-[10px] tracking-widest uppercase hover:bg-primary/90"
              >
                Pagar cuota
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Grid de accesos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {ACCESOS.map(({ to, href, icon: Icon, title, desc, cofrade }) => {
          const key = to ?? href!;
          const bloqueado = cofrade && !isCofrade;
          const cardContent = (
            <div className="border border-secondary/15 p-5 h-full flex items-center gap-4 group-hover:border-secondary/40 group-hover:bg-secondary/4 transition-all">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center border border-secondary/25 text-secondary group-hover:bg-secondary/8 transition-colors">
                <Icon size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm text-primary">{title}</p>
                <p className="font-body text-[11px] text-primary/45 mt-0.5 leading-snug">{desc}</p>
              </div>
              <ChevronRight size={14} className="shrink-0 text-primary/20 group-hover:text-secondary transition-colors" />
            </div>
          );

          if (href) {
            return (
              <a key={key} href={href} className="no-underline group block">
                {cardContent}
              </a>
            );
          }

          return (
            <Link
              key={key}
              to={bloqueado ? '#' : to!}
              className={cn('no-underline group block', bloqueado && 'pointer-events-none opacity-35')}
            >
              {cardContent}
            </Link>
          );
        })}
      </div>

      {/* Datos personales */}
      <div className="mt-10 md:mt-12 pt-7 border-t border-secondary/10">
        <div className="flex items-center gap-2 mb-5">
          <User size={12} className="text-primary/30" />
          <p className="font-body text-[10px] tracking-widest uppercase text-primary/35">Tus datos</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: 'Email', value: hermano.email },
            { label: 'Teléfono', value: hermano.telefono },
            { label: 'Alta', value: new Date(hermano.fecha_alta).toLocaleDateString('es-ES') },
            { label: 'Dirección', value: hermano.direccion },
            { label: 'Bautizado', value: hermano.bautizado ? 'Sí' : 'No' },
            { label: 'Cofrade', value: hermano.es_cofrade ? 'Sí' : 'No' },
          ].map(({ label, value }) => (
            <div key={label} className="min-w-0">
              <span className="block font-body text-[9px] uppercase tracking-widest text-primary/30 mb-0.5">{label}</span>
              <span className="font-body text-xs text-primary/60 truncate block">{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npm run build
```

Debe completar sin errores TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/pages/hermano/DashboardPage.tsx
git commit -m "fix: corregir rutas rotas en DashboardPage (tienda y GPS)"
```

---

## Task 3: Corregir accesos rápidos en AdminDashboardPage

**Archivo:** `src/pages/admin/AdminDashboardPage.tsx`

Los "accesos rápidos" usan `<a href={href}>` causando recarga completa de página. Se sustituyen por `<Link to={href}>`.

- [ ] **Step 1: Añadir import de Link y reemplazar `<a>` por `<Link>`**

Abre `src/pages/admin/AdminDashboardPage.tsx`. Localiza la línea 1:

```tsx
import { useEffect, useState } from 'react';
```

Cámbiala a:

```tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
```

Luego localiza el bloque de accesos rápidos (líneas 76–87 aproximadamente):

```tsx
{[
  { label: 'Ver hermanos', href: '/admin/hermanos' },
  { label: 'Crear noticia', href: '/admin/noticias' },
  { label: 'Gestionar GPS', href: '/admin/gps' },
  { label: 'Ver pedidos', href: '/admin/tienda' },
].map(({ label, href }) => (
  <a key={href} href={href}
    className="px-4 py-2 border border-secondary/30 font-serif text-[10px] tracking-widest uppercase
               text-secondary hover:bg-secondary/10 transition-colors no-underline">
    {label}
  </a>
))}
```

Reemplázalo con:

```tsx
{[
  { label: 'Ver hermanos', href: '/admin/hermanos' },
  { label: 'Crear noticia', href: '/admin/noticias' },
  { label: 'Gestionar GPS', href: '/admin/gps' },
  { label: 'Ver pedidos', href: '/admin/tienda' },
].map(({ label, href }) => (
  <Link key={href} to={href}
    className="px-4 py-2 border border-secondary/30 font-serif text-[10px] tracking-widest uppercase
               text-secondary hover:bg-secondary/10 transition-colors no-underline">
    {label}
  </Link>
))}
```

- [ ] **Step 2: Verificar compilación**

```bash
npm run build
```

Debe completar sin errores TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/pages/admin/AdminDashboardPage.tsx
git commit -m "fix: usar Link de React Router en accesos rápidos del admin dashboard"
```

---

## Task 4: Navbar admin móvil (hamburger + drawer)

**Archivo:** `src/layouts/AdminLayout.tsx`

El sidebar actual solo funciona en desktop. Se añade:
- El sidebar existente se oculta en móvil con `hidden md:flex`
- Un header fijo móvil (`md:hidden`) con logo y botón hamburger
- Un drawer lateral animado con `framer-motion` que replica el contenido del sidebar
- El `<main>` recibe `pt-14 md:pt-0` para compensar el header fijo en móvil

`framer-motion` ya es dependencia del proyecto (usada en `Navbar.tsx`).

- [ ] **Step 1: Reemplazar el contenido completo de AdminLayout.tsx**

```tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { hermanoRepository } from '../database/repositories';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard, Users, Newspaper, MapPin, ShoppingBag,
  LogOut, ChevronRight, Landmark, ListOrdered, Menu, X,
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/hermanos', icon: Users, label: 'Hermanos' },
  { to: '/admin/cuentas', icon: Landmark, label: 'Cuentas' },
  { to: '/admin/procesion', icon: ListOrdered, label: 'Procesión' },
  { to: '/admin/noticias', icon: Newspaper, label: 'Noticias' },
  { to: '/admin/gps', icon: MapPin, label: 'GPS Procesión' },
  { to: '/admin/tienda', icon: ShoppingBag, label: 'Tienda' },
];

function SidebarContent({ onNavClick, onLogout, nombre, apellidos }: {
  onNavClick?: () => void;
  onLogout: () => void;
  nombre?: string;
  apellidos?: string;
}) {
  return (
    <>
      <div className="px-5 py-6 border-b border-white/10">
        <p className="font-display text-[11px] tracking-[0.25em] uppercase text-secondary">
          Hermandad JHS
        </p>
        <p className="font-body text-[10px] text-primary-foreground/50 mt-0.5 tracking-widest uppercase">
          Panel Admin
        </p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 text-[11px] tracking-widest uppercase font-body transition-colors
               ${isActive
                ? 'bg-secondary/20 text-secondary'
                : 'text-primary-foreground/60 hover:text-primary-foreground hover:bg-white/5'}`
            }
          >
            <Icon size={14} />
            {label}
            <ChevronRight size={10} className="ml-auto opacity-40" />
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 border-t border-white/10">
        <p className="font-body text-[10px] text-primary-foreground/50 truncate">
          {nombre} {apellidos}
        </p>
        <button
          onClick={onLogout}
          className="mt-2 flex items-center gap-2 text-[10px] tracking-widest uppercase
                     text-primary-foreground/40 hover:text-secondary transition-colors"
        >
          <LogOut size={12} />
          Cerrar sesión
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { sessionHermano, clearSession } = useAuthStore();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await hermanoRepository.logout();
    clearSession();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  const nombre = sessionHermano?.hermano.nombre;
  const apellidos = sessionHermano?.hermano.apellidos;

  return (
    <div className="min-h-screen flex bg-background">

      {/* Sidebar desktop */}
      <aside className="hidden md:flex w-56 border-r border-secondary/15 flex-col bg-primary text-primary-foreground">
        <SidebarContent onLogout={handleLogout} nombre={nombre} apellidos={apellidos} />
      </aside>

      {/* Header móvil */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary border-b border-white/10 h-14 flex items-center justify-between px-4">
        <div>
          <p className="font-display text-[11px] tracking-[0.25em] uppercase text-secondary">Hermandad JHS</p>
          <p className="font-body text-[9px] text-primary-foreground/50 tracking-widest uppercase">Panel Admin</p>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-primary-foreground/70 hover:text-secondary transition-colors p-1"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Drawer móvil */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden fixed inset-0 z-40 bg-black/60"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-56 bg-primary text-primary-foreground flex flex-col"
            >
              <button
                onClick={() => setDrawerOpen(false)}
                className="absolute top-3 right-3 text-primary-foreground/50 hover:text-secondary transition-colors p-1"
                aria-label="Cerrar menú"
              >
                <X size={16} />
              </button>
              <SidebarContent
                onNavClick={() => setDrawerOpen(false)}
                onLogout={handleLogout}
                nombre={nombre}
                apellidos={apellidos}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Contenido */}
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <Outlet />
      </main>

    </div>
  );
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npm run build
```

Debe completar sin errores TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/AdminLayout.tsx
git commit -m "feat: navbar admin móvil con hamburger y drawer animado"
```
