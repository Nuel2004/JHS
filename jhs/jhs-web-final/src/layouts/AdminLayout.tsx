import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { hermanoRepository } from '../database/repositories';
import { toast } from 'react-hot-toast';
import { LayoutDashboard, Users, Newspaper, MapPin, ShoppingBag, LogOut, ChevronRight, Landmark, ListOrdered } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/hermanos', icon: Users, label: 'Hermanos' },
  { to: '/admin/cuentas', icon: Landmark, label: 'Cuentas' },
  { to: '/admin/procesion', icon: ListOrdered, label: 'Procesión' },
  { to: '/admin/noticias', icon: Newspaper, label: 'Noticias' },
  { to: '/admin/gps', icon: MapPin, label: 'GPS Procesión' },
  { to: '/admin/tienda', icon: ShoppingBag, label: 'Tienda' },
];

export default function AdminLayout() {
  const { sessionHermano, clearSession } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await hermanoRepository.logout();
    clearSession();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-56 border-r border-secondary/15 flex flex-col bg-primary text-primary-foreground">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-display text-[11px] tracking-[0.25em] uppercase text-secondary">
            Hermandad JHS
          </p>
          <p className="font-body text-[10px] text-primary-foreground/50 mt-0.5 tracking-widest uppercase">
            Panel Admin
          </p>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
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

        {/* Usuario + logout */}
        <div className="px-5 py-4 border-t border-white/10">
          <p className="font-body text-[10px] text-primary-foreground/50 truncate">
            {sessionHermano?.hermano.nombre} {sessionHermano?.hermano.apellidos}
          </p>
          <button
            onClick={handleLogout}
            className="mt-2 flex items-center gap-2 text-[10px] tracking-widest uppercase
                       text-primary-foreground/40 hover:text-secondary transition-colors"
          >
            <LogOut size={12} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
