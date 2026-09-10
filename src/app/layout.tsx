import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Wordmark } from "@/components/wordmark";
import { CommandMenu } from "@/components/command-menu";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Sales Hub", template: "%s · Sales Hub" },
  description: "Ammar Ahmed's prospects, activity and leads in one place.",
  robots: { index: false, follow: false, nocache: true },
  applicationName: "Sales Hub",
  appleWebApp: { capable: true, title: "Sales Hub", statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf8f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0e13" },
  ],
};

// runs before first paint so the theme never flashes
const themeScript = `(function(){try{var t=localStorage.getItem('hub-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.dataset.theme='dark';}catch(e){}})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Nav />
        {/* mobile top bar */}
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-canvas/90 px-5 py-2.5 backdrop-blur lg:hidden">
          <Wordmark />
          <div className="flex items-center gap-2">
            <CommandMenu variant="bar" />
            <ThemeToggle />
          </div>
        </div>
        <main className="min-h-screen px-5 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pl-[calc(15rem+2.5rem)] lg:pr-10 lg:pt-10">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </body>
    </html>
  );
}
