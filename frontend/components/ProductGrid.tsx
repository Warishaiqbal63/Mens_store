'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Product } from '@/lib/types';
import { imgSrc } from '@/lib/api';

export default function ProductGrid({
  products, initialQ = '', initialCat = 'All',
}: { products: Product[]; initialQ?: string; initialCat?: string }) {
  const [q, setQ] = useState(initialQ);
  const [cat, setCat] = useState(initialCat);
  const cats = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const shown = products.filter(
    (p) => (cat === 'All' || p.category === cat) && p.name.toLowerCase().includes(q.toLowerCase())
  );

  // Repeat the list so the loop always fills the screen, then double it for a seamless loop
  const base = shown.length ? Array.from({ length: Math.ceil(8 / shown.length) }).flatMap(() => shown) : [];
  const track = [...base, ...base];

  return (
    <div id="shop" className="scroll-mt-20 pt-10">
      <h2 className="shop-heading text-center text-2xl uppercase tracking-wide md:text-3xl">Shop The Collection</h2>
      <div className="mx-auto mt-2 h-1 w-16 rounded-full bg-gradient-to-r from-brand to-teal" />

      <div className="mt-6 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex gap-3 overflow-x-auto px-1 py-2">
          {cats.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`whitespace-nowrap rounded-full border-2 px-6 py-2 font-semibold transition duration-300 ${
                cat === c
                  ? 'border-transparent bg-gradient-to-r from-brand to-teal text-white shadow-lg shadow-brand/30'
                  : 'border-slate-300 bg-white text-brand hover:-translate-y-0.5 hover:border-teal hover:text-teal hover:shadow-md'
              }`}>
              {c}
            </button>
          ))}
        </div>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products"
          className="w-full rounded-full border-2 border-slate-300 bg-white px-6 py-2 outline-none transition focus:border-teal md:ml-auto md:w-72" />
      </div>

      {shown.length > 0 ? (
        <div className="marquee mt-6 py-3">
          <div key={`${cat}|${q}`} className="marquee-track"
            style={{ '--dur': `${base.length * 5}s` } as React.CSSProperties}>
            {track.map((p, k) => (
              <div key={`${p.id}-${k}`} className="w-56 shrink-0 pr-4 md:w-64">
                <Link href={`/products/${p.id}`}
                  className="product-card group relative block overflow-hidden rounded-2xl border-2 border-slate-200 bg-white p-2 shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-teal hover:shadow-xl hover:shadow-teal/20">
                  <div className="relative h-60 overflow-hidden rounded-xl bg-slate-100 md:h-72">
                    {p.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imgSrc(p.image_url)} alt={p.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-500">{p.category}</div>
                    )}
                    <span className="absolute left-2 top-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-brand">
                      {p.category}
                    </span>
                  </div>
                  <div className="px-2 pb-2 pt-3">
                    <h3 className="product-title truncate font-semibold">{p.name}</h3>
                    <div className="mt-1 flex items-center justify-between">
                      <p className="product-price font-bold text-teal">Rs. {p.price}</p>
                      <span className="text-sm text-brand opacity-0 transition group-hover:opacity-100">View →</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="mt-8 text-center">No products found.</p>
      )}
    </div>
  );
}
