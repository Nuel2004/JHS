# Corrección de enlaces y navbar admin móvil — Diseño

**Fecha:** 2026-04-28
**Proyecto:** JHS (Cofradía Jesús Hombre Salvador, Montijo)

## Objetivo

Corregir todos los enlaces rotos del proyecto y añadir soporte de navegación móvil (hamburger + drawer) en el panel de administración.

---

## 1. Corrección de enlaces rotos

### 1.1 Footer (`src/components/layout/Footer.tsx`)

Actualmente todos los enlaces del footer usan `href="#"`. Se corrigen tres:

| Etiqueta | Antes | Después |
|----------|-------|---------|
| Noticias | `href="#"` | `href="/noticias"` |
| Tienda | `href="#"` | `href="/#tienda"` |
| Contacto | `href="#"` | `href="/contacto"` |
| Historia | `href="#"` | sin cambio |
| Privacidad | `href="#"` | sin cambio |

Las etiquetas pasan de `<a href="#">` a `<a href="...">` con el destino correcto.

### 1.2 DashboardPage hermano (`src/pages/hermano/DashboardPage.tsx`)

El array `ACCESOS` define dos rutas que no existen en el router:

| Campo | Antes | Después |
|-------|-------|---------|
| Tienda | `to: '/tienda'` | `to: '/mi/tienda'` |
| GPS en vivo | `<Link to='/procesion'>` | `<a href='/#procesion'>` (ancla en landing) |

El enlace GPS cambia de `<Link>` a `<a>` porque cruza de una ruta protegida (`/dashboard`) a un ancla en la landing pública (`/`). Se añade `className` equivalente para mantener el estilo, y se quita el `pointer-events-none / opacity-35` de bloqueo por cofrade (el mapa GPS es público).

### 1.3 AdminDashboardPage (`src/pages/admin/AdminDashboardPage.tsx`)

Los "accesos rápidos" usan `<a href={href}>` causando recarga completa de página. Se sustituyen por `<Link to={href}>` de React Router.

```tsx
// Antes
import { /* sin Link */ } from '...';
<a key={href} href={href} className="...">

// Después
import { Link } from 'react-router-dom';
<Link key={href} to={href} className="...">
```

### 1.4 Navbar (`src/components/layout/Navbar.tsx`)

El enlace `/#historia` no tiene ancla destino en la landing. Se deja sin cambios (decisión del usuario: el contenido de historia se añadirá en el futuro).

---

## 2. Navbar admin móvil

### Archivo afectado

`src/layouts/AdminLayout.tsx`

### Comportamiento

- **`md+` (desktop):** el sidebar actual (`w-56`) se muestra siempre. El header móvil está oculto (`hidden md:hidden` → `md:flex`).
- **`< md` (móvil):** el sidebar está oculto (`hidden md:flex`). Aparece una barra superior fija con el logo y un botón hamburger.

### Estructura del layout en móvil

```
┌─────────────────────────────────┐
│ Header móvil: Logo  |  ☰        │  ← fixed top, z-50
├─────────────────────────────────┤
│                                 │
│         Contenido (Outlet)      │
│                                 │
└─────────────────────────────────┘
```

Al pulsar ☰ se abre el drawer:

```
┌───────────────┬─────────────────┐
│ Drawer (w-56) │  Overlay oscuro │
│               │                 │
│  Logo         │  (clic cierra)  │
│  Nav items    │                 │
│  Usuario      │                 │
│  Logout       │                 │
└───────────────┴─────────────────┘
```

### Implementación

**Estado:**
```tsx
const [drawerOpen, setDrawerOpen] = useState(false);
```

**Header móvil** (nuevo, visible solo en `< md`):
```tsx
<div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary border-b border-white/10 h-14 flex items-center justify-between px-4">
  <div>
    <p className="font-display text-[11px] tracking-[0.25em] uppercase text-secondary">Hermandad JHS</p>
    <p className="font-body text-[9px] text-primary-foreground/50 tracking-widest uppercase">Panel Admin</p>
  </div>
  <button onClick={() => setDrawerOpen(true)} className="text-primary-foreground/70 hover:text-secondary transition-colors">
    <Menu size={20} />
  </button>
</div>
```

**Sidebar desktop** — se añade `hidden md:flex` a la etiqueta `<aside>` para ocultarlo en móvil.

**Drawer móvil** (nuevo, con `framer-motion`):
```tsx
<AnimatePresence>
  {drawerOpen && (
    <>
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="md:hidden fixed inset-0 z-40 bg-black/60"
        onClick={() => setDrawerOpen(false)}
      />
      {/* Drawer */}
      <motion.aside
        initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
        transition={{ type: 'tween', duration: 0.25 }}
        className="md:hidden fixed top-0 left-0 bottom-0 z-50 w-56 bg-primary flex flex-col"
      >
        {/* Mismo contenido que el sidebar desktop */}
      </motion.aside>
    </>
  )}
</AnimatePresence>
```

**Cierre automático al navegar:** cada `NavLink` llama a `setDrawerOpen(false)` en su `onClick`.

**Padding del contenido en móvil:** el `<main>` añade `pt-14 md:pt-0` para compensar el header fijo.

### Iconos añadidos

`Menu` de `lucide-react` (ya es dependencia). Se añade al import existente.

---

## Archivos afectados

| Acción | Archivo |
|--------|---------|
| Modificar | `src/components/layout/Footer.tsx` |
| Modificar | `src/pages/hermano/DashboardPage.tsx` |
| Modificar | `src/pages/admin/AdminDashboardPage.tsx` |
| Modificar | `src/layouts/AdminLayout.tsx` |

---

## Flujo de cambios por archivo

```
Footer.tsx         → 3 href actualizados
DashboardPage.tsx  → 2 destinos corregidos (tienda + procesion)
AdminDashboardPage → <a> → <Link>
AdminLayout.tsx    → aside hidden md:flex + header móvil + drawer animado
```
