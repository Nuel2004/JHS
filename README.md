# JHS Web — Hermandad Jesús Salvador de los Hombres

Plataforma web oficial de la Hermandad Jesús Salvador de los Hombres de Montijo (Badajoz). Gestión integral de hermanos, seguimiento GPS en tiempo real de la procesión, tienda, cuotas y panel administrativo.

---

## Tecnologías

| Categoría | Stack |
|---|---|
| Frontend | React 19, TypeScript, Vite |
| Estilos | Tailwind CSS v4, Framer Motion |
| Estado | Zustand (persistencia localStorage/sessionStorage) |
| Backend / BDD | Supabase (Auth, Realtime, RLS) |
| Mapas | Leaflet + React Leaflet |
| i18n | i18next |
| Pagos | Stripe |
| UI | shadcn/ui, Lucide React, Base UI |

---

## Características principales

### Público general
- **Landing page** con Hero animado, verso del día, estadísticas y roles de la hermandad
- **GPS en tiempo real** — mapa interactivo Leaflet con 3 pasos (Cristo, Virgen, Cruz de Guía) actualizados vía Supabase Realtime durante la procesión
- **Noticias** públicas de la hermandad
- **Modo lectura** — fuentes grandes y alto contraste, persistido en localStorage

### Área privada (hermanos)
- Dashboard personal con estado de membresía (activo, pendiente de pago, baja)
- Selección de puesto en la procesión (solo cofrades)
- Gestión de cuotas con integración Stripe
- Tienda: compra de palmas, trajes y merchandising con historial de pedidos

### Panel administrativo
- CRUD completo de hermanos, noticias y productos
- Control de coordenadas GPS de los 3 pasos en tiempo real
- Gestión de pedidos y cuentas
- Configuración de la procesión

---

## Roles y acceso

| Rol | Acceso |
|---|---|
| Público | Landing, Noticias, Contacto |
| Hermano | Dashboard, Cuotas, Tienda |
| Cofrade | Todo lo anterior + Puesto en procesión |
| Admin | Todo + Panel administrativo |

Las rutas están protegidas mediante guards (`PublicRoute`, `ProtectedRoute`, `CofradeRoute`, `AdminRoute`).

---

## Requisitos previos

- Node.js 18+
- Cuenta de Supabase con las tablas y RLS configuradas

---

## Instalación y desarrollo

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# Servidor de desarrollo
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

---

## Variables de entorno

```env
VITE_SUPABASE_URL=https://<tu-proyecto>.supabase.co
VITE_SUPABASE_ANON_KEY=<tu-anon-key>
```

---

## Estructura del proyecto

```
src/
├── assets/               # Imágenes y recursos estáticos
├── components/
│   ├── landing/          # Hero, GPS, Tienda preview, Noticias...
│   ├── layout/           # Navbar, Footer
│   └── ui/               # Componentes shadcn/ui
├── database/
│   ├── repositories/     # Interfaces de repositorio (patrón Repository)
│   └── supabase/         # Implementaciones con Supabase + RCPs
├── interfaces/           # Tipos TypeScript (Hermano, Noticia, Producto...)
├── layouts/              # GlobalLayout, LandingLayout, AdminLayout...
├── pages/
│   ├── admin/            # Panel administrativo
│   ├── auth/             # Login y registro
│   ├── hermano/          # Área privada
│   └── public/           # Noticias, Contacto
├── router/               # Guards de rutas
└── stores/               # Zustand (auth, carrito, procesión, modo lectura)
```

---

## Arquitectura de datos

El proyecto usa el **patrón Repository** para desacoplar la capa de datos:

- `src/database/repositories/*.ts` — interfaces abstractas
- `src/database/supabase/Supabase*Repository.ts` — implementaciones con Supabase
- Las suscripciones Realtime de Supabase alimentan el GPS en vivo y otros estados reactivos

---

## Diseño

- Paleta oscura con acentos dorados (`#0D0B08` fondo · `#C8A951` dorado · `#FAF6EE` crema)
- Estética litúrgica y minimalista: bordes rectos, tipografía serif para títulos
- Animaciones fluidas con Framer Motion
- Diseño mobile-first totalmente responsive

---

## Licencia

Proyecto privado de la Hermandad Jesús Salvador de los Hombres — Montijo, Badajoz.