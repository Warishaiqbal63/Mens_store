'use client';

import { useState } from 'react';
import { Product } from '@/lib/types';
import { useApp } from './Providers';

export default function ProductOptions({ product }: { product: Product }) {
  const { add } = useApp();
  const [color, setColor] = useState(product.colors[0] || '');
  const [size, setSize] = useState(product.sizes[0] || '');
  const [added, setAdded] = useState(false);

  const addToCart = () => {
    add({ product_id: product.id, name: product.name, price: Number(product.price), color, size, quantity: 1, image: product.image_url });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div>
      {product.colors.length > 0 && (
        <>
          <p className="mt-4 font-semibold">Color</p>
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
        </>
      )}

      {product.sizes.length > 0 && (
        <>
          <p className="mt-4 font-semibold">Size</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                onClick={() => setSize(s)}
                className={`min-w-10 rounded-lg px-3 py-2 ${
                  size === s ? 'bg-brand text-white' : 'bg-soft text-brand-dark'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </>
      )}

      <button
        onClick={addToCart}
        disabled={product.stock < 1}
        className="mt-6 w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50"
      >
        {product.stock < 1 ? 'Out of stock' : added ? 'Added ✓' : 'Add to cart'}
      </button>
    </div>
  );
}
