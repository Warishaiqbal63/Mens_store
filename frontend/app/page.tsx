import fs from 'fs';
import path from 'path';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts, imgSrc } from '@/lib/api';
import Hero, { Slide } from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import Reveal from '@/components/Reveal';

const perks = [
  ['🚚', 'Fast Delivery', 'Across Pakistan'],
  ['💵', 'Cash on Delivery', 'Pay at your door'],
  ['🔁', 'Easy Returns', 'Easy exchange'],
  ['✨', 'Premium Quality', 'Quality fabric'],
];
const tones = ['from-brand-dark to-teal', 'from-brand to-brand-dark', 'from-teal to-brand-dark'];

export default async function Home({
  searchParams,
}: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q = '', cat = 'All' } = await searchParams;
  const products = await getProducts();
  const cats = Array.from(new Set(products.map((p) => p.category)));

  // Banner image for a category:
  // 1) a wide custom image in public/banners/<category>.jpg|jpeg|png|webp
  //    (name = category in lowercase, non-letters replaced by '-', e.g. "Fragrances / Perfumes" -> fragrances-perfumes.jpg)
  // 2) otherwise the first product photo of that category
  const customBanner = (c: string) => {
    const slug = c.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    for (const ext of ['jpg', 'jpeg', 'png', 'webp']) {
      if (fs.existsSync(path.join(process.cwd(), 'public', 'banners', `${slug}.${ext}`))) {
        return `/banners/${slug}.${ext}`;
      }
    }
    return undefined;
  };
  const imgOf = (c: string) => {
    const custom = customBanner(c);
    if (custom) return custom;
    const p = products.find((x) => x.category === c && x.image_url);
    return p ? imgSrc(p.image_url) : undefined;
  };

  const slides: Slide[] = [
    { tag: 'Winter / Fall 2026', title: 'Winter Collection Is Now Live', bg: tones[0], image: imgOf('Jackets') },
    { tag: 'Fresh Drop', title: 'Sneakers For Every Step', bg: tones[1], image: imgOf('Sneakers') },
    { tag: 'Everyday Essentials', title: 'Shirts That Fit Your Story', bg: tones[2], image: imgOf('Shirts') },
  ];

  return (
    <main>
      <Hero slides={slides} />

      <section className="mt-1 space-y-1">
        {cats.map((c, k) => {
          const img = imgOf(c);
          return (
            <Reveal key={c}>
              <Link href={`/?cat=${encodeURIComponent(c)}#shop`}
                className="collection-tile group relative block overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${tones[k % 3]} transition duration-700 group-hover:scale-105`} />
                {img && (
                  <>
                    <Image src={img} alt="" fill sizes="100vw" unoptimized
                      className="category-photo transition-opacity duration-700 group-hover:opacity-95" />
                    <div className="absolute inset-0 bg-brand-dark/25" />
                  </>
                )}
                <div className="category-copy relative flex h-full flex-col items-center justify-center text-white">
                  <p className="uppercase tracking-[0.3em] text-white/80">New Arrivals</p>
                  <h2 className="mt-2 text-3xl font-bold uppercase md:text-5xl">{c}</h2>
                  <span className="category-cta mt-5 border border-white px-8 py-2 uppercase tracking-widest transition group-hover:bg-white group-hover:text-brand-dark">
                    Shop Now
                  </span>
                </div>
              </Link>
            </Reveal>
          );
        })}
      </section>

      <div className="mx-auto max-w-6xl p-4">
        <ProductGrid key={`${q}|${cat}`} products={products} initialQ={q} initialCat={cat} />

        <Reveal className="mt-14">
          <div className="grid grid-cols-2 gap-4 border border-slate-200 bg-white p-6 md:grid-cols-4">
            {perks.map(([icon, t, s]) => (
              <div key={t} className="text-center">
                <div className="text-3xl">{icon}</div>
                <p className="mt-2 font-semibold">{t}</p>
                <p className="text-slate-500">{s}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </main>
  );
}