import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Guards
import { PublicRoute, ProtectedRoute, AdminRoute, CofradeRoute, SuperadminRoute } from './router/guards';

// Layouts
import GlobalLayout from './layouts/GlobalLayout';
import LandingLayout from './layouts/LandingLayout';
import NavbarPageLayout from './layouts/NavbarPageLayout';
import AdminLayout from './layouts/AdminLayout';

// Páginas públicas
import LandingPage from './pages/LandingPage';
import NoticiasPage from './pages/public/NoticiasPage';
import ContactoPage from './pages/public/ContactoPage';
import RedesSocialesPage from './pages/public/RedesSocialesPage';
import AvisoLegalPage from './pages/public/AvisoLegalPage';
import PrivacidadPage from './pages/public/PrivacidadPage';
import CookiesPage from './pages/public/CookiesPage';

// Auth
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import RecuperarPasswordPage from './pages/auth/RecuperarPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Hermano (área privada)
import DashboardPage from './pages/hermano/DashboardPage';
import PuestoPage from './pages/hermano/PuestoPage';
import CuotasPage from './pages/hermano/CuotasPage';

// Admin
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminHermanosPage from './pages/admin/AdminHermanosPage';
import AdminNoticiasPage from './pages/admin/AdminNoticiasPage';
import AdminGPSPage from './pages/admin/AdminGPSPage';
import AdminCuentasPage from './pages/admin/AdminCuentasPage';
import AdminProcesionPage from './pages/admin/AdminProcesionPage';
import AdminTiendaPage from './pages/admin/AdminTiendaPage';
import AdminSuperadminPage from './pages/admin/AdminSuperadminPage';

// Hermano — tienda
import TiendaPage from './pages/hermano/TiendaPage';
import PedidosPage from './pages/hermano/PedidosPage';

const router = createBrowserRouter([
  {
    element: <GlobalLayout />,
    children: [
      // ── Públicas ──────────────────────────────────────────────
      {
        element: <LandingLayout />,
        children: [{ path: '/', element: <LandingPage /> }],
      },
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

      // ── Área privada (cualquier hermano registrado) ──────────
      {
        element: <ProtectedRoute />,
        children: [
          {
            element: <NavbarPageLayout />,
            children: [
              { path: '/dashboard', element: <DashboardPage /> },
              { path: '/mi/cuotas', element: <CuotasPage /> },
              { path: '/mi/tienda', element: <TiendaPage /> },
              { path: '/mi/pedidos', element: <PedidosPage /> },
            ],
          },
          // Solo cofrades activos
          {
            element: <CofradeRoute />,
            children: [
              {
                element: <NavbarPageLayout />,
                children: [
                  { path: '/mi/puesto', element: <PuestoPage /> },
                ],
              },
            ],
          },
        ],
      },

      // ── Panel admin ──────────────────────────────────────────
      {
        element: <AdminRoute />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { path: '/admin/dashboard', element: <AdminDashboardPage /> },
              { path: '/admin/hermanos', element: <AdminHermanosPage /> },
              { path: '/admin/noticias', element: <AdminNoticiasPage /> },
              { path: '/admin/gps', element: <AdminGPSPage /> },
              { path: '/admin/cuentas', element: <AdminCuentasPage /> },
              { path: '/admin/procesion', element: <AdminProcesionPage /> },
              { path: '/admin/tienda', element: <AdminTiendaPage /> },
            ],
          },
          // Rutas exclusivas de superadmin
          {
            element: <SuperadminRoute />,
            children: [
              {
                element: <AdminLayout />,
                children: [
                  { path: '/admin/superadmin', element: <AdminSuperadminPage /> },
                ],
              },
            ],
          },
        ],
      },

      // ── Fallback ─────────────────────────────────────────────
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]);

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'font-body text-sm rounded-none border border-secondary/20 shadow-sm',
          duration: 4000,
        }}
      />
      <RouterProvider router={router} />
    </>
  );
}
