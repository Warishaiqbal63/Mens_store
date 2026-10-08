'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useApp } from './Providers';
import { BRAND } from '@/lib/brand';

const links = [
  ['Shirts', '/?cat=Shirts#shop'],
  ['Sneakers', '/?cat=Sneakers#shop'],
  ['Jackets', '/?cat=Jackets#shop'],
  ['All Products', '/#shop'],
];

type MenuLink = { label: string; href: string };
type DesktopMenu = {
  label: string;
  href: string;
  heading: string;
  photos: { label: string; href: string; image: string }[];
  groups: { title: string; links: MenuLink[] }[];
};

const desktopMenus: DesktopMenu[] = [
  {
    label: 'New In',
    href: '/#shop',
    heading: 'Fresh for the season',
    photos: [
      { label: 'Shirts', href: '/?cat=Shirts#shop', image: '/nav-shirt-linen.webp' },
      { label: 'Sneakers', href: '/?cat=Sneakers#shop', image: '/nav-sneaker-life.jpg' },
    ],
    groups: [
      { title: 'Just arrived', links: [{ label: 'Shirts', href: '/?cat=Shirts#shop' }, { label: 'Sneakers', href: '/?cat=Sneakers#shop' }] },
      { title: 'Explore more', links: [{ label: 'Jackets', href: '/?cat=Jackets#shop' }, { label: 'Shop all', href: '/#shop' }] },
    ],
  },
  {
    label: 'Shirts',
    href: '/?cat=Shirts#shop',
    heading: 'Everyday shirts, reimagined',
    photos: [
      { label: 'Linen shirts', href: '/?cat=Shirts#shop', image: '/nav-shirt-linen.webp' },
      { label: 'Relaxed shirts', href: '/?cat=Shirts#shop', image: '/nav-shirt-coastal.jpg' },
    ],
    groups: [
      { title: 'Shop shirts', links: [{ label: 'View all shirts', href: '/?cat=Shirts#shop' }, { label: 'Shop all products', href: '/#shop' }] },
      { title: 'Complete the look', links: [{ label: 'Sneakers', href: '/?cat=Sneakers#shop' }, { label: 'Jackets', href: '/?cat=Jackets#shop' }] },
    ],
  },
  {
    label: 'Sneakers',
    href: '/?cat=Sneakers#shop',
    heading: 'Made for every step',
    photos: [
      { label: 'Studio sneakers', href: '/?cat=Sneakers#shop', image: '/nav-sneaker-studio.jpg' },
      { label: 'Everyday sneakers', href: '/?cat=Sneakers#shop', image: '/nav-sneaker-life.jpg' },
    ],
    groups: [
      { title: 'Shop sneakers', links: [{ label: 'View all sneakers', href: '/?cat=Sneakers#shop' }, { label: 'Shop all products', href: '/#shop' }] },
      { title: 'Explore more', links: [{ label: 'Shirts', href: '/?cat=Shirts#shop' }, { label: 'Jackets', href: '/?cat=Jackets#shop' }] },
    ],
  },
  {
    label: 'Jackets',
    href: '/?cat=Jackets#shop',
    heading: 'A layer for every plan',
    photos: [
      { label: 'Tailored layers', href: '/?cat=Jackets#shop', image: '/nav-jacket-tailored.webp' },
      { label: 'Pair with shirts', href: '/?cat=Shirts#shop', image: '/nav-shirt-coastal.jpg' },
    ],
    groups: [
      { title: 'Shop jackets', links: [{ label: 'View all jackets', href: '/?cat=Jackets#shop' }, { label: 'Shop all products', href: '/#shop' }] },
      { title: 'Complete the look', links: [{ label: 'Shirts', href: '/?cat=Shirts#shop' }, { label: 'Sneakers', href: '/?cat=Sneakers#shop' }] },
    ],
  },
  {
    label: 'Shop All',
    href: '/#shop',
    heading: 'Find your next favourite',
    photos: [
      { label: 'Shirts', href: '/?cat=Shirts#shop', image: '/nav-shirt-coastal.jpg' },
      { label: 'Sneakers', href: '/?cat=Sneakers#shop', image: '/nav-sneaker-studio.jpg' },
    ],
    groups: [
      { title: 'Collections', links: [{ label: 'All products', href: '/#shop' }, { label: 'New in', href: '/#shop' }] },
      { title: 'Browse by category', links: [{ label: 'Shirts', href: '/?cat=Shirts#shop' }, { label: 'Sneakers', href: '/?cat=Sneakers#shop' }, { label: 'Jackets', href: '/?cat=Jackets#shop' }] },
    ],
  },
];

const I = 'h-6 w-6 fill-none stroke-current';

