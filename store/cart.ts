// store/cart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type Item = { variantId: string; qtd: number };

type CartState = {
  items: Item[];
  add: (variantId: string) => void;
  setQtd: (variantId: string, qtd: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (variantId) =>
        set((s) => {
          const found = s.items.find((i) => i.variantId === variantId);
          return {
            items: found
              ? s.items.map((i) =>
                  i.variantId === variantId ? { ...i, qtd: i.qtd + 1 } : i
                )
              : [...s.items, { variantId, qtd: 1 }],
          };
        }),
      setQtd: (variantId, qtd) =>
        set((s) => ({
          items:
            qtd <= 0
              ? s.items.filter((i) => i.variantId !== variantId)
              : s.items.map((i) =>
                  i.variantId === variantId ? { ...i, qtd } : i
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "carrinho" }
  )
);