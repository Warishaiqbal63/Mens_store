'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CartItem } from '@/lib/types';

type User = { name: string; role: string };
type Ctx = {
  cart: CartItem[];
  add: (i: CartItem) => void;
  setQty: (i: CartItem, q: number) => void;
  clear: () => void;
  user: User | null;
  login: (token: string, u: User) => void;
  logout: () => void;
};

const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

const same = (a: CartItem, b: CartItem) =>
  a.product_id === b.product_id && a.color === b.color && a.size === b.size;

export default function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
      setUser(JSON.parse(localStorage.getItem('user') || 'null'));
    } catch {}
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart, ready]);

  const add = (i: CartItem) =>
    setCart((c) =>
      c.some((x) => same(x, i))
        ? c.map((x) => (same(x, i) ? { ...x, quantity: x.quantity + i.quantity } : x))
        : [...c, i]
    );

  const setQty = (i: CartItem, q: number) =>
    setCart((c) =>
      q <= 0 ? c.filter((x) => !same(x, i)) : c.map((x) => (same(x, i) ? { ...x, quantity: q } : x))
    );

  const login = (token: string, u: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setCart([]); // empty the cart on logout so the next person starts fresh
    router.push('/'); // go back to the home page after logout
    router.refresh();
  };

  return (
    <AppCtx.Provider value={{ cart, add, setQty, clear: () => setCart([]), user, login, logout }}>
      {children}
    </AppCtx.Provider>
  );
}
