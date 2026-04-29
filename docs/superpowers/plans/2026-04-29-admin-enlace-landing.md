# Enlace landing en navbar admin — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un enlace "Ver web" en la zona inferior del sidebar/drawer admin que lleve a la landing pública (`/`).

**Architecture:** Un único cambio en `src/layouts/AdminLayout.tsx`: dos imports nuevos (`Link`, `Home`) y un `<Link to="/">` en el bloque inferior de `SidebarContent`, encima del botón de logout. Como `SidebarContent` es compartido por el sidebar desktop y el drawer móvil, el enlace aparece en ambos automáticamente.

**Tech Stack:** React 19, TypeScript, React Router v6, lucide-react, Tailwind CSS.

---

## Estructura de archivos

| Acción | Archivo |
|--------|---------|
| Modificar | `src/layouts/AdminLayout.tsx` |

---

### Task 1: Añadir enlace "Ver web" en SidebarContent

**Files:**
- Modify: `src/layouts/AdminLayout.tsx`

- [ ] **Step 1: Actualizar imports**

Abre `src/layouts/AdminLayout.tsx`. Localiza la línea 1:

```tsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
```

Cámbiala a:

```tsx
import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
```

Luego localiza las líneas 7–10:

```tsx
import {
  LayoutDashboard, Users, Newspaper, MapPin, ShoppingBag,
  LogOut, ChevronRight, Landmark, ListOrdered, Menu, X,
} from 'lucide-react';
```

Cámbialo a:

```tsx
import {
  LayoutDashboard, Users, Newspaper, MapPin, ShoppingBag,
  LogOut, ChevronRight, Landmark, ListOrdered, Menu, X, Home,
} from 'lucide-react';
```

- [ ] **Step 2: Añadir el enlace en SidebarContent**

Localiza el bloque inferior de `SidebarContent` (líneas 59–71 aproximadamente):

```tsx
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
```

Reemplázalo con:

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

- [ ] **Step 3: Verificar compilación**

```bash
npm run build
```

Debe completar sin errores TypeScript. Salida esperada: `✓ built in ~750ms`

- [ ] **Step 4: Commit**

```bash
git add src/layouts/AdminLayout.tsx
git commit -m "feat: añadir enlace 'Ver web' al sidebar del panel admin"
```
