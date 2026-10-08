import Link from 'next/link';

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar py-2 text-center text-sm font-medium">
      Winter collection is Now Live —{' '}
      <Link href="/#shop" className="underline underline-offset-2">Shop Now.</Link>
    </div>
  );
}
