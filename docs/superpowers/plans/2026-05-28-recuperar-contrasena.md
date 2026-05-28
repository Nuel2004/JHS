# Recuperar Contraseña Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar el flujo completo de recuperación de contraseña vía email usando Supabase Auth.

**Architecture:** Dos páginas nuevas (`/recuperar-password` para solicitar el email y `/reset-password` para establecer la nueva contraseña) conectadas por el email que envía Supabase. El repositorio ya tiene `recuperarPassword` implementado; sólo falta añadir `actualizarPassword`, crear las páginas y añadir las rutas.

**Tech Stack:** React 19, React Router 7, Supabase JS v2, Zustand, TailwindCSS, shadcn/ui, react-hot-toast, Lucide React.

---

## Archivos

| Acción   | Archivo                                                              | Responsabilidad                                      |
|----------|----------------------------------------------------------------------|------------------------------------------------------|
| Modificar | `src/database/repositories/HermanoRepository.ts`                    | Añadir firma `actualizarPassword` a la interfaz      |
| Modificar | `src/database/supabase/SupabaseHermanoRepository.ts`                | Implementar `actualizarPassword`                     |
| Crear     | `src/pages/auth/RecuperarPasswordPage.tsx`                          | Formulario de solicitud de email                     |
| Crear     | `src/pages/auth/ResetPasswordPage.tsx`                              | Formulario de nueva contraseña                       |
| Modificar | `src/App.tsx`                                                        | Añadir las dos rutas nuevas                          |

---

### Task 1: Añadir `actualizarPassword` al repositorio

**Files:**
- Modify: `src/database/repositories/HermanoRepository.ts:66`
- Modify: `src/database/supabase/SupabaseHermanoRepository.ts:132`

- [ ] **Step 1: Añadir firma a la interfaz**

En `src/database/repositories/HermanoRepository.ts`, añadir después de la línea 66 (la firma de `recuperarPassword`):

```typescript
  /** Actualiza la contraseña del usuario con sesión de recuperación activa */
  actualizarPassword(password: string): Promise<{ error?: string }>;
```

El bloque `HermanoRepository` queda así al final:

```typescript
  /** Envía email de recuperación de contraseña */
  recuperarPassword(email: string): Promise<{ error?: string }>;

  /** Actualiza la contraseña del usuario con sesión de recuperación activa */
  actualizarPassword(password: string): Promise<{ error?: string }>;
}
```

- [ ] **Step 2: Implementar en SupabaseHermanoRepository**

En `src/database/supabase/SupabaseHermanoRepository.ts`, añadir después del método `recuperarPassword` (línea 137), antes del cierre de clase `}`:

```typescript
  async actualizarPassword(password: string): Promise<{ error?: string }> {
    const { error } = await supabaseClient.auth.updateUser({ password });
    return { error: error?.message };
  }
```

- [ ] **Step 3: Verificar que TypeScript no tiene errores**

```bash
npx tsc --noEmit
```

Esperado: sin errores de tipo.

- [ ] **Step 4: Commit**

```bash
git add src/database/repositories/HermanoRepository.ts src/database/supabase/SupabaseHermanoRepository.ts
git commit -m "feat: add actualizarPassword to hermano repository"
```

---

### Task 2: Crear RecuperarPasswordPage

**Files:**
- Create: `src/pages/auth/RecuperarPasswordPage.tsx`

Esta página muestra un formulario con un campo de email. Al enviar llama a `hermanoRepository.recuperarPassword(email)` y muestra un mensaje de éxito. La ruta `/recuperar-password` ya está enlazada desde `LoginPage.tsx:97`.

- [ ] **Step 1: Crear el archivo**

