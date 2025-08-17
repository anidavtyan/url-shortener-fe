import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
            <div className="text-center">
                <h1 className="text-6xl sm:text-7xl font-bold text-sky-500 mb-4">
                    404
                </h1>
                <h2 className="text-3xl sm:text-4xl font-semibold text-white mb-6">
                    Page Not Found
                </h2>
                <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-md mx-auto">
                    The page you are looking for does not exist. It might have been moved or deleted.
                </p>
                <Link
                    href="/"
                    className="inline-block px-8 py-3 rounded-lg bg-gray-700 text-white font-semibold transition-colors duration-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900"
                >
                    Go back home
                </Link>
            </div>
        </main>
    );
}