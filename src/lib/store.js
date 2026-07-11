'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCart = create(persist((set, get) => ({
  items: {}, // id -> { id, name, price, mrp, pack, rx, box, qty }
  drawerOpen: false,
  openDrawer: () => set({ drawerOpen: true }),
  closeDrawer: () => set({ drawerOpen: false }),
  add: (med, qty = 1) => set((s) => {
    const cur = s.items[med.id];
    const next = { ...s.items, [med.id]: {
      id: med.id, name: med.name, generic: med.generic, price: med.price, mrp: med.mrp,
      pack: med.pack, rx: med.rx, box: med.box, qty: Math.min(10, (cur?.qty || 0) + qty),
    }};
    return { items: next, drawerOpen: true };
  }),
  setQty: (id, qty) => set((s) => {
    if (qty <= 0) { const { [id]: _, ...rest } = s.items; return { items: rest }; }
    return { items: { ...s.items, [id]: { ...s.items[id], qty: Math.min(10, qty) } } };
  }),
  remove: (id) => set((s) => { const { [id]: _, ...rest } = s.items; return { items: rest }; }),
  clear: () => set({ items: {} }),
}), { name: 'aarogya-cart-v1' }));

export const cartCount = (items) => Object.values(items).reduce((n, i) => n + i.qty, 0);
export const cartTotal = (items) => Object.values(items).reduce((n, i) => n + i.qty * i.price, 0);
export const cartMrpTotal = (items) => Object.values(items).reduce((n, i) => n + i.qty * i.mrp, 0);
export const cartHasRx = (items) => Object.values(items).some((i) => i.rx);
export const inr = (n) => '₹' + n.toLocaleString('en-IN');