```typescript
// src/pages/auth/RecuperarPasswordPage.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { hermanoRepository } from '@/database/repositories';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { Loader2, MailCheck } from 'lucide-react';

export default function RecuperarPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await hermanoRepository.recuperarPassword(email);
    setLoading(false);
    if (error) {
      toast.error('No se pudo enviar el correo. Inténtalo de nuevo.');
      return;
    }
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-6">
      <Link
        to="/login"
        className="font-serif text-[10px] tracking-widest text-secondary uppercase mb-8 no-underline hover:text-secondary/70 transition-colors"
      >
        ← Volver al acceso
      </Link>

      <div className="flex justify-center mb-6">
        <SectionLabel>Recuperar contraseña</SectionLabel>
      </div>

      <Card className="w-full max-w-md bg-muted/30 border-secondary/20 rounded-none shadow-none">
        <CardHeader className="text-center border-b border-secondary/10 pb-6">
          <CardTitle className="font-display text-3xl text-primary">
            {sent ? 'Correo enviado' : 'Recuperar acceso'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          {sent ? (
            <div className="flex flex-col items-center gap-4 text-center">
              <MailCheck size={40} className="text-secondary" />
              <p className="font-body text-sm text-primary/70">
                Hemos enviado un enlace de recuperación a{' '}
                <span className="text-primary font-medium">{email}</span>.
                Revisa tu bandeja de entrada y también la carpeta de spam.
              </p>
              <GoldenDivider className="w-full my-2" />
              <Link
                to="/login"
                className="font-serif text-[10px] tracking-widest uppercase text-secondary/70 hover:text-secondary no-underline transition-colors"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase tracking-widest text-primary/70">
                  Correo electrónico
                </Label>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  className="bg-background border-secondary/30 rounded-none focus-visible:ring-secondary/50"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <GoldenDivider className="my-2" />

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-xs tracking-widest uppercase py-6"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : 'Enviar enlace'}
              </Button>

              <p className="text-center font-body text-[11px] text-primary/50">
                ¿Recuerdas tu contraseña?{' '}
                <Link to="/login" className="text-secondary hover:underline">
                  Inicia sesión
                </Link>
              </p>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verificar que TypeScript no tiene errores**

```bash
npx tsc --noEmit
```

Esperado: sin errores de tipo.

- [ ] **Step 3: Commit**

```bash
git add src/pages/auth/RecuperarPasswordPage.tsx
git commit -m "feat: add RecuperarPasswordPage for password reset requests"
```

---

### Task 3: Crear ResetPasswordPage

**Files:**
- Create: `src/pages/auth/ResetPasswordPage.tsx`

Esta página recibe al usuario tras hacer clic en el enlace del email. Supabase procesa automáticamente el token del hash de la URL y establece una sesión de recuperación. La página comprueba que la sesión existe, muestra el formulario de nueva contraseña y llama a `hermanoRepository.actualizarPassword`.

- [ ] **Step 1: Crear el archivo**

```typescript
// src/pages/auth/ResetPasswordPage.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { hermanoRepository } from '@/database/repositories';
import { supabaseClient } from '@/database/supabase/Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SectionLabel, GoldenDivider } from '@/components/landing/Helpers';
import { Eye, EyeOff, Loader2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [sessionReady, setSessionReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({ password: '', confirm: '' });

  useEffect(() => {
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSessionReady(true);
      } else {
        toast.error('El enlace ha caducado o no es válido.');
        navigate('/recuperar-password');
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Las contraseñas no coinciden.');
      return;
    }
    if (form.password.length < 6) {
      toast.error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    setLoading(true);
    const { error } = await hermanoRepository.actualizarPassword(form.password);
    if (error) {
      toast.error(error);
      setLoading(false);
      return;
    }
    await supabaseClient.auth.signOut();
    toast.success('Contraseña actualizada. Ya puedes iniciar sesión.');
    navigate('/login');
  };

  if (!sessionReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-secondary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center py-12 px-6">
      <Link
        to="/login"
        className="font-serif text-[10px] tracking-widest text-secondary uppercase mb-8 no-underline hover:text-secondary/70 transition-colors"
      >
        ← Volver al acceso
      </Link>

      <div className="flex justify-center mb-6">
        <SectionLabel>Nueva contraseña</SectionLabel>
      </div>

      <Card className="w-full max-w-md bg-muted/30 border-secondary/20 rounded-none shadow-none">
        <CardHeader className="text-center border-b border-secondary/10 pb-6">
          <CardTitle className="font-display text-3xl text-primary">
            Establece tu contraseña
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-primary/70">
                Nueva contraseña
              </Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="bg-background border-secondary/30 rounded-none focus-visible:ring-secondary/50 pr-10"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/70"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-primary/70">
                Confirmar contraseña
              </Label>
              <div className="relative">
                <Input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  className="bg-background border-secondary/30 rounded-none focus-visible:ring-secondary/50 pr-10"
                  value={form.confirm}
                  onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary/70"
                >
                  {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <GoldenDivider className="my-2" />

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-serif text-xs tracking-widest uppercase py-6"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : 'Cambiar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
```

- [ ] **Step 2: Verificar que TypeScript no tiene errores**

```bash
npx tsc --noEmit
```

Esperado: sin errores de tipo.

- [ ] **Step 3: Commit**

```bash
git add src/pages/auth/ResetPasswordPage.tsx
git commit -m "feat: add ResetPasswordPage for setting new password"
```

---

### Task 4: Añadir rutas en App.tsx

**Files:**
- Modify: `src/App.tsx`

Dos cambios:
1. Importar las dos páginas nuevas.
2. Añadir `/recuperar-password` dentro de `PublicRoute > NavbarPageLayout` (solo usuarios no autenticados).
3. Añadir `/reset-password` fuera de cualquier guard dentro de `NavbarPageLayout` (accesible siempre para procesar el token de Supabase).

- [ ] **Step 1: Añadir imports**

En `src/App.tsx`, tras la línea `import RegisterPage from './pages/auth/RegisterPage';` (línea 25), añadir:

```typescript
import RecuperarPasswordPage from './pages/auth/RecuperarPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
```

- [ ] **Step 2: Añadir `/recuperar-password` en PublicRoute**

Localizar el bloque `PublicRoute` (líneas 66-77). Añadir la nueva ruta junto a `/login` y `/registro`:

```typescript
      // ── Auth (solo no autenticados) ──────────────────────────
      {
        element: <PublicRoute />,
        children: [
          {
            element: <NavbarPageLayout />,
            children: [
              { path: '/login', element: <LoginPage /> },
              { path: '/registro', element: <RegisterPage /> },
              { path: '/recuperar-password', element: <RecuperarPasswordPage /> },
            ],
          },
        ],
      },
```

- [ ] **Step 3: Añadir `/reset-password` como ruta pública libre**

Añadir dentro del bloque de rutas públicas (las que están dentro de `NavbarPageLayout` sin guard, líneas 54-63), junto a `/noticias`, `/contacto`, etc.:

```typescript
      {
        element: <NavbarPageLayout />,
        children: [
          { path: '/noticias', element: <NoticiasPage /> },
          { path: '/contacto', element: <ContactoPage /> },
          { path: '/redes-sociales', element: <RedesSocialesPage /> },
          { path: '/aviso-legal', element: <AvisoLegalPage /> },
          { path: '/privacidad', element: <PrivacidadPage /> },
          { path: '/cookies', element: <CookiesPage /> },
          { path: '/reset-password', element: <ResetPasswordPage /> },
        ],
      },
```

- [ ] **Step 4: Verificar que TypeScript no tiene errores**

```bash
npx tsc --noEmit
```

Esperado: sin errores de tipo.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add routes for recuperar-password and reset-password"
```

---

### Task 5: Configurar redirect URL en Supabase Dashboard (paso manual)

Este paso lo hace el usuario en el panel de Supabase. Sin él el email de recuperación llevará a una URL bloqueada.

- [ ] **Step 1: Abrir Supabase Dashboard**

Ir a [https://supabase.com/dashboard/project/ovmxfjermsrwmhbvinwp/auth/url-configuration](https://supabase.com/dashboard/project/ovmxfjermsrwmhbvinwp/auth/url-configuration)

- [ ] **Step 2: Añadir URLs permitidas en "Redirect URLs"**

Añadir estas dos entradas (una para dev, una para producción si aplica):

```
http://localhost:5173/reset-password
https://TU-DOMINIO-PRODUCCION.com/reset-password
```

- [ ] **Step 3: Guardar**

Hacer clic en "Save" o "Add".

---

### Task 6: Prueba manual del flujo completo

- [ ] **Step 1: Iniciar servidor de desarrollo**

```bash
npm run dev
```

- [ ] **Step 2: Verificar que `/recuperar-password` carga**

Ir a `http://localhost:5173/recuperar-password`. Debe mostrarse el formulario de email con el estilo dorado de la app.

- [ ] **Step 3: Verificar que el enlace desde Login funciona**

Ir a `http://localhost:5173/login`. El enlace "¿Olvidaste tu contraseña?" debe navegar a `/recuperar-password`.

- [ ] **Step 4: Enviar el email**

Introducir un email registrado en la hermandad y pulsar "Enviar enlace". Debe aparecer el mensaje de éxito con el ícono de correo y el email introducido.

- [ ] **Step 5: Comprobar el email**

Revisar la bandeja del email (y spam). Debe llegar un correo de Supabase con un enlace de recuperación.

- [ ] **Step 6: Hacer clic en el enlace**

El navegador debe redirigir a `http://localhost:5173/reset-password` y mostrar el formulario de nueva contraseña (no el spinner infinito).

- [ ] **Step 7: Establecer nueva contraseña**

Introducir una nueva contraseña (≥6 caracteres) y confirmarla. Al enviar debe aparecer el toast "Contraseña actualizada" y redirigir a `/login`.

- [ ] **Step 8: Verificar login con nueva contraseña**

Iniciar sesión con el email y la nueva contraseña. Debe funcionar correctamente.
