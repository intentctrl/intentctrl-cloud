import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const fontSans = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IntentCtrl Cloud",
  description: "Self-hosted chat management dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "text-foreground",
        "bg-background",
        "h-full",
        "antialiased",
        fontSans.variable,
        fontMono.variable,
        "font-sans",
        "scrollbar-thin scrollbar-track-background scrollbar-thumb-foreground/50",
      )}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
