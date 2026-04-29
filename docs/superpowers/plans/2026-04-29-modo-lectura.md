# Modo Lectura — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Añadir un "Modo Lectura" con fuentes grandes, alto contraste y zonas de clic amplias, activable desde el Navbar y persistido en localStorage.

**Architecture:** Un Zustand store (`readingModeStore`) con `persist` guarda el estado. `GlobalLayout` suscribe al store y añade/quita la clase `reading-mode` en `<html>`. Los estilos en `index.css` sobreescriben las CSS custom properties del tema (`--color-background`, `--color-foreground`, etc.) cuando la clase está activa. El botón "Aa" en el Navbar llama a `toggleReadingMode()`.

**Tech Stack:** React 19, TypeScript, Zustand + persist middleware, Tailwind CSS v4 (CSS custom properties), lucide-react.

---

## Estructura de archivos

| Acción | Archivo | Responsabilidad |
|--------|---------|-----------------|
| Crear | `src/stores/readingModeStore.ts` | Estado global + persistencia localStorage |
| Modificar | `src/layouts/GlobalLayout.tsx` | Sincronizar clase `reading-mode` en `<html>` |
| Modificar | `src/index.css` | Estilos CSS del modo lectura |
| Modificar | `src/components/layout/Navbar.tsx` | Botón "Aa" toggle (desktop + móvil) |

---

### Task 1: Crear readingModeStore

**Files:**
- Create: `src/stores/readingModeStore.ts`

- [ ] **Step 1: Crear el store**

Crea `src/stores/readingModeStore.ts` con este contenido exacto (mismo patrón que `src/stores/carritoStore.ts`):

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface ReadingModeState {
  isReadingMode: boolean;
  toggleReadingMode: () => void;
}

