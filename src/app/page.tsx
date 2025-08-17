"use client";

import { UrlForm } from './components/UrlForm';
import { useState } from 'react';
import { UrlListAll } from "@/app/components/UrlListAll";
import NavBar from "@/app/components/NavBar";

export default function HomePage() {
    const [refreshKey, setRefreshKey] = useState(0);

    return (
        <div className="min-h-screen flex flex-col items-center justify-start bg-black text-white py-16 px-4 gap-8">
            <UrlForm onShortened={ () => setRefreshKey(k => k + 1) }/>
            <UrlListAll key={ refreshKey }/>
        </div>
    );
}
