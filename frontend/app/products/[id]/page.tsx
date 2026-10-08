import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProduct, imgSrc } from '@/lib/api';
import ProductOptions from '@/components/ProductOptions';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) notFound();

  return (
    <main className="max-w-md mx-auto p-4">
      <Link href="/" className="text-brand">← Back</Link>

      {product.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={imgSrc(product.image_url)} alt={product.name} className="mt-3 h-80 w-full rounded-2xl object-cover md:h-96" />
      ) : (
        <div className="mt-3 h-64 rounded-2xl bg-soft flex items-center justify-center text-brand">
          {product.category}
        </div>
      )}

      <h1 className="mt-4 text-2xl font-bold">{product.name}</h1>
      <p className="text-xl font-bold text-brand">Rs. {product.price}</p>
      <h2 className="mt-5 font-semibold uppercase tracking-wide">Description</h2>
      <p className="mt-1 whitespace-pre-line text-slate-600">{product.description || 'No description yet.'}</p>
      <p className="mt-1 text-xs text-gray-500">{product.stock} items in stock</p>

      <ProductOptions product={product} />
    </main>
  );
}
