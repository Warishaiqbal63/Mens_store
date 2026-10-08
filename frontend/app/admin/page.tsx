'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { call, uploadImage, imgSrc } from '@/lib/api';
import { Product } from '@/lib/types';
import { useApp } from '@/components/Providers';

const input = 'w-full rounded-xl bg-soft px-4 py-3 outline-none';
const empty = { name: '', description: '', price: '', stock: '', category: '', image_url: '', colors: '', sizes: '' };

export default function Admin() {
  const { user } = useApp();
  const [products, setProducts] = useState<Product[]>([]);
  const [f, setF] = useState(empty);
  const [editing, setEditing] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);

  const load = useCallback(() => {
    call('/products').then(setProducts).catch((e) => setMsg(e.message));
  }, []);
  useEffect(load, [load]);

  const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
  const set = (k: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF({ ...f, [k]: e.target.value });

  const pickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMsg('');
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setF((x) => ({ ...x, image_url: url }));
    } catch (err) {
      setMsg((err as Error).message);
    }
    setUploading(false);
    e.target.value = '';
  };

  const save = async () => {
    setMsg('');
    const body = {
      ...f, price: Number(f.price), stock: Number(f.stock || 0),
      colors: list(f.colors), sizes: list(f.sizes),
    };
    try {
      if (editing) await call(`/products/${editing}`, 'PUT', body);
      else await call('/products', 'POST', body);
      setF(empty);
      setEditing(null);
      load();
    } catch (e) { setMsg((e as Error).message); }
  };

  const edit = (p: Product) => {
    setEditing(p.id);
    setF({
      name: p.name, description: p.description || '', price: String(p.price), stock: String(p.stock),
      category: p.category || '', image_url: p.image_url || '',
      colors: (p.colors || []).join(', '), sizes: (p.sizes || []).join(', '),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this product?')) return;
    try { await call(`/products/${id}`, 'DELETE'); load(); }
    catch (e) { setMsg((e as Error).message); }
  };

  if (user?.role !== 'admin')
    return <main className="max-w-md mx-auto p-4">This page is for admins only.</main>;

  return (
    <main className="max-w-2xl mx-auto p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin: Products</h1>
        <Link href="/admin/orders" className="rounded-xl bg-brand px-4 py-2 font-semibold text-white">View orders →</Link>
      </div>

      <div className="mt-4 grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-2">
        <p className="font-semibold sm:col-span-2">{editing ? `Editing product #${editing}` : 'Add a new product'}</p>
        <input className={input} placeholder="Name" value={f.name} onChange={set('name')} />
        <input className={input} placeholder="Category (Shirts)" value={f.category} onChange={set('category')} />
        <input className={input} placeholder="Price" type="number" value={f.price} onChange={set('price')} />
        <input className={input} placeholder="Stock" type="number" value={f.stock} onChange={set('stock')} />
        <input className={input} placeholder="Colors (white, blue)" value={f.colors} onChange={set('colors')} />
        <input className={input} placeholder="Sizes (S, M, L)" value={f.sizes} onChange={set('sizes')} />
        <textarea className={`${input} sm:col-span-2`} rows={4} placeholder="Description"
          value={f.description} onChange={set('description')} />

        <div className="flex items-center gap-4 sm:col-span-2">
          {f.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imgSrc(f.image_url)} alt="Preview" className="h-24 w-24 rounded-xl object-cover" />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-soft text-slate-500">No image</div>
          )}
          <div className="space-y-2">
            <label className="inline-block cursor-pointer rounded-xl bg-soft px-4 py-2 transition hover:bg-slate-200">
              {uploading ? 'Uploading…' : f.image_url ? 'Change image' : 'Upload image'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={pickImage} className="hidden" />
            </label>
            {f.image_url && (
              <button onClick={() => setF({ ...f, image_url: '' })} className="block text-red-600">Remove image</button>
            )}
            <p className="text-xs text-slate-500">JPG, PNG or WebP, up to 5 MB</p>
          </div>
        </div>

        <button onClick={save} disabled={uploading}
          className="rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50 sm:col-span-2">
          {editing ? 'Save changes' : 'Add product'}
        </button>
        {editing && (
          <button onClick={() => { setEditing(null); setF(empty); }} className="text-brand sm:col-span-2">
            Cancel editing
          </button>
        )}
      </div>
      {msg && <p className="mt-3 text-red-600">{msg}</p>}

      <div className="mt-4 space-y-2">
        {products.map((p) => (
          <div key={p.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
            {p.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imgSrc(p.image_url)} alt={p.name} className="h-14 w-14 rounded-lg object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-lg bg-soft" />
            )}
            <span className="mr-auto">{p.name} · Rs. {p.price} · stock {p.stock}</span>
            <button onClick={() => edit(p)} className="text-brand">Edit</button>
            <button onClick={() => remove(p.id)} className="text-red-600">Delete</button>
          </div>
        ))}
      </div>
    </main>
  );
}