export default function Header() {
  const { cart, user, logout } = useApp();
  const router = useRouter();
  const count = cart.reduce((n, i) => n + i.quantity, 0);
  const [menu, setMenu] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => {
    if (!menu) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenu(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', closeOnEscape);
    };
  }, [menu]);

  const search = () => {
    router.push(`/?q=${encodeURIComponent(q)}#shop`);
    setSearching(false);
  };

  return (
    <>
      <header
        className="site-header sticky top-0 z-40 border-b border-slate-200 bg-white text-brand-dark">
        <div className="header-inner mx-auto max-w-7xl px-4">
          <button onClick={() => setMenu(true)} aria-label="Open menu" aria-expanded={menu} className="mobile-menu-trigger w-fit">
            <svg viewBox="0 0 24 24" className={I} strokeWidth="1.8"><path d="M3 7h18M3 12h18M3 17h18" /></svg>
          </button>

          <Link href="/" className="site-logo">
            <Image src={BRAND.logo} alt={BRAND.name}
              width={600} height={172} priority className="h-10 w-auto" />
          </Link>

          <nav aria-label="Main navigation" className="desktop-nav">
            {desktopMenus.map((menuItem) => (
              <div key={menuItem.label} className="desktop-nav-group">
                <Link href={menuItem.href} className="desktop-nav-link" aria-haspopup="true">
                  {menuItem.label} <span className="nav-caret" aria-hidden="true">⌄</span>
                </Link>
                <div className="mega-menu">
                  <div className="mega-image-grid">
                    {menuItem.photos.map((photo) => (
                      <Link key={photo.label} href={photo.href} className="mega-photo-card">
                        <Image src={photo.image} alt={photo.label} fill sizes="(min-width: 1024px) 220px, 50vw" />
                        <span className="mega-photo-shade" />
                        <span className="mega-photo-label">{photo.label}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="mega-content">
                    <p className="mega-eyebrow">ALAYA HOUSE · COLLECTIONS</p>
                    <h2>{menuItem.heading}</h2>
                    <div className="mega-link-groups">
                      {menuItem.groups.map((group) => (
                        <div key={group.title} className="mega-link-group">
                          <p className="mega-link-group-title">{group.title}</p>
                          {group.links.map((item) => (
                            <Link key={item.label} href={item.href} className="mega-link">
                              <span>{item.label}</span><span aria-hidden="true">↗</span>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>

          <div className="header-actions flex items-center justify-end gap-4">
            {user?.role === 'admin' && (
              <Link href="/admin" className="hidden font-semibold md:inline">Admin</Link>
            )}
            <button onClick={() => setSearching((s) => !s)} aria-label="Search">
              <svg viewBox="0 0 24 24" className={I} strokeWidth="1.8"><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
            </button>
            <Link href={user ? '/orders' : '/login'} aria-label="Account">
              <svg viewBox="0 0 24 24" className={I} strokeWidth="1.8"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-6 8-6s8 2 8 6" /></svg>
            </Link>
            <Link href="/cart" aria-label="Cart" className="relative">
              <svg viewBox="0 0 24 24" className={I} strokeWidth="1.8"><path d="M3 4h2l2.4 11h10.2L20 7H6" /><circle cx="9" cy="19" r="1.3" /><circle cx="17" cy="19" r="1.3" /></svg>
              {count > 0 && (
                <span key={count} className="pop absolute -right-2 -top-2 rounded-full bg-teal px-1.5 text-xs text-white">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>

        {searching && (
          <div className="search-panel border-t border-slate-200 bg-white px-4 py-3 text-brand-dark">
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Search products and press Enter"
              className="mx-auto block w-full max-w-2xl border-b border-slate-400 bg-transparent py-2 outline-none" />
          </div>
        )}
      </header>

      <button type="button" aria-label="Close menu" tabIndex={menu ? 0 : -1} onClick={() => setMenu(false)}
        className={`site-overlay fixed inset-0 z-50 bg-brand-dark/60 ${menu ? 'opacity-100' : 'pointer-events-none opacity-0'}`} />
      <aside aria-label="Store navigation" aria-hidden={!menu} inert={!menu}
        className={`site-drawer fixed left-0 top-0 z-50 h-full w-72 max-w-[86vw] p-6 text-brand-dark shadow-xl ${menu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="drawer-top flex items-center justify-between">
          <Image src={BRAND.logo} alt={BRAND.name} width={600} height={172} className="h-9 w-auto" />
          <button onClick={() => setMenu(false)} aria-label="Close" className="text-2xl">×</button>
        </div>
        <nav aria-label="Browse store" className={`site-nav space-y-1 ${menu ? 'menu-open' : ''}`}>
          {links.map(([t, h]) => (
            <Link key={t} href={h} onClick={() => setMenu(false)}
              className="drawer-link block border-b border-slate-100 py-3 uppercase tracking-wide transition hover:pl-2">
              {t}
            </Link>
          ))}
          {user ? (
            <>
              <Link href="/orders" onClick={() => setMenu(false)} className="drawer-link block border-b border-slate-100 py-3 uppercase tracking-wide">My Orders</Link>
              {user.role === 'admin' && (
                <Link href="/admin" onClick={() => setMenu(false)} className="drawer-link block border-b border-slate-100 py-3 font-semibold uppercase tracking-wide">Admin Panel</Link>
              )}
              <button onClick={() => { logout(); setMenu(false); }} className="drawer-link block w-full py-3 text-left uppercase tracking-wide">Logout</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenu(false)} className="drawer-link block border-b border-slate-100 py-3 uppercase tracking-wide">Login</Link>
              <Link href="/register" onClick={() => setMenu(false)} className="drawer-link block py-3 uppercase tracking-wide">Register</Link>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
