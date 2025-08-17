'use client';

import { useEffect, useMemo, useState } from 'react';
import { getTopUrls } from '../lib/api';

type Range = 'today' | '7d' | 'all';

type UrlRow = {
    id?: string | number | null;
    slug: string;
    url?: string | null;
    createdAt?: string | null;

    // camelCase
    hitsToday?: number;
    hitsIn7d?: number;
    hitsTotal?: number;

    // snake_case fallback (older API)
    hits_in_range?: number;
    hits_total?: number;
};

export function UrlList({ refreshFlag }: { refreshFlag: boolean }) {
    const [urls, setUrls] = useState<any[]>([]);
    const [range, setRange] = useState<TopRange>('today'); // 'today' | '7d' | 'all'
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await getTopUrls(10, range);
            const data = res.data?.items ?? res.data ?? [];
            setUrls(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch URLs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const id = setInterval(fetchData, 5000);
        return () => clearInterval(id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [range]);

    useEffect(() => {
        if (refreshFlag) fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshFlag]);

    // Gracefully read metrics from either camelCase or snake_case
    const metricFor = (u: UrlRow, r: Range) => {
        if (r === 'today') return u.hitsToday ?? u.hits_in_range ?? 0;
        if (r === '7d') return u.hitsIn7d ?? u.hits_in_range ?? 0;
        return u.hitsTotal ?? u.hits_total ?? 0; // total
    };

    const labelFor = (r: Range) =>
        r === 'today' ? 'Today' : r === '7d' ? 'Last 7d' : 'All time';

    const sorted = useMemo(() => {
        const copy = [...urls];
        copy.sort((a, b) => metricFor(b, range) - metricFor(a, range));
        return copy;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urls, range]);

    const frontendBase =
        process.env.NEXT_PUBLIC_FRONTEND_URL ||
        process.env.FRONTEND_URL ||
        'http://localhost:3000';

    return (
        <div className="mt-6 p-6 bg-gray-800 shadow-lg w-full max-w-6xl mx-auto">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-white text-center sm:text-left">
                    The most popular URLs — Top 10
                </h2>
                {/* Range filter */}
                <div className="flex items-center justify-center gap-2">
                    <span className="text-sm text-gray-300">In range:</span>
                    <div className="inline-flex rounded-md border border-gray-700 bg-gray-900 p-1">
                        {(['today', '7d', 'total'] as Range[]).map((r) => (
                            <button
                                key={r}
                                onClick={() => setRange(r)}
                                className={[
                                    'px-3 py-1.5 text-sm rounded-md transition',
                                    range === r
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800',
                                ].join(' ')}
                            >
                                {r === 'today' ? 'Today' : r === '7d' ? '7d' : 'All'}
                            </button>
                        ))}
                    </div>
                </div>


            </div>
            <p className="mb-4 font-normal text-sm">The most popular URLs, with a maximum of 10, for the given range.</p>

            {loading && urls.length === 0 ? (
                <p className="text-gray-400 text-center py-6">Loading…</p>
            ) : sorted.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto border-collapse">
                        <thead>
                        <tr className="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Slug</th>
                            <th className="py-3 px-6 text-left">Original URL</th>
                            <th className="py-3 px-6 text-center">
                                Hits ({labelFor(range)})
                            </th>
                            <th className="py-3 px-6 text-center">Hits (Total)</th>
                            <th className="py-3 px-6 text-left">Created At</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="text-gray-200 text-sm font-light">
                        {sorted.map((u) => {
                            const selectedHits = metricFor(u, range);
                            const totalHits = u.hitsTotal ?? u.hits_total ?? 0;
                            const shortUrl = `${frontendBase}/${u.slug}`;
                            return (
                                <tr
                                    key={u.slug}
                                    className="border-b border-gray-700 hover:bg-gray-700 transition-all duration-200"
                                >
                                    <td className="py-3 px-6 whitespace-nowrap font-mono">
                                        <a
                                            href={`/${u.slug}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-blue-400 hover:underline"
                                        >
                                            {u.slug}
                                        </a>
                                    </td>
                                    <td className="py-3 px-6 max-w-xs truncate">
                                        {u.url ?? '—'}
                                    </td>
                                    <td className="py-3 px-6 text-center tabular-nums">
                                        {selectedHits}
                                    </td>
                                    <td className="py-3 px-6 text-center tabular-nums">
                                        {totalHits}
                                    </td>
                                    <td className="py-3 px-6 whitespace-nowrap">
                                        {u.createdAt
                                            ? new Date(u.createdAt).toLocaleString()
                                            : '—'}
                                    </td>
                                    <td className="py-3 px-6 text-center">
                                        <button
                                            onClick={() => navigator.clipboard.writeText(shortUrl)}
                                            className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-700 cursor-pointer"
                                        >
                                            Copy
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-400 text-center py-4">
                    No URLs shortened yet.
                </p>
            )}
        </div>
    );
}
