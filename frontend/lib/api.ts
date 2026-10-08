import { Product } from './types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const ORIGIN = API_URL.replace(/\/api$/, '');

// Uploaded images are stored as /uploads/..., so add the server address
export const imgSrc = (u: string | null) => (!u ? '' : u.startsWith('/') ? ORIGIN + u : u);

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/products`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load products');
  return res.json();
}

export async function getProduct(id: string): Promise<Product | null> {
  const res = await fetch(`${API_URL}/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

// Helper for API calls from the browser (adds the token automatically)
export async function call(path: string, method = 'GET', body?: unknown) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export async function uploadImage(file: File, path = '/upload'): Promise<string> {
  const token = localStorage.getItem('token');
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  const d = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(d.error || 'Upload failed');
  return d.url;
}
