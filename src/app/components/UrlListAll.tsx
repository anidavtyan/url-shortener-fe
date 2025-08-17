'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { getAllUrls } from '../lib/api';

type UrlRow = {
    id?: string | number;
    slug: string;
    targetUrl?: string | null;
    url?: string | null;
    hits?: number | null;
    createdAt?: string | Date | null;
};

type Props = { refreshFlag: number | boolean };

export function UrlListAll({ refreshFlag }: Props) {
    const [urls, setUrls] = useState<UrlRow[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchData = useCallback(async () => {
        try {
            const res = await getAllUrls();
            setUrls(res.data);
        } catch (error) {
            console.error('Failed to fetch URLs:', error);
        }
    }, []);

    const handleSlugClick = () => {
        setTimeout(() => {
            fetchData();
        }, 800); // wait 0.8s for analytics to work
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (refreshFlag) {
            fetchData();
        }
    }, [refreshFlag]);

    // Filter URLs based on the search query
    const filteredUrls = useMemo(() => {
        if (!searchQuery) {
            return urls;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return urls.filter(
            (u) =>
                u.targetUrl &&
                u.targetUrl.toLowerCase().includes(lowercasedQuery),
        );
    }, [urls, searchQuery]);

    return (
        <div className="mt-6 p-6 bg-gray-800 shadow-lg w-full max-w-6xl mx-auto">
            <div className="sm:flex sm:justify-between sm:items-center">
                <h2 className="text-2xl font-bold text-white text-center sm:text-left">
                    The Shortened Urls
                </h2>
                <input
                    type="text"
                    placeholder="Search by URL..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="mt-4 sm:mt-0 p-2 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-1/3"
                />
            </div>
            <p className="mb-4 text-gray-400">
                All shortened URLs chronologically sorted from newest to oldest.
            </p>
            {filteredUrls.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left table-auto border-collapse">
                        <thead>
                        <tr className="bg-gray-700 text-gray-300 uppercase text-sm leading-normal">
                            <th className="py-3 px-6 text-left">Slug</th>
                            <th className="py-3 px-6 text-left">Original URL</th>
                            <th className="py-3 px-6 text-center">Hits (Total)</th>
                            <th className="py-3 px-6 text-left">Created At</th>
                            <th className="py-3 px-6 text-center">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="text-gray-200 text-sm font-light">
                        {filteredUrls.map((u) => (
                            <tr
                                key={u.slug}
                                className="border-b border-gray-700 hover:bg-gray-700 transition-all duration-200"
                            >
                                <td className="py-3 px-6 whitespace-nowrap">
                                    <a
                                        href={`/${u.slug}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        onClick={handleSlugClick}
                                        className="text-blue-400 hover:underline font-mono"
                                    >
                                        {u.slug}
                                    </a>
                                </td>
                                <td className="py-3 px-6 max-w-xs truncate">{u.targetUrl}</td>
                                <td className="py-3 px-6 text-center">{u.hits}</td>
                                <td className="py-3 px-6 whitespace-nowrap">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleString() : ''}
                                </td>
                                <td className="py-3 px-6 text-center">
                                    <button
                                        onClick={() =>
                                            navigator.clipboard.writeText(
                                                `${
                                                    process.env.FRONTEND_URL ||
                                                    'http://localhost:3000'
                                                }/${u.slug}`,
                                            )
                                        }
                                        className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-700 cursor-pointer"
                                    >
                                        Copy
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-400 text-center py-4">No URLs found.</p>
            )}
        </div>
    );
}