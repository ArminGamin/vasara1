import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { MYSTERY_GIFT } from '../data/mysteryGift';
import { CartItem } from './authStore';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getItemById: (itemId: string) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,

      addItem: (item: Omit<CartItem, 'id'>) => {
        // Preserve intended item price to 2 decimals (fixes 17.99 -> 17.98 float artifacts)
        // This does not affect free-shipping logic, which uses FLOOR cents separately in App.tsx
        const normalizePrice = (p: number) => Number(Number(p).toFixed(2));
        // normalize incoming price to 2 decimals to avoid float drift
        item.price = normalizePrice(item.price);
        const { items } = get();
        const existingItem = items.find(
          i => i.productId === item.productId && 
               i.selectedColor === item.selectedColor && 
               i.selectedSize === item.selectedSize
        );

        if (existingItem) {
          set(state => ({
            items: state.items.map(i =>
              i.id === existingItem.id
                ? { ...i, quantity: i.quantity + item.quantity }
                : i
            ),
          }));
        } else {
          const newItem: CartItem = {
            ...item,
            id: Date.now().toString(),
          };
          set(state => ({ items: [...state.items, newItem] }));
        }
        // Update totals using integer cents to ensure exact sums
        set(state => {
          const totalItems = state.items.reduce((sum, it) => sum + it.quantity, 0);
          const totalCents = state.items.reduce((sum, it) => sum + Math.round(Number(it.price) * 100) * it.quantity, 0);
          return { totalItems, totalPrice: totalCents / 100 };
        });

        // Meta Pixel: AddToCart event (guarded)
        try {
          const value = Number(Number(item.price * item.quantity).toFixed(2));
          const w: any = (typeof window !== 'undefined') ? window : null;
          if (w && typeof w.fbq === 'function') {
            w.fbq('track', 'AddToCart', {
              currency: 'EUR',
              value,
              content_ids: [item.productId],
              content_name: item.name,
              content_type: 'product',
              quantity: item.quantity,
            });
          }
        } catch {}
      },

      removeItem: (itemId: string) => {
        set(state => {
          const newItems = state.items.filter(item => item.id !== itemId);
          const totalItems = newItems.reduce((sum, it) => sum + it.quantity, 0);
          const totalCents = newItems.reduce((sum, it) => sum + Math.round(Number(it.price) * 100) * it.quantity, 0);
          return { items: newItems, totalItems, totalPrice: totalCents / 100 };
        });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        set(state => {
          const newItems = state.items.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          );
          const totalItems = newItems.reduce((sum, it) => sum + it.quantity, 0);
          const totalCents = newItems.reduce((sum, it) => sum + Math.round(Number(it.price) * 100) * it.quantity, 0);
          return { items: newItems, totalItems, totalPrice: totalCents / 100 };
        });
      },

      clearCart: () => {
        set({ items: [], totalItems: 0, totalPrice: 0 });
      },

      getItemById: (itemId: string) => {
        return get().items.find(item => item.id === itemId);
      },
    }),
    {
      name: 'cart-storage',
      onRehydrateStorage: () => (state, error) => {
        if (error || !state?.items?.length) return;
        const next = state.items.map((it: CartItem) =>
          it.productId === MYSTERY_GIFT.productId
            ? {
                ...it,
                image: MYSTERY_GIFT.image,
                name: MYSTERY_GIFT.name,
                selectedColor: MYSTERY_GIFT.selectedColor,
                selectedSize: MYSTERY_GIFT.selectedSize,
              }
            : it,
        );
        const changed = next.some(
          (it, i) =>
            it.image !== state.items[i]?.image ||
            it.name !== state.items[i]?.name ||
            it.selectedColor !== state.items[i]?.selectedColor ||
            it.selectedSize !== state.items[i]?.selectedSize,
        );
        if (changed) {
          const totalItems = next.reduce((sum, it) => sum + it.quantity, 0);
          const totalCents = next.reduce(
            (sum, it) => sum + Math.round(Number(it.price) * 100) * it.quantity,
            0,
          );
          useCartStore.setState({ items: next, totalItems, totalPrice: totalCents / 100 });
        }
      },
    }
  )
);


