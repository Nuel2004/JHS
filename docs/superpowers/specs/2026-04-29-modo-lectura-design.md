# Modo Lectura — Diseño

**Fecha:** 2026-04-29
**Proyecto:** JHS (Cofradía Jesús Hombre Salvador, Montijo)

## Objetivo

Añadir un "Modo Lectura" a la web pública y a las páginas de hermanos autenticados. Al activarse, aplica fuentes más grandes, alto contraste (negro/blanco) y zonas de clic más amplias para facilitar la navegación a usuarios con dificultades visuales.

---

## Alcance

| Área | Incluida |
|------|----------|
| Páginas públicas (`/`, `/noticias`, `/contacto`) | ✅ |
| Páginas de hermanos (`/dashboard`, `/mi/*`) | ✅ |
| Panel de administración (`/admin/*`) | ❌ |

---

## Arquitectura

### 1. Store — `src/stores/readingModeStore.ts`

Zustand store con `persist` middleware (mismo patrón que `carritoStore`):

```ts
interface ReadingModeStore {
  isReadingMode: boolean;
  toggleReadingMode: () => void;
}
```

- Persistencia: `localStorage`, key `jhs-reading-mode`
- La preferencia se recuerda entre sesiones

### 2. Activación global — `src/layouts/GlobalLayout.tsx`

`GlobalLayout` ya envuelve todas las rutas. Se añade un `useEffect` que suscribe al store y añade/quita la clase `reading-mode` en el elemento `<html>`:

```ts
useEffect(() => {
  document.documentElement.classList.toggle('reading-mode', isReadingMode);
}, [isReadingMode]);
```

Un único punto de control afecta toda la app.

### 3. Estilos — `src/index.css`

Dentro de `html.reading-mode { ... }` se sobreescriben las CSS custom properties del tema:

| Propiedad | Normal | Modo Lectura |
|-----------|--------|--------------|
| `--color-background` | `#F5F2E9` | `#FFFFFF` |
| `--color-foreground` | `#1B3022` | `#000000` |
| `--color-primary` | `#1B3022` | `#000000` |
| `--color-primary-foreground` | `#F5F2E9` | `#FFFFFF` |
| `--color-secondary` | `#B8860B` | `#E5A800` |
| `--color-muted` | `#E2E0D7` | `#F0F0F0` |
| `--color-border` | `rgba(27,48,34,0.1)` | `rgba(0,0,0,0.3)` |

Reglas de tipografía adicionales en `html.reading-mode`:

```css
html.reading-mode body {
  font-size: 118%;
  line-height: 1.7;
}

/* Textos fijos en px pequeños: escalar directamente */
html.reading-mode .font-body {
  letter-spacing: 0.01em;
}
```

Para los textos con tamaños arbitrarios en px (`text-[10px]`, `text-[11px]`, etc.) que no responden al `font-size` base, se añaden reglas CSS explícitas en `html.reading-mode` apuntando a los selectores del navbar (links de navegación y botón de acceder), que son los elementos de texto más pequeños y más críticos para la accesibilidad.

### 4. Botón toggle — `src/components/layout/Navbar.tsx`

Botón "Aa" a la derecha de los enlaces de navegación, antes del botón de acceder:

- **Inactivo:** estilo discreto (igual que los links del nav, texto tenue)
- **Activo:** fondo dorado (`bg-secondary`), texto oscuro — igual que en el mockup

El botón llama a `toggleReadingMode()` del store.

Aparece tanto en la versión desktop como en el menú móvil (el navbar ya tiene lógica responsive).

---

## Navegación simplificada

La simplificación es puramente visual/táctil, sin cambios estructurales en rutas ni en el orden del menú:

- Los links del navbar tienen **mayor padding y texto más grande** en modo lectura → zona de clic ampliada
- Los botones de acción (Acceder, Mi área) tienen **mayor tamaño y contraste** → más fáciles de localizar
- El navbar ya es escueto (Inicio, Noticias, Contacto) — no se oculta ni reorganiza nada

---

## Archivos afectados

| Acción | Archivo |
|--------|---------|
| Crear | `src/stores/readingModeStore.ts` |
| Modificar | `src/layouts/GlobalLayout.tsx` |
| Modificar | `src/index.css` |
| Modificar | `src/components/layout/Navbar.tsx` |

---

## Comportamiento esperado

1. Usuario pulsa "Aa" en el navbar → modo lectura activo → clase `reading-mode` en `<html>` → CSS overrides aplicados instantáneamente
2. Navega a otra página → modo se mantiene (clase persiste en `<html>`, store persiste en localStorage)
3. Cierra y reabre el navegador → modo se restaura desde localStorage al montar `GlobalLayout`
4. Pulsa "Aa" de nuevo → modo desactivado → clase eliminada → estilos normales
