import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { hermanoRepository } from '@/database/repositories';
import { toast } from 'react-hot-toast';
import { LogOut, User, ShieldCheck, Menu, X, ChevronRight, ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const PUBLIC_LINKS = [
  { href: '/#historia', label: 'Historia' },
  { href: '/#procesion', label: 'Procesión' },
  { href: '/noticias', label: 'Noticias' },
  { href: '/contacto', label: 'Contacto' },
];

export function Navbar() {
  const { isAuthenticated, isAdmin, sessionHermano, clearSession } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await hermanoRepository.logout();
    clearSession();
    toast.success('Hasta pronto');
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 border-b border-secondary/15 backdrop-blur-md">
      <div className="flex items-center justify-between px-5 md:px-10 lg:px-16 h-16">
        {/* Logo */}
        <Link
          to="/"
          className="font-display text-[12px] tracking-[0.22em] uppercase text-primary no-underline shrink-0 hover:text-secondary transition-colors"
        >
          Hermandad · JHS
        </Link>

        {/* Nav central — desktop */}
        <ul className="hidden md:flex items-center gap-7 list-none m-0 p-0">
          {PUBLIC_LINKS.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="font-body text-[10px] tracking-[0.2em] uppercase text-primary/55 hover:text-secondary transition-colors no-underline"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Acciones — desktop */}
        <div className="hidden md:flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <NavLink to="/admin/dashboard">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-body text-[10px] tracking-widest uppercase text-secondary hover:text-secondary/80 hover:bg-secondary/8 gap-1.5 rounded-none"
                  >
                    <ShieldCheck size={11} />
                    Admin
                  </Button>
                </NavLink>
              )}
              <NavLink to="/mi/tienda">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-body text-[10px] tracking-widest uppercase text-primary/60 hover:text-secondary hover:bg-secondary/5 gap-1.5 rounded-none"
                >
                  <ShoppingBag size={11} />
                  Tienda
                </Button>
              </NavLink>
              <NavLink to="/dashboard">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-body text-[10px] tracking-widest uppercase text-primary/60 hover:text-primary hover:bg-primary/5 gap-1.5 rounded-none"
                >
                  <User size={11} />
                  {sessionHermano?.hermano.nombre}
                </Button>
              </NavLink>
              <button
                onClick={handleLogout}
                className="font-body text-[10px] tracking-widest uppercase text-primary/30 hover:text-secondary transition-colors flex items-center gap-1.5 px-2 py-1"
              >
                <LogOut size={11} />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-body text-[10px] tracking-widest uppercase text-primary/55 hover:text-primary rounded-none"
                >
                  Acceder
                </Button>
              </Link>
              <Link to="/registro">
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-none font-body text-[10px] tracking-widest uppercase px-5 h-9">
                  Hacerse Hermano
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Hamburguesa — móvil */}
        <button
          className="md:hidden w-9 h-9 flex items-center justify-center text-primary hover:text-secondary transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={menuOpen ? 'close' : 'open'}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </motion.span>
          </AnimatePresence>
        </button>
      </div>

      {/* Menú móvil animado */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="md:hidden overflow-hidden border-t border-secondary/10 bg-background"
          >
            <div className="px-5 py-5 space-y-1">
              {PUBLIC_LINKS.map((l, i) => (
                <motion.a
                  key={l.label}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ x: -12, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.05, duration: 0.2 }}
                  className="flex items-center justify-between py-2.5 border-b border-secondary/8 font-body text-[11px] tracking-[0.2em] uppercase text-primary/60 hover:text-secondary transition-colors no-underline group"
                >
                  {l.label}
                  <ChevronRight size={11} className="text-primary/20 group-hover:text-secondary transition-colors" />
                </motion.a>
              ))}

              <div className="pt-4 space-y-2">
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center justify-between py-2 font-body text-[11px] tracking-widest uppercase text-secondary no-underline"
                      >
                        <span className="flex items-center gap-2"><ShieldCheck size={12} /> Panel Admin</span>
                        <ChevronRight size={11} className="text-secondary/40" />
                      </Link>
                    )}
                    <Link
                      to="/mi/tienda"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-2 font-body text-[11px] tracking-widest uppercase text-primary/60 no-underline"
                    >
                      <span className="flex items-center gap-2"><ShoppingBag size={12} /> Tienda</span>
                      <ChevronRight size={11} className="text-primary/20" />
                    </Link>
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center justify-between py-2 font-body text-[11px] tracking-widest uppercase text-primary/60 no-underline"
                    >
                      <span className="flex items-center gap-2"><User size={12} /> Mi área</span>
                      <ChevronRight size={11} className="text-primary/20" />
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 py-2 font-body text-[11px] tracking-widest uppercase text-primary/30 hover:text-secondary transition-colors"
                    >
                      <LogOut size={12} /> Cerrar sesión
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setMenuOpen(false)}
                      className="block py-2 font-body text-[11px] tracking-widest uppercase text-primary/60 no-underline"
                    >
                      Acceder
                    </Link>
                    <Link
                      to="/registro"
                      onClick={() => setMenuOpen(false)}
                      className="block"
                    >
                      <Button className="w-full bg-primary text-primary-foreground rounded-none font-body text-[10px] tracking-widest uppercase h-10">
                        Hacerse Hermano
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
