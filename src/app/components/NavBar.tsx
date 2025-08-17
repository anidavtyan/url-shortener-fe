'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type NavItem = { name: string; href: string; exact?: boolean };

const nav: NavItem[] = [
    { name: 'Home', href: '/', exact: true },
    { name: 'Popular', href: '/dashboard' },
];

export default function NavBar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    const isActive = (item: NavItem) => {
        if (item.exact) return pathname === item.href;
        const base = item.href.split('?')[0];
        return pathname.startsWith(base);
    };

    return (
        <header className="sticky top-0 z-40 border-b border-gray-800 bg-black/80 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <Link href="/" className="flex items-center gap-2 text-white">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-bold">U</span>
                    <span className="text-lg font-semibold">URL Shortener</span>
                </Link>

                <ul className="hidden gap-1 md:flex">
                    {nav.map((item) => (
                        <li key={item.name}>
                            <Link
                                href={item.href}
                                className={[
                                    'rounded-md px-3 py-2 text-sm transition',
                                    isActive(item)
                                        ? 'bg-gray-800 text-white'
                                        : 'text-gray-300 hover:bg-gray-900 hover:text-white',
                                ].join(' ')}
                            >
                                {item.name}
                            </Link>
                        </li>
                    ))}
                </ul>

                <button
                    onClick={() => setOpen((v) => !v)}
                    className="inline-flex items-center rounded-md p-2 text-gray-300 hover:bg-gray-900 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 md:hidden"
                    aria-expanded={open}
                    aria-label="Toggle navigation menu"
                >
                    <svg width="22" height="22" viewBox="0 0 20 20" fill="currentColor">
                        {open ? (
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 011.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
                        ) : (
                            <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 110-2zm0 6h14a1 1 0 010 2H3a1 1 0 110-2z" clipRule="evenodd"/>
                        )}
                    </svg>
                </button>
            </nav>

            {open && (
                <div className="border-t border-gray-800 bg-black md:hidden absolute w-full">
                    <ul className="mx-auto max-w-6xl px-2 py-2">
                        {nav.map((item) => (
                            <li key={item.name}>
                                <Link
                                    href={item.href}
                                    onClick={() => setOpen(false)}
                                    className={[
                                        'block rounded-md px-3 py-2 text-sm transition',
                                        isActive(item)
                                            ? 'bg-gray-800 text-white'
                                            : 'text-gray-300 hover:bg-gray-900 hover:text-white',
                                    ].join(' ')}
                                >
                                    {item.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </header>
    );
}
