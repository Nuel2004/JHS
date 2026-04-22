import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ItemCarrito, Producto } from '../interfaces/Producto';

interface CarritoState {
  items: ItemCarrito[];
  total: number;

  agregarItem: (producto: Producto) => void;
  quitarItem: (productoId: number) => void;
  actualizarCantidad: (productoId: number, cantidad: number) => void;
  vaciarCarrito: () => void;
}

function calcularTotal(items: ItemCarrito[]): number {
  return items.reduce((acc, i) => acc + i.producto.precio * i.cantidad, 0);
}

export const useCarritoStore = create<CarritoState>()(
  persist(
    (set) => ({
      items: [],
      total: 0,

      agregarItem: (producto) =>
        set((state) => {
          const existente = state.items.find((i) => i.producto.id === producto.id);
          const nuevosItems = existente
            ? state.items.map((i) =>
                i.producto.id === producto.id ? { ...i, cantidad: i.cantidad + 1 } : i
              )
            : [...state.items, { producto, cantidad: 1 }];
          return { items: nuevosItems, total: calcularTotal(nuevosItems) };
        }),

      quitarItem: (productoId) =>
        set((state) => {
          const nuevosItems = state.items.filter((i) => i.producto.id !== productoId);
          return { items: nuevosItems, total: calcularTotal(nuevosItems) };
        }),

      actualizarCantidad: (productoId, cantidad) =>
        set((state) => {
          const nuevosItems =
            cantidad <= 0
              ? state.items.filter((i) => i.producto.id !== productoId)
              : state.items.map((i) =>
                  i.producto.id === productoId ? { ...i, cantidad } : i
                );
          return { items: nuevosItems, total: calcularTotal(nuevosItems) };
        }),

      vaciarCarrito: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'jhs-carrito-v1',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
