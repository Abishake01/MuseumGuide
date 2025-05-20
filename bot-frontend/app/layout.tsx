import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Museum Smart Guide",
  description: "AI-powered multilingual museum ticketing and guidance system",
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="relative flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="container flex h-14 items-center">
              <div className="mr-4 flex">
                <a className="mr-6 flex items-center space-x-2" href="/">
                  <span className="font-bold gradient-text">Museum Smart Guide</span>
                </a>
              </div>
            </div>
          </header>
          {children}
        </main>
      </body>
    </html>
  );
}
