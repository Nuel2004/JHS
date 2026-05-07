import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';


export function ChatbotWidget() {
  const [open, setOpen] = useState(false);


  return (
    <>
      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-36 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] bg-background border border-primary/20 shadow-2xl flex flex-col"
            style={{ maxHeight: 'calc(100vh - 8rem)' }}
          >
            {/* Header — verde oscuro con texto crema */}
            <div className="flex items-center justify-between px-5 py-4 bg-primary">
              <div>
                <p className="font-display text-secondary text-sm tracking-wide">Asistente JHS</p>
                <p className="font-body text-[10px] text-primary-foreground/60 tracking-[0.2em] uppercase mt-0.5">Cofradía Jesús Salvador de los Hombres</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-primary-foreground/50 hover:text-primary-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Próximamente */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 bg-background gap-4">
              <MessageCircle size={36} className="text-secondary/40" />
              <p className="font-display text-secondary text-base tracking-wide text-center">
                Próximamente
              </p>
              <p className="font-body text-xs text-primary/50 text-center leading-relaxed">
                El asistente de la Cofradía JHS se implementará próximamente. Podrás consultarnos sobre nuestra historia, patrimonio y actividades.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating button */}
      <motion.button
        type="button"
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'fixed bottom-20 right-4 z-50 h-12 px-4 border-0 transition-colors duration-200',
          'flex items-center gap-2 shadow-xl',
          open
            ? 'bg-primary text-primary-foreground'
            : 'bg-secondary text-[#1B3022] hover:bg-accent'
        )}
        aria-label="Asistente de la cofradía — próximamente"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={18} />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={18} />
            </motion.span>
          )}
        </AnimatePresence>
        {!open && (
          <span className="font-body text-xs font-semibold tracking-wide whitespace-nowrap">
            Próximamente
          </span>
        )}
      </motion.button>
    </>
  );
}