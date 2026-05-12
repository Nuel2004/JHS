import { Outlet, NavLink, useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../stores/authStore';
import { hermanoRepository } from '../database/repositories';
import { toast } from 'react-hot-toast';
import {
  LayoutDashboard, Users, Newspaper, MapPin, ShoppingBag,
  LogOut, ChevronRight, Landmark, ListOrdered, Menu, X, Home,
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

function SidebarContent({ onNavClick, onLogout, nombre, apellidos, isSuperAdmin }: {
  onNavClick?: () => void;
  onLogout: () => void;
  nombre?: string;
  apellidos?: string;
  isSuperAdmin?: boolean;
}) {
  return (
    <>
      <div className="px-5 py-6 border-b border-white/10">
        <p className="font-display text-[11px] tracking-[0.25em] uppercase text-secondary">
          Hermandad JHS
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="font-body text-[10px] text-primary-foreground/50 tracking-widest uppercase">
            Panel Admin
          </p>
          {isSuperAdmin && (
            <span className="font-body text-[8px] tracking-widest uppercase px-1.5 py-0.5 border border-secondary/50 text-secondary bg-secondary/10">
              Super
            </span>
          )}
        </div>
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
    </>
  );
}

export default function AdminLayout() {
  const { sessionHermano, clearSession, isSuperAdmin } = useAuthStore();
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
        <SidebarContent onLogout={handleLogout} nombre={nombre} apellidos={apellidos} isSuperAdmin={isSuperAdmin} />
      </aside>

      {/* Header móvil */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-primary border-b border-white/10 h-14 flex items-center justify-between px-4">
        <div>
          <p className="font-display text-[11px] tracking-[0.25em] uppercase text-secondary">Hermandad JHS</p>
          <div className="flex items-center gap-2">
            <p className="font-body text-[9px] text-primary-foreground/50 tracking-widest uppercase">Panel Admin</p>
            {isSuperAdmin && (
              <span className="font-body text-[7px] tracking-widest uppercase px-1 py-0.5 border border-secondary/50 text-secondary bg-secondary/10">
                Super
              </span>
            )}
          </div>
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
              className="md:hidden fixed inset-0 z-50 bg-black/60"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="md:hidden fixed top-0 left-0 bottom-0 z-[60] w-48 sm:w-56 bg-primary text-primary-foreground flex flex-col"
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
                isSuperAdmin={isSuperAdmin}
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
