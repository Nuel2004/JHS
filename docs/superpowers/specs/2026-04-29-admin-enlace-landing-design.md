# Enlace a la landing en el navbar admin — Diseño

**Fecha:** 2026-04-29
**Proyecto:** JHS (Cofradía Jesús Hombre Salvador, Montijo)

## Objetivo

Añadir un enlace "Ver web" en la zona inferior del sidebar/drawer del panel admin que lleve al administrador a la landing page pública (`/`).

---

## Archivo afectado

`src/layouts/AdminLayout.tsx` — único archivo modificado.

---

## Cambios

### 1. Imports

Añadir `Link` al import de `react-router-dom`:
```tsx
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
```

Añadir `Home` al import de `lucide-react`:
```tsx
import {
  LayoutDashboard, Users, Newspaper, MapPin, ShoppingBag,
  LogOut, ChevronRight, Landmark, ListOrdered, Menu, X, Home,
} from 'lucide-react';
```

### 2. Enlace en `SidebarContent`

En el bloque inferior de `SidebarContent` (la zona con nombre de usuario y logout), añadir el enlace **encima** del botón de logout:

```tsx
<div className="px-5 py-4 border-t border-white/10">
  <p className="font-body text-[10px] text-primary-foreground/50 truncate">
    {nombre} {apellidos}
  </p>
  <Link
    to="/"
    onClick={onNavClick}
    className="mt-2 flex items-center gap-2 text-[10px] tracking-widest uppercase
               text-primary-foreground/40 hover:text-secondary transition-colors"
  >
    <Home size={12} />
    Ver web
  </Link>
  <button
    onClick={onLogout}
    className="mt-2 flex items-center gap-2 text-[10px] tracking-widest uppercase
               text-primary-foreground/40 hover:text-secondary transition-colors"
  >
    <LogOut size={12} />
    Cerrar sesión
  </button>
</div>
```

### Comportamiento

- `onClick={onNavClick}`: en móvil cierra el drawer al navegar; en desktop `onNavClick` es `undefined` (no-op).
- Aparece en ambos contextos (sidebar desktop y drawer móvil) porque los dos usan `SidebarContent`.
- Estilo idéntico al logout para coherencia visual en la zona de utilidades.
