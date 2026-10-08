'use client';

import { useEffect, useState } from 'react';
import { call, imgSrc } from '@/lib/api';

type Order = {
  id: number; total: string; status: string; created_at: string;
  customer_name: string | null; phone: string | null; address: string | null; city: string | null;
  payment_method: string; payment_status: string; payment_proof: string | null;
  items: { name: string; quantity: number; price: string; color: string | null; size: string | null }[];
};

const payLabel: Record<string, string> = {
  unpaid: 'Pay on delivery', pending: 'Payment under review', paid: 'Paid', rejected: 'Payment rejected',
};

export default function Orders() {
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    call('/orders/my').then(setOrders).catch((e) => setErr(e.message));
  }, []);

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold">My orders</h1>
      {err && <p className="mt-4 text-red-600">{err}</p>}
      {orders && orders.length === 0 && <p className="mt-4">No orders yet.</p>}
      <div className="mt-4 space-y-3">
        {orders?.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex justify-between font-semibold">
              <span>Order #{o.id}</span>
              <span className="text-teal capitalize">{o.status}</span>
            </div>
            <p className="text-xs text-slate-500">{new Date(o.created_at).toLocaleString()}</p>
            <ul className="mt-2">
              {o.items.map((i, k) => (
                <li key={k}>{i.quantity} × {i.name} {i.color && `(${i.color}, ${i.size})`}</li>
              ))}
            </ul>
            <div className="mt-3 border-t border-slate-100 pt-3 text-slate-600">
              <p>Deliver to: {o.customer_name}, {o.phone}</p>
              <p>{o.address}, {o.city}</p>
              <p className="mt-1">
                Payment: {o.payment_method === 'transfer' ? 'Online transfer' : 'Cash on Delivery'} · <b>{payLabel[o.payment_status] || o.payment_status}</b>
              </p>
              {o.payment_proof && (
                <a href={imgSrc(o.payment_proof)} target="_blank" rel="noreferrer" className="text-brand underline">View screenshot</a>
              )}
            </div>
            <p className="mt-2 font-bold text-teal">Total: Rs. {o.total}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
