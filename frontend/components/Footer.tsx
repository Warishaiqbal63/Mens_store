'use client';

import Link from 'next/link';
import Image from 'next/image';
import { BRAND } from '@/lib/brand';
import { useState } from 'react';

const cols = [
  { title: 'Company', links: ['About Us', 'Contact Us', 'Privacy Policy', 'Blog'] },
  { title: 'Order Information', links: ['Exchange & Returns', 'Payment Guide', 'Shipping Policy', 'Claim Policy'] },
  { title: 'Help', links: ['FAQs', 'Customer Service', 'Store Location'] },
];

export default function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  return (
    <footer className="site-footer mt-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-5">
        <div className="md:col-span-2">
          <Image src={BRAND.logo} alt={BRAND.name} width={600} height={172} className="h-14 w-auto" />
          <p className="mt-3 max-w-xs">Premium men&apos;s fashion: shirts, sneakers, jackets and accessories.</p>

          <p className="footer-heading mt-6 font-semibold">Sign up for our newsletter</p>
          {done ? (
            <p className="mt-2">Thanks! You&apos;re subscribed ✓</p>
          ) : (
            <div className="newsletter-form mt-2 flex max-w-sm overflow-hidden rounded-full">
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address"
                className="w-full bg-transparent px-4 py-2 outline-none" />
              <button onClick={() => email.includes('@') && setDone(true)}
                className="bg-brand px-5 text-white transition hover:bg-brand-dark">
                Join
              </button>
            </div>
          )}
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <p className="footer-heading font-semibold">{c.title}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l}>
                  <Link href="/" className="transition hover:text-teal hover:underline">{l}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer-bottom border-t">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-5 md:flex-row md:justify-between">
          <p>© 2026 {BRAND.name}. All Rights Reserved.</p>
          <div className="flex gap-5">
            {['Facebook', 'Instagram', 'TikTok', 'WhatsApp'].map((s) => (
              <a key={s} href="#" className="transition hover:text-teal">{s}</a>
            ))}
          </div>
          <p>Cash on Delivery · Visa · Mastercard</p>
        </div>
      </div>
    </footer>
  );
}
