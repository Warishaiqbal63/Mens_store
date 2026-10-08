'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';

export default function ProductOptions({ product }: { product: Product }) {
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);

  return (
    <div>
      <p className="mt-4 font-semibold text-sm">Color</p>
      <div className="mt-2 flex gap-3">
        {product.colors.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={c}
            style={{ backgroundColor: c }}
            className={`h-7 w-7 rounded-full border-2 ${
              color === c ? 'border-brand ring-2 ring-brand/40' : 'border-gray-300'
            }`}
          />
        ))}
      </div>

      <p className="mt-4 font-semibold text-sm">Size</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {product.sizes.map((s) => (
          <button
            key={s}
            onClick={() => setSize(s)}
            className={`min-w-10 rounded-lg px-3 py-2 text-sm ${
              size === s ? 'bg-brand text-white' : 'bg-soft text-brand-dark'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <button
        onClick={() => setAdded(true)}
        className="mt-6 w-full rounded-xl bg-brand py-3 font-semibold text-white"
      >
        {added ? `Added: ${color}, ${size}` : 'Add to cart'}
      </button>
    </div>
  );
}