import './globals.css';
import NavBar from "@/app/components/NavBar";

export default function RootLayout( { children }: { children: React.ReactNode } ) {
    return (
        <html lang="en">
        <body className="bg-black text-white antialiased">
        <main id="content" className="mx-auto w-full max-w-6xl">
            <NavBar/>
            { children }
        </main>
        </body>
        </html>
    );
}
