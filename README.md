# ⛪ JHS Web — Cofradía Jesús Salvador de los Hombres

Plataforma digital oficial de la Cofradía **"Jesús Salvador de los Hombres"** de Montijo, Badajoz. Gestión de hermanos, seguimiento GPS en tiempo real de la procesión, tienda oficial y panel de administración completo.

> **Estado:** En desarrollo activo · Mayo 2026

---

## Índice

- [Características](#características)
- [Stack tecnológico](#stack-tecnológico)
- [Requisitos previos](#requisitos-previos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Scripts disponibles](#scripts-disponibles)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Roles de usuario](#roles-de-usuario)
- [Base de datos](#base-de-datos)
- [Despliegue](#despliegue)

---

## Características

### Para todos los visitantes
- 🏠 Landing page completa: historia, estadísticas, noticias y llamada a la acción
- 🗺️ **Mapa GPS en tiempo real** — seguimiento en vivo de los pasos durante la procesión
- 📰 Noticias y comunicados públicos de la hermandad
- 📱 Diseño responsive (mobile-first)
- ♿ Modo lectura accesible (fuente ampliada, alto contraste)

### Para hermanos registrados
- 👤 Dashboard personal con estado de membresía
- 💳 Pago de cuota anual (10 €) mediante Stripe o en efectivo
- 🛍️ Tienda online con carrito persistente (palmas, trajes, productos oficiales)
- 📦 Historial de pedidos con estado en tiempo real
- 🕯️ Elección de puesto en procesión (solo cofrades activos)

### Para administradores
- 📊 Dashboard con métricas globales y gráficos
- 👥 Gestión completa del padrón de hermanos
- 📝 Publicación y edición de noticias con subida de imágenes/PDFs
- 📡 Control GPS de los pasos procesionales desde el móvil
- 🗺️ Gestión del itinerario procesional (13 puntos definidos en Montijo)
- 💰 Gestión de cuentas y pagos
- 🏪 Gestión de inventario y pedidos de la tienda

### Para superadministradores
- Todo lo anterior más gestión de roles de usuario (asignar/revocar admin)

---

## Stack tecnológico

| Categoría | Tecnología | Versión |
|-----------|-----------|---------|
| Framework UI | React | 19.2.4 |
| Lenguaje | TypeScript | ~6.0.2 |
| Build tool | Vite | 8.0.4 |
| Estilos | Tailwind CSS | 4.2.2 |
| Componentes | shadcn/ui + @base-ui/react | 4.2.0 |
| Animaciones | Framer Motion | 12.38.0 |
| Enrutamiento | React Router DOM | 7.14.1 |
| Estado global | Zustand | 5.0.3 |
| Backend / BD | Supabase (PostgreSQL + Auth + Realtime + Storage) | 2.103.1 |
| Mapas | Leaflet + React Leaflet | 1.9.4 / 5.0.0 |
| Pagos | Stripe | 9.4.0 |
| Gráficos | Recharts | 3.8.1 |
| Iconos | lucide-react | 1.8.0 |
| Notificaciones | react-hot-toast | 2.6.0 |
| i18n | i18next + react-i18next | 26.0.4 / 17.0.3 |
| IA (chatbot) | @google/generative-ai (Gemini) | 0.24.1 |

---

## Requisitos previos

- **Node.js** v18 o superior
- **npm** v9 o superior
- Cuenta en [Supabase](https://supabase.com) con proyecto configurado
- Cuenta en [Stripe](https://stripe.com) (para pagos)
- Cuenta en [Vercel](https://vercel.com) (para despliegue)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd jhs-web

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (ver sección siguiente)

# 4. Iniciar el servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`.

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_service_role_key

# Google Gemini (chatbot, opcional)
VITE_GEMINI_API_KEY=tu_gemini_api_key
```

> **Importante:** `VITE_SUPABASE_ANON_KEY` debe contener la **service_role key** de Supabase (no la anon key), para que las operaciones de administración puedan bypassear Row Level Security de forma controlada.

> **Nunca** subas el archivo `.env` al repositorio. Está incluido en `.gitignore`.

---

## Scripts disponibles

```bash
npm run dev       # Inicia el servidor de desarrollo con HMR
npm run build     # Compila TypeScript + genera bundle de producción en /dist
npm run preview   # Previsualiza el build de producción localmente
npm run lint      # Ejecuta ESLint sobre todo el código fuente
```

---

## Estructura del proyecto

```
src/
├── App.tsx                    # Router principal con todas las rutas
├── main.tsx                   # Entry point React
├── index.css                  # Tailwind + tema visual (colores, tipografías)
│
├── router/
│   └── guards.tsx             # PublicRoute, ProtectedRoute, AdminRoute, CofradeRoute, SuperadminRoute
│
├── layouts/
│   ├── GlobalLayout.tsx       # Raíz: scroll-to-top y modo lectura
│   ├── LandingLayout.tsx      # Sin navbar (solo para landing)
│   ├── NavbarPageLayout.tsx   # Navbar + página + Footer
│   └── AdminLayout.tsx        # Sidebar + área de contenido admin
│
├── stores/                    # Estado global (Zustand)
│   ├── authStore.ts           # Sesión, roles, persistencia
│   ├── carritoStore.ts        # Carrito de compras (localStorage)
│   ├── procesionStore.ts      # GPS en tiempo real
│   └── readingModeStore.ts    # Modo lectura accesible
│
├── interfaces/                # Tipos TypeScript
│   ├── Hermano.ts
│   ├── Procesion.ts
│   ├── Paso.ts
│   ├── Noticia.ts
│   └── Producto.ts
│
├── database/
│   ├── repositories/          # Interfaces de acceso a datos (contratos)
│   │   ├── index.ts           # Exporta instancias únicas
│   │   ├── HermanoRepository.ts
│   │   ├── NoticiaRepository.ts
│   │   ├── ProductoRepository.ts
│   │   ├── ProcesionRepository.ts
│   │   └── PasoRepository.ts
│   └── supabase/              # Implementaciones con Supabase
│       ├── Client.ts          # supabaseClient + supabaseAdmin
│       ├── SupabaseHermanoRepository.ts
│       ├── SupabaseNoticiaRepository.ts
│       ├── SupabaseProductoRepository.ts
│       ├── SupabaseProcesionRepository.ts
│       └── SupabasePasoRepository.ts
│
├── pages/
│   ├── LandingPage.tsx
│   ├── public/                # Accesibles sin login
│   │   ├── NoticiasPage.tsx
│   │   ├── ContactoPage.tsx
│   │   ├── RedesSocialesPage.tsx
│   │   ├── PrivacidadPage.tsx
│   │   ├── CookiesPage.tsx
│   │   └── AvisoLegalPage.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── RecuperarPasswordPage.tsx
│   │   └── ResetPasswordPage.tsx
│   ├── hermano/               # Área privada del hermano
│   │   ├── DashboardPage.tsx
│   │   ├── CuotasPage.tsx
│   │   ├── TiendaPage.tsx
│   │   ├── PedidosPage.tsx
│   │   └── PuestoPage.tsx
│   └── admin/                 # Panel de administración
│       ├── AdminDashboardPage.tsx
│       ├── AdminHermanosPage.tsx
│       ├── AdminNoticiasPage.tsx
│       ├── AdminGPSPage.tsx
│       ├── AdminProcesionPage.tsx
│       ├── AdminCuentasPage.tsx
│       ├── AdminTiendaPage.tsx
│       └── AdminSuperadminPage.tsx
│
├── components/
│   ├── layout/                # Navbar, Footer
│   ├── landing/               # Hero, GPS, Noticias, Tienda, Historia...
│   ├── tienda/                # CartDrawer
│   ├── chatbot/               # ChatbotWidget (placeholder Gemini)
│   └── ui/                    # Componentes shadcn (Button, Card, Badge...)
│
└── lib/
    └── utils.ts               # cn(), formatEur(), traducirError() y helpers
```

---

## Roles de usuario

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **Visitante** | Sin cuenta | Landing, noticias, GPS en vivo, contacto |
| **Hermano** | Registrado, cuota pendiente | Dashboard, pago de cuota, explorar tienda |
| **Cofrade activo** | Cuota pagada (`es_cofrade = true`) | Todo lo anterior + tienda completa + puesto en procesión |
| **Admin** | Rol `admin` | Panel completo de gestión (hermanos, noticias, GPS, tienda, cuentas) |
| **Superadmin** | Rol `superadmin` | Todo lo del admin + CRUD completo de hermanos, gestión de roles y verificación de bautismos |

### Estados de un hermano

```
Registro → pendiente_pago ──(pago)──→ activo
                          ↓
                         baja  (el admin da de baja)
```

---

## Base de datos

La base de datos usa **PostgreSQL** a través de Supabase con **Row Level Security (RLS)** activado en todas las tablas.

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `hermanos` | Usuarios: datos personales, estado, rol, stripe_customer_id, foto_bautismo_url |
| `noticias` | Artículos con título, cuerpo, imagen/PDF, publicada, destacada |
| `productos` | Catálogo: nombre, precio, stock, categoría (Palma/Traje/Productos oficiales) |
| `pedidos` | Órdenes: hermano_id, producto_id, cantidad, total, estado, stripe payment_id |
| `procesion_estado` | Estado global de la procesión (activa/inactiva, coordenadas GPS) |
| `pasos_gps` | Los 3 pasos procesionales con su posición GPS en tiempo real |
| `recorrido_puntos` | 13 puntos del itinerario en Montijo con coordenadas y tipo |

### Storage Buckets

| Bucket | Contenido |
|--------|-----------|
| `bautismos` | Fotos de fe de bautismo (subidas en el registro) |
| `noticias` | Imágenes y PDFs adjuntos a noticias |
| `productos` | Imágenes de productos de la tienda |

### Edge Functions (Supabase)

| Función | Propósito |
|---------|-----------|
| `create-checkout-session` | Crea una sesión de pago en Stripe para cuota o carrito |
| `stripe-webhook` | Recibe eventos de Stripe y actualiza pedidos/estado del hermano |

### Realtime

Supabase Realtime está activo en `procesion_estado` y `pasos_gps`. Todos los visitantes ven el movimiento GPS en el mapa sin recargar la página.

---

## Despliegue

### Vercel (recomendado)

1. Conecta el repositorio en [vercel.com](https://vercel.com)
2. Configura las variables de entorno en el panel de Vercel
3. El despliegue es automático en cada push a `main`

El archivo `vercel.json` ya está configurado para redirigir todas las rutas a `index.html` (necesario para SPAs).

### Build manual

```bash
npm run build
# Los archivos de producción quedan en /dist
# Sirve /dist con cualquier servidor estático
```

### Checklist de Supabase antes de producción

- [ ] Buckets `bautismos`, `noticias` y `productos` creados (acceso público)
- [ ] RLS habilitado en todas las tablas
- [ ] Realtime habilitado en `procesion_estado` y `pasos_gps`
- [ ] Edge Functions `create-checkout-session` y `stripe-webhook` desplegadas
- [ ] Enum `rol_usuario` incluye `hermano`, `admin` y `superadmin`

---

## Sistema de diseño

| Elemento | Valor |
|----------|-------|
| Color primario | Verde oscuro `#1B3022` |
| Color secundario | Dorado `#B8860B` |
| Acento | Amarillo `#E5C100` |
| Fondo | Pergamino `#F5F2E9` |
| Fuente títulos | Noto Serif |
| Fuente cuerpo | Manrope / Geist |

---

## Aspectos técnicos destacados

- **Patrón Repository** — Los componentes React no conocen Supabase directamente. Interactúan con interfaces, lo que hace el código desacoplado y testeable.
- **Dos clientes Supabase** — `supabaseClient` (con sesión del usuario, sujeto a RLS) y `supabaseAdmin` (service_role, para operaciones privilegiadas sin exponer credenciales al usuario).
- **GPS con Supabase Realtime** — `watchPosition()` del navegador envía coordenadas a la BD; WebSockets actualizan el mapa de todos los visitantes al instante.
- **TypeScript strict** — `noUnusedLocals`, `noUnusedParameters`, sin `any` implícito.
- **SEO completo** — Meta tags, Open Graph, Twitter Card y JSON-LD Schema.org en `index.html`.
- **Accesibilidad** — Modo lectura (125% fuente, alto contraste), componentes `@base-ui/react`, ARIA labels.

---

## Pendiente

- [ ] Activar Stripe con claves de producción
- [ ] Completar chatbot con Google Gemini API
- [ ] Crear archivos de traducción para i18n (español/inglés)
- [ ] Confirmación de email en el flujo de registro
- [ ] Añadir número de WhatsApp real en ContactoPage

---

## Licencia

Proyecto privado — Cofradía "Jesús Salvador de los Hombres", Montijo. 
Todos los derechos reservados.
