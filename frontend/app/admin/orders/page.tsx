'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { call, imgSrc } from '@/lib/api';
import { useApp } from '@/components/Providers';

type Order = {
  id: number; total: string; status: string; payment_status: string; payment_method: string;
  payment_proof: string | null; created_at: string; user_name: string; email: string;
  customer_name: string | null; phone: string | null; address: string | null; city: string | null;
  items: { name: string; quantity: number; color: string | null; size: string | null }[];
};

const STATUS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const PAY = ['unpaid', 'pending', 'paid', 'rejected'];
const sel = 'rounded-lg bg-soft px-3 py-2 outline-none';

export default function AdminOrders() {
  const { user } = useApp();
  const [orders, setOrders] = useState<Order[]>([]);
  const [err, setErr] = useState('');

  const load = useCallback(() => {
    call('/orders').then(setOrders).catch((e) => setErr(e.message));
  }, []);
  useEffect(() => { if (user?.role === 'admin') load(); }, [user, load]);

  const update = async (id: number, patch: { status?: string; payment_status?: string }) => {
    setErr('');
    try {
      await call(`/orders/${id}`, 'PUT', patch);
      setOrders((os) => os.map((o) => (o.id === id ? { ...o, ...patch } : o)));
    } catch (e) { setErr((e as Error).message); }
  };

  if (user?.role !== 'admin')
    return <main className="max-w-md mx-auto p-4">This page is for admins only.</main>;

  return (
    <main className="max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin: Orders</h1>
        <Link href="/admin" className="text-brand font-semibold">← Products</Link>
      </div>
      {err && <p className="mt-3 text-red-600">{err}</p>}
      {orders.length === 0 && <p className="mt-4">No orders yet.</p>}

      <div className="mt-4 space-y-3">
        {orders.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2 font-semibold">
              <span>Order #{o.id} · Rs. {o.total}</span>
              <span className="text-xs font-normal text-slate-500">{new Date(o.created_at).toLocaleString()}</span>
            </div>

            <ul className="mt-2">
              {o.items.map((i, k) => (
                <li key={k}>{i.quantity} × {i.name} {i.color && `(${i.color}, ${i.size})`}</li>
              ))}
            </ul>

            <div className="mt-3 border-t border-slate-100 pt-3 text-slate-600">
              <p><b>{o.customer_name}</b> · {o.phone}</p>
              <p>{o.address}, {o.city}</p>
              <p className="text-xs">Account: {o.user_name} ({o.email})</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div>
                <p className="text-xs text-slate-500">Order status</p>
                <select className={sel} value={o.status} onChange={(e) => update(o.id, { status: e.target.value })}>
                  {STATUS.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p className="text-xs text-slate-500">
                  Payment ({o.payment_method === 'transfer' ? 'online transfer' : 'cash on delivery'})
                </p>
                <select className={sel} value={o.payment_status} onChange={(e) => update(o.id, { payment_status: e.target.value })}>
                  {PAY.map((s) => <option key={s}>{s}</option>)}
                </select>
              </div>
              {o.payment_proof && (
                <a href={imgSrc(o.payment_proof)} target="_blank" rel="noreferrer" className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imgSrc(o.payment_proof)} alt="Payment screenshot" className="h-16 w-16 rounded-lg object-cover" />
                  <span className="text-brand underline">Open screenshot</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
