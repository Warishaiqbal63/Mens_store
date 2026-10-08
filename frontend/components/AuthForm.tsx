'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { call } from '@/lib/api';
import { useApp } from './Providers';

const input = 'w-full rounded-xl bg-soft px-4 py-3 outline-none';

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter();
  const { login } = useApp();
  const [f, setF] = useState({ name: '', email: '', password: '' });
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const isReg = mode === 'register';

  const submit = async () => {
    setErr('');
    setBusy(true);
    try {
      const d = await call(`/auth/${mode}`, 'POST', f);
      login(d.token, d.user);
      router.push('/');
    } catch (e) {
      setErr((e as Error).message);
    }
    setBusy(false);
  };

  return (
    <main className="auth-screen max-w-md mx-auto p-4">
      <h1 className="text-3xl">{isReg ? 'Create an account' : 'Login'}</h1>
      <div className="auth-card mt-4 space-y-3 rounded-2xl bg-white p-5 shadow-sm">
        {isReg && (
          <input className={input} placeholder="Name" value={f.name}
            onChange={(e) => setF({ ...f, name: e.target.value })} />
        )}
        <input className={input} placeholder="Email" type="email" value={f.email}
          onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input className={input} placeholder="Password" type="password" value={f.password}
          onChange={(e) => setF({ ...f, password: e.target.value })} />
        {err && <p className="text-red-600">{err}</p>}
        <button onClick={submit} disabled={busy}
          className="w-full rounded-xl bg-brand py-3 font-semibold text-white disabled:opacity-50">
          {isReg ? 'Register' : 'Login'}
        </button>
        <p className="text-center">
          {isReg ? (
            <>Already have an account? <Link href="/login" className="text-brand font-semibold">Login</Link></>
          ) : (
            <>New here? <Link href="/register" className="text-brand font-semibold">Register</Link></>
          )}
        </p>
      </div>
    </main>
  );
}
