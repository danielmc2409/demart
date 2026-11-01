// store/cart.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MAX_POR_ITEM } from "@/lib/limites";

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
                  i.variantId === variantId
                    ? { ...i, qtd: Math.min(i.qtd + 1, MAX_POR_ITEM) }
                    : i
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
                  i.variantId === variantId
                    ? { ...i, qtd: Math.min(qtd, MAX_POR_ITEM) }
                    : i
                ),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "carrinho" }
  )
);