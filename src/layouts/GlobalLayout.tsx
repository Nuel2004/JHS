import { Outlet, useLocation } from 'react-router-dom';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useReadingModeStore } from '../stores/readingModeStore';

export default function GlobalLayout() {
  const [showTop, setShowTop] = useState(false);
  const { isReadingMode } = useReadingModeStore();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    document.documentElement.classList.toggle(
      'reading-mode',
      isReadingMode && !isAdminRoute
    );
  }, [isReadingMode, isAdminRoute]);

  useEffect(() => {
    return () => {
      document.documentElement.classList.remove('reading-mode');
    };
  }, []);

  return (
    <LazyMotion features={domAnimation}>
      <>
        <AnimatePresence mode="wait" initial={false}>
          <m.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </m.div>
        </AnimatePresence>

        <AnimatePresence>
          {showTop && (
            <m.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="fixed bottom-6 right-6 z-50 size-10 flex items-center justify-center
                         bg-primary text-primary-foreground border border-secondary/30
                         hover:bg-secondary hover:text-secondary-foreground transition-colors shadow-lg"
              aria-label="Volver arriba"
            >
              <ArrowUp size={16} />
            </m.button>
          )}
        </AnimatePresence>
      </>
    </LazyMotion>
  );
}
