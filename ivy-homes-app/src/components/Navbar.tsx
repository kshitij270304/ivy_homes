'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { name: 'Buy', href: '/listings' },
    { name: 'Rent', href: '/rentals' },
    { name: 'Projects', href: '/projects' },
    { name: 'Saved', href: '/saved' },
    { name: 'Insights', href: '/insights' },
  ];

  return (
    <nav className="bg-white px-6 py-4 flex items-center justify-between sticky top-0 z-50 border-b border-gray-100">
      <Link href="/listings" className="flex items-center tracking-tight">
        <span className="font-extrabold text-blue-800 text-2xl">Ivy</span>
        <span className="text-gray-800 text-2xl lowercase ml-1">homes</span>
      </Link>
      
      <div className="flex items-center gap-8">
        <div className="hidden md:flex items-center gap-6">
          {links.map((link) => {
            const isActive = pathname === link.href || (link.href === '/listings' && pathname === '/');
            return (
              <Link key={link.name} href={link.href} className={`text-[15px] font-medium relative group ${isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-800'}`}>
                {link.name}
                {isActive && (
                  <span className="absolute -bottom-4 left-0 w-full h-[4px] bg-blue-800 rounded-t-sm"></span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