export const useReadingModeStore = create<ReadingModeState>()(
  persist(
    (set) => ({
      isReadingMode: false,
      toggleReadingMode: () => set((s) => ({ isReadingMode: !s.isReadingMode })),
    }),
    {
      name: 'jhs-reading-mode',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

- [ ] **Step 2: Verificar compilación**

```bash
npm run build
```

Salida esperada: `✓ built in ~750ms` sin errores TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/stores/readingModeStore.ts
git commit -m "feat: añadir readingModeStore con persistencia localStorage"
```

---

### Task 2: Sincronizar clase en GlobalLayout

**Files:**
- Modify: `src/layouts/GlobalLayout.tsx`

El archivo actual está en líneas 1–37. Necesita:
1. Import de `useReadingModeStore`
2. Un `useEffect` que añada/quite la clase `reading-mode` en `document.documentElement`

- [ ] **Step 1: Actualizar GlobalLayout.tsx**

Reemplaza todo el contenido del archivo con:

```tsx
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useReadingModeStore } from '../stores/readingModeStore';

export default function GlobalLayout() {
  const [showTop, setShowTop] = useState(false);
  const { isReadingMode } = useReadingModeStore();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const isAdminRoute = location.pathname.startsWith('/admin');
    document.documentElement.classList.toggle(
      'reading-mode',
      isReadingMode && !isAdminRoute
    );
  }, [isReadingMode, location.pathname]);

  return (
    <>
      <Outlet />

      <AnimatePresence>
        {showTop && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 z-50 w-10 h-10 flex items-center justify-center
                       bg-primary text-primary-foreground border border-secondary/30
                       hover:bg-secondary hover:text-secondary-foreground transition-colors shadow-lg"
            aria-label="Volver arriba"
          >
            <ArrowUp size={16} />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
```

- [ ] **Step 2: Verificar compilación**

```bash
npm run build
```

Salida esperada: `✓ built in ~750ms` sin errores TypeScript.

- [ ] **Step 3: Commit**

```bash
git add src/layouts/GlobalLayout.tsx
git commit -m "feat: sincronizar clase reading-mode en <html> desde GlobalLayout"
```

---

### Task 3: Añadir estilos CSS del modo lectura

**Files:**
- Modify: `src/index.css`

El archivo actual tiene 46 líneas. Se añade el bloque `html.reading-mode` al final, después del cierre de `@layer base`.

Cómo funciona: Tailwind v4 define las custom properties del tema en `:root`. Al sobreescribirlas en `html.reading-mode`, **todas las utilidades de Tailwind que usan esas variables** (`bg-background`, `text-foreground`, `bg-primary`, etc.) cambian automáticamente. Para los textos con tamaños fijos en px del navbar, se añaden reglas CSS directas con mayor especificidad.

- [ ] **Step 1: Añadir bloque reading-mode al final de index.css**

Añade estas líneas al final de `src/index.css` (después de la línea 46):

```css

/* === MODO LECTURA === */
html.reading-mode {
  --color-background: #FFFFFF;
  --color-foreground: #000000;
  --color-primary: #000000;
  --color-primary-foreground: #FFFFFF;
  --color-secondary: #7A5600;
  --color-secondary-foreground: #FFFFFF;
  --color-accent: #C9A800;
  --color-accent-foreground: #000000;
  --color-muted: #F0F0F0;
  --color-muted-foreground: #111111;
  --color-border: rgba(0, 0, 0, 0.25);
}

html.reading-mode body {
  font-size: 118%;
  line-height: 1.7;
}

/* Navbar: overrides para textos hardcodeados en px */
html.reading-mode nav a,
html.reading-mode nav button {
  font-size: 0.85rem;
}
```

El selector `html.reading-mode nav a` tiene especificidad `(0,1,2)`, superior a la de `.text-\[10px\]` `(0,1,0)`, por lo que no necesita `!important`.

- [ ] **Step 2: Verificar compilación**

```bash
npm run build
```

Salida esperada: `✓ built in ~750ms` sin errores.

- [ ] **Step 3: Verificación manual rápida**

Abre las DevTools del navegador en cualquier página, ejecuta en consola:

```js
document.documentElement.classList.add('reading-mode')
```

Verifica que el fondo cambia a blanco, el texto a negro y los colores del tema se actualizan. Ejecuta:

```js
document.documentElement.classList.remove('reading-mode')
```

Verifica que los estilos vuelven al estado original.

- [ ] **Step 4: Commit**

```bash
git add src/index.css
git commit -m "feat: añadir estilos CSS del modo lectura (alto contraste, fuentes grandes)"
```

---

### Task 4: Botón "Aa" en el Navbar

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

El Navbar actual tiene dos zonas donde se muestra el toggle:
1. **Desktop** (líneas 56–117): dentro de `<div className="hidden md:flex items-center gap-2">`
2. **Móvil** (líneas 149–163): dentro del menú animado, después del map de `PUBLIC_LINKS`

- [ ] **Step 1: Añadir import del store**

En `src/components/layout/Navbar.tsx`, localiza la línea 7:

```tsx
import { useState } from 'react';
```

Cámbiala a:

```tsx
import { useState } from 'react';
import { useReadingModeStore } from '@/stores/readingModeStore';
```

- [ ] **Step 2: Destruturar el store dentro de Navbar()**

Localiza la línea 18 (dentro de la función `Navbar`):

```tsx
  const { isAuthenticated, isAdmin, sessionHermano, clearSession } = useAuthStore();
```

Añade justo debajo:

```tsx
  const { isReadingMode, toggleReadingMode } = useReadingModeStore();
```

- [ ] **Step 3: Añadir botón "Aa" en la zona desktop**

Localiza las líneas 56–57:

```tsx
        {/* Acciones — desktop */}
        <div className="hidden md:flex items-center gap-2">
```

Reemplaza esas dos líneas con:

```tsx
        {/* Acciones — desktop */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={toggleReadingMode}
            aria-label="Activar modo lectura"
            aria-pressed={isReadingMode}
            className={`font-body text-[10px] tracking-widest uppercase transition-colors flex items-center px-2 py-1
              ${isReadingMode
                ? 'text-secondary font-semibold'
                : 'text-primary/35 hover:text-secondary'}`}
          >
            Aa
          </button>
```

- [ ] **Step 4: Añadir botón "Modo Lectura" en el menú móvil**

Localiza las líneas 163–164 (justo después del cierre del map de PUBLIC_LINKS y antes del div de auth):

```tsx
            </motion.a>
          ))}

              <div className="pt-4 space-y-2">
```

Reemplaza esa sección con:

```tsx
            </motion.a>
          ))}

          <motion.button
            onClick={toggleReadingMode}
            initial={{ x: -12, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: PUBLIC_LINKS.length * 0.05, duration: 0.2 }}
            aria-pressed={isReadingMode}
            className={`w-full text-left flex items-center justify-between py-2.5 border-b border-secondary/8
                        font-body text-[11px] tracking-[0.2em] uppercase transition-colors
                        ${isReadingMode ? 'text-secondary' : 'text-primary/60 hover:text-secondary'}`}
          >
            Modo Lectura
            <span className={`text-[9px] px-1.5 py-0.5 font-bold
              ${isReadingMode ? 'bg-secondary text-secondary-foreground' : 'bg-primary/10 text-primary/40'}`}>
              Aa
            </span>
          </motion.button>

              <div className="pt-4 space-y-2">
```

- [ ] **Step 5: Verificar compilación**

```bash
npm run build
```

Salida esperada: `✓ built in ~750ms` sin errores TypeScript.

- [ ] **Step 6: Verificación manual**

Abre el servidor de desarrollo:

```bash
npm run dev
```

Navega a `http://localhost:5173`. Verifica:

1. El botón "Aa" aparece en el navbar desktop (entre el logo y los enlaces de acción)
2. Al hacer clic, el fondo cambia a blanco, el texto a negro, y el botón "Aa" se resalta en dorado oscuro
3. Navega a `/noticias` — el modo se mantiene activo
4. Recarga la página — el modo se restaura desde localStorage
5. En móvil (viewport < 768px), "Modo Lectura" aparece en el menú hamburguesa tras los enlaces de navegación
6. Al hacer clic en "Modo Lectura" desde el móvil, el badge "Aa" se resalta y los estilos cambian

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: añadir botón 'Aa' de modo lectura en navbar (desktop y móvil)"
```
