'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { call, imgSrc, uploadImage } from '@/lib/api';
import { PAYMENT_ACCOUNTS } from '@/lib/payment';
import { useApp } from '@/components/Providers';

const field = 'w-full rounded-xl bg-soft px-4 py-3 outline-none';

export default function Cart() {
  const { cart, setQty, clear, user } = useApp();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', phone: '', city: '', address: '' });
  const [method, setMethod] = useState<'cod' | 'transfer'>('cod');
  const [proof, setProof] = useState('');
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ id: number; total: number; payment_method: string } | null>(null);

  const items = cart.reduce((n, i) => n + i.quantity, 0);
  const total = cart.reduce((n, i) => n + i.price * i.quantity, 0);

  useEffect(() => {
    if (user && !form.name) setForm((f) => ({ ...f, name: user.name }));
  }, [user, form.name]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const pickProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setErr('');
    setUploading(true);
    try {
      setProof(await uploadImage(file, '/upload/proof'));
    } catch (er) {
      setErr((er as Error).message);
    }
    setUploading(false);
    e.target.value = '';
  };

  const placeOrder = async () => {
    if (!user) return router.push('/login');
    setErr('');
    setBusy(true);
    try {
      const d = await call('/orders', 'POST', {
        items: cart, customer: form, payment_method: method, payment_proof: method === 'transfer' ? proof : undefined,
      });
      clear();
      setDone(d);
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  };

  if (done)
    return (
      <main className="max-w-md mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold">Order placed ✓</h1>
        <p className="mt-2">Order #{done.id} · Total Rs. {done.total}</p>
        <p className="mt-2 text-slate-600">
          {done.payment_method === 'transfer'
            ? 'We received your payment screenshot. We will verify it and confirm your order shortly.'
            : 'Please keep the amount ready. You will pay in cash when the order arrives.'}
        </p>
        <Link href="/orders" className="mt-4 inline-block text-brand font-semibold">View my orders</Link>
      </main>
    );

  if (cart.length === 0)
    return (
      <main className="max-w-3xl mx-auto p-4">
        <h1 className="text-2xl font-bold">Your cart</h1>
        <p className="mt-4">Your cart is empty. <Link href="/" className="text-brand font-semibold">Start shopping</Link></p>
      </main>
    );

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <div className="space-y-4 md:col-span-2">
          {/* Items */}
          <div className="space-y-3">
            {cart.map((i) => (
              <div key={`${i.product_id}-${i.color}-${i.size}`} className="flex gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <Link href={`/products/${i.product_id}`} className="shrink-0">
                  {i.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgSrc(i.image)} alt={i.name} className="h-24 w-24 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-soft text-slate-500">No image</div>
                  )}
                </Link>
                <div className="flex flex-1 flex-col">
                  <Link href={`/products/${i.product_id}`} className="font-semibold hover:text-teal">{i.name}</Link>
                  <p className="text-slate-500">Color: {i.color || '-'} · Size: {i.size || '-'}</p>
                  <p className="text-slate-500">Rs. {i.price} each</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setQty(i, i.quantity - 1)} className="h-8 w-8 rounded-lg bg-soft">−</button>
                      <span>{i.quantity}</span>
                      <button onClick={() => setQty(i, i.quantity + 1)} className="h-8 w-8 rounded-lg bg-soft">+</button>
                      <button onClick={() => setQty(i, 0)} className="ml-2 text-red-600">Remove</button>
                    </div>
                    <p className="font-bold text-teal">Rs. {i.price * i.quantity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Delivery details */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="font-semibold">Delivery details</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input className={field} placeholder="Full name" value={form.name} onChange={set('name')} />
              <input className={field} placeholder="Phone (03XX-XXXXXXX)" value={form.phone} onChange={set('phone')} />
              <input className={`${field} sm:col-span-2`} placeholder="City" value={form.city} onChange={set('city')} />
              <textarea className={`${field} sm:col-span-2`} rows={3} placeholder="Full address"
                value={form.address} onChange={set('address')} />
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="font-semibold">Payment method</p>
            <div className="mt-3 space-y-2">
              {([['cod', 'Cash on Delivery', 'Pay in cash when your order arrives'],
                 ['transfer', 'Online transfer', 'JazzCash, Easypaisa or bank transfer, then upload the screenshot']] as const).map(([v, t, s]) => (
                <label key={v} className={`flex cursor-pointer gap-3 rounded-xl border p-3 transition ${
                  method === v ? 'border-brand bg-soft' : 'border-slate-200'
                }`}>
                  <input type="radio" name="pay" checked={method === v} onChange={() => setMethod(v)} className="mt-1" />
                  <span><span className="block font-semibold">{t}</span><span className="text-slate-500">{s}</span></span>
                </label>
              ))}
            </div>

            {method === 'transfer' && (
              <div className="mt-4 space-y-3">
                <p>Send <b>Rs. {total}</b> to any one of these accounts:</p>
                {PAYMENT_ACCOUNTS.map((a) => (
                  <div key={a.method} className="rounded-xl bg-soft p-3">
                    <p className="font-semibold">{a.method}</p>
                    <p>{a.title}</p>
                    <p className="font-mono">{a.number}</p>
                  </div>
                ))}
                <div className="flex items-center gap-4">
                  {proof ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imgSrc(proof)} alt="Payment screenshot" className="h-24 w-24 rounded-xl object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-soft text-slate-500">No file</div>
                  )}
                  <label className="cursor-pointer rounded-xl bg-brand px-4 py-2 font-semibold text-white">
                    {uploading ? 'Uploading…' : proof ? 'Change screenshot' : 'Upload payment screenshot'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickProof} className="hidden" />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="h-fit rounded-2xl bg-white p-4 shadow-sm md:sticky md:top-20">
          <p className="font-semibold">Order summary</p>
          <div className="mt-3 flex justify-between"><span>Items</span><span>{items}</span></div>
          <div className="mt-1 flex justify-between"><span>Subtotal</span><span>Rs. {total}</span></div>
          <div className="mt-1 flex justify-between">
            <span>Payment</span><span>{method === 'cod' ? 'Cash on Delivery' : 'Online transfer'}</span>
          </div>
          <div className="mt-3 flex justify-between border-t border-slate-200 pt-3 text-lg font-bold">
            <span>Total</span><span>Rs. {total}</span>
          </div>
          {err && <p className="mt-3 text-red-600">{err}</p>}
          <button onClick={placeOrder} disabled={busy || uploading}
            className="mt-4 w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50">
            {user ? (busy ? 'Placing order…' : 'Place order') : 'Log in to order'}
          </button>
        </div>
      </div>
    </main>
  );
}
