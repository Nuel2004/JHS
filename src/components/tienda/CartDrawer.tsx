import { useEffect, useState } from 'react';
import { X, ShoppingCart, Trash2, Loader2 } from 'lucide-react';
import { useCarritoStore } from '@/stores/carritoStore';
import { cn } from '@/lib/utils';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  onCheckout: () => void;
  loadingCheckout: boolean;
}

export default function CartDrawer({ open, onClose, onCheckout, loadingCheckout }: CartDrawerProps) {
  const { items, total, quitarItem, actualizarCantidad, vaciarCarrito } = useCarritoStore();
  const [confirmarVaciar, setConfirmarVaciar] = useState(false);

  useEffect(() => {
    if (!open) {
      setConfirmarVaciar(false);
      return;
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/40 z-40 transition-opacity duration-300',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compra"
        className={cn(
          'fixed top-0 right-0 h-full w-80 bg-white z-50 flex flex-col shadow-2xl transition-transform duration-300',
          open ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/10">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-secondary" />
            <p className="font-serif text-sm text-primary">Tu carrito</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar carrito"
            className="text-primary/40 hover:text-primary/70 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-secondary/8">
          {items.length === 0 ? (
            <p className="font-body text-sm text-primary/35 italic text-center py-12 px-5">
              El carrito está vacío
            </p>
          ) : (
            items.map((item) => (
              <div key={item.producto.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-xs text-primary leading-snug truncate">{item.producto.nombre}</p>
                  <p className="font-body text-[10px] text-primary/45 mt-0.5">
                    {item.producto.precio.toFixed(2)} € / ud.
                  </p>
                </div>

                {/* Quantity controls */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => actualizarCantidad(item.producto.id, item.cantidad - 1)}
                    aria-label={`Reducir cantidad de ${item.producto.nombre}`}
                    className="w-5 h-5 flex items-center justify-center border border-secondary/20 text-primary/50 hover:border-secondary/50 text-xs"
                  >
                    −
                  </button>
                  <span className="w-5 text-center font-body text-xs text-primary">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => actualizarCantidad(item.producto.id, Math.min(item.cantidad + 1, item.producto.stock))}
                    aria-label={`Aumentar cantidad de ${item.producto.nombre}`}
                    className="w-5 h-5 flex items-center justify-center border border-secondary/20 text-primary/50 hover:border-secondary/50 text-xs"
                  >
                    +
                  </button>
                </div>

                <p className="font-display text-sm text-secondary shrink-0 w-16 text-right">
                  {(item.producto.precio * item.cantidad).toFixed(2)}€
                </p>

                <button
                  type="button"
                  onClick={() => quitarItem(item.producto.id)}
                  aria-label={`Eliminar ${item.producto.nombre} del carrito`}
                  className="text-primary/25 hover:text-red-400 transition-colors shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-secondary/10 space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-serif text-xs text-primary/50">Total</p>
            <p className="font-display text-xl text-secondary">{total.toFixed(2)}€</p>
          </div>

          <button
            type="button"
            onClick={onCheckout}
            disabled={items.length === 0 || loadingCheckout}
            className="w-full py-2.5 bg-secondary text-secondary-foreground text-[9px] tracking-widest uppercase font-body hover:bg-secondary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loadingCheckout && <Loader2 size={12} className="animate-spin" />}
            Pagar con Stripe
          </button>

          {items.length > 0 && (
            confirmarVaciar ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { vaciarCarrito(); setConfirmarVaciar(false); }}
                  className="flex-1 py-1.5 text-[9px] tracking-widest uppercase font-body text-red-500 hover:text-red-700 transition-colors border border-red-200"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmarVaciar(false)}
                  className="flex-1 py-1.5 text-[9px] tracking-widest uppercase font-body text-primary/30 hover:text-primary/50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmarVaciar(true)}
                className="w-full py-1.5 text-[9px] tracking-widest uppercase font-body text-primary/30 hover:text-primary/50 transition-colors"
              >
                Vaciar carrito
              </button>
            )
          )}
        </div>
      </div>
    </>
  );
}