'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { shortenUrl } from '../lib/api';

type Props = { onShortened: () => void };
type ShortenResponse = { slug: string; shortUrl: string };

const SLUG_LEN = 4 as const;
const FRIENDLY_ALPHABET =
    'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789' as const;
const FRIENDLY_SET = new Set([...FRIENDLY_ALPHABET]);

function isFriendlySlug(s: string): boolean {
    if (s.length !== SLUG_LEN) return false;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        const code = ch.charCodeAt(0);
        if (code < 0x21 || code > 0x7e) return false;
        if (!FRIENDLY_SET.has(ch)) return false;
    }
    return true;
}

function isValidHttpUrl(raw: string): boolean {
    const v = raw.trim();
    if (!v) return false;
    try {
        const u = new URL(v);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch {
        return false;
    }
}

export function UrlForm({ onShortened }: Props) {
    const [url, setUrl] = useState('');
    const [slug, setSlug] = useState('');
    const [short, setShort] = useState<string>('');
    const [serverError, setServerError] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const urlRef = useRef<HTMLInputElement | null>(null);

    const urlError = useMemo(() => {
        if (!url) return '';
        return isValidHttpUrl(url) ? '' : 'Enter a valid URL starting with http:// or https://';
    }, [url]);

    const slugError = useMemo(() => {
        if (!slug) return '';
        return isFriendlySlug(slug)
            ? ''
            : `Alias must be exactly ${SLUG_LEN} friendly characters: [${FRIENDLY_ALPHABET}]`;
    }, [slug]);

    const canSubmit = useMemo(
        () => !loading && isValidHttpUrl(url) && (slug === '' || isFriendlySlug(slug)),
        [loading, url, slug]
    );

    const resetForm = useCallback(() => {
        setUrl('');
        setSlug('');
        setServerError('');
        setShort('');
        setTimeout(() => urlRef.current?.focus(), 0);
    }, []);

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setServerError('');

            if (!canSubmit) return; // extra guard

            setLoading(true);
            setShort('');

            try {
                const res = await shortenUrl(url.trim(), slug.trim() || undefined);
                const data = (res?.data ?? {}) as ShortenResponse;
                if (!data?.shortUrl) throw new Error('Unexpected response');
                setShort(data.shortUrl);
                setUrl('');
                setSlug('');
                onShortened?.();
            } catch (err: any) {
                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Failed to shorten URL';
                setServerError(msg);
            } finally {
                setLoading(false);
            }
        },
        [canSubmit, onShortened, slug, url]
    );

    return (
        <div className="flex justify-center items-center w-full p-4">
            <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-6 p-8 bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl"
                noValidate
            >
                <h2 className="text-2xl font-bold text-white text-center">Shorten a URL</h2>

                {/* URL */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="long-url" className="text-sm text-gray-300">Long URL</label>
                    <input
                        id="long-url"
                        ref={urlRef}
                        type="url"
                        placeholder="https://example.com/page"
                        value={url}
                        onChange={(e) => {
                            setUrl(e.target.value);
                            if (serverError) setServerError('');
                        }}
                        required
                        autoComplete="off"
                        aria-invalid={Boolean(url && urlError)}
                        aria-describedby="url-error"
                        className={`p-3 w-full rounded-lg bg-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 ${
                            url && urlError ? 'ring-2 ring-red-500' : 'focus:ring-sky-500'
                        }`}
                    />
                    {url && urlError && (
                        <div className="text-xs text-red-400" id="url-error">
                            {urlError}
                        </div>
                    )}
                </div>

                {/* Alias */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="custom-slug" className="text-sm text-gray-300">
                        Custom alias (optional)
                    </label>
                    <input
                        id="custom-slug"
                        type="text"
                        placeholder="4 chars, e.g. Ab3Z"
                        value={slug}
                        onChange={(e) => {
                            setSlug(e.target.value.trim());
                            if (serverError) setServerError('');
                        }}
                        maxLength={SLUG_LEN}
                        autoComplete="off"
                        aria-invalid={Boolean(slug && slugError)}
                        aria-describedby="slug-error"
                        className={`p-3 w-full rounded-lg bg-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 ${
                            slug && slugError ? 'ring-2 ring-red-500' : 'focus:ring-sky-500'
                        }`}
                    />
                    <div className="text-xs text-gray-400">
                        Allowed: {FRIENDLY_ALPHABET} (exactly {SLUG_LEN} chars)
                    </div>
                    {slug && slugError && (
                        <div className="text-xs text-red-400" id="slug-error">
                            {slugError}
                        </div>
                    )}
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={!canSubmit}
                    className={`p-3 w-full rounded-lg text-white font-semibold transition-all duration-200 ${
                        !canSubmit
                            ? 'bg-gray-600 text-gray-300 cursor-not-allowed'
                            : 'bg-sky-500 hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-800'
                    }`}
                >
                    {loading ? 'Shortening…' : short ? 'Shorten another' : 'Shorten URL'}
                </button>

                {/* Server error */}
                {serverError && (
                    <p className="text-red-400 text-sm text-center bg-gray-700 p-2 rounded-lg" role="alert">
                        {serverError}
                    </p>
                )}

                {/* Success */}
                {short && (
                    <div className="flex flex-col gap-2 p-4 bg-gray-700 rounded-lg" aria-live="polite">
                        <p className="text-gray-300">Your shortened URL:</p>
                        <div className="flex items-center gap-2">
                            <input
                                value={short}
                                readOnly
                                className="flex-1 p-2 rounded-md bg-gray-600 text-gray-200 truncate focus:outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => navigator.clipboard.writeText(short)}
                                className="p-2 rounded-md bg-green-600 text-white hover:bg-green-700 font-medium focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Copy
                            </button>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="p-2 rounded-md bg-gray-800 text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-600"
                                title="Clear and shorten another"
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
