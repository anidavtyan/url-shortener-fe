import { redirect, notFound } from 'next/navigation';

type Params = { slug: string };

export default async function RedirectPage({ params}: {
    params: Promise<Params>; }) {
    const { slug } = await params;

    // If backend issues a 302 at GET /:slug:
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${slug}`, {
        redirect: 'manual',
        cache: 'no-store',
    });

    // Handle explicit backend redirect
    if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location');
        if (location) {
            redirect(location);
        }
    }

    // If backend instead returns JSON (e.g. { url } or { originalUrl }):
    if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
        const data = await res.json().catch(() => null);
        const target = data?.url;
        if (target) redirect(target);
    }

    notFound();
}
