import { ReactNode } from 'react';

// The fade-up effect is pure CSS (see .reveal in globals.css), so nothing
// can stay hidden if JavaScript is slow or blocked.
export default function Reveal({ children, className = '' }: {
  children: ReactNode; delay?: number; className?: string;
}) {
  return <div className={`reveal ${className}`}>{children}</div>;
}
