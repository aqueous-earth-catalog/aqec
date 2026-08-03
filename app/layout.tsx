import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { ThemeProvider } from "@/components/theme/theme-provider";
import "./globals.css";
import { getWebAppMetadata } from "./data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  try {
    const metadata = await getWebAppMetadata();
    return {
      title: metadata.title,
      description: metadata.description,
      keywords: metadata.keywords,
      creator: metadata.creator,
    };
  } catch {
    return {
      title: "Media Mapper",
      description:
        "Explore media objects based on their geographical location data. An open-source framework made possible through funding provided by the University of Pennsylvania.",
      keywords: [
        "media mapping",
        "geographical data",
        "spatial exploration",
        "open source",
        "University of Pennsylvania",
      ],
      creator:
        "Ennuri Jo through funding provided by the University of Pennsylvania. Development work completed by Lost Creek Designs LLC.",
    };
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const metadata = await getWebAppMetadata();

  return (
    <html lang="en" suppressHydrationWarning>
      <body
  className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-dvh overflow-x-hidden`}
>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:shadow-lg focus:no-underline"
          >
            Skip to main content
          </a>
          <Navbar title={metadata.title} />
<main id="main-content" role="main" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {children}
          </main>
          <Footer owner={metadata.owner} />
        </ThemeProvider>
        {process.env.ENABLE_ANALYTICS === "true" && <Analytics />}
      </body>
    </html>
  );
}
