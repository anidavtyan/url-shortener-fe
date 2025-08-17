"use client";

import { useState } from 'react';
import { UrlList } from "@/app/components/UrlList";

export default function HomePage() {
    const [refreshKey, setRefreshKey] = useState(0);

    const onShortened = () => setRefreshKey(prev => prev + 1);

    return (
        <main className="min-h-screen flex flex-col items-center justify-start bg-black text-white py-16 px-4 gap-8">
            <UrlList key={refreshKey} />
        </main>
    );
}
