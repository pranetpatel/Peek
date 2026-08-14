import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { DemoBadge } from "@/components/demo/DemoBadge";
import "./globals.css";

const bodySans = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  weight: "800",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Peek",
  description: "Be seen and heard for who you truly are.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${bodySans.variable} ${geistMono.variable} ${displayFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
        <Suspense fallback={null}>
          <DemoBadge />
        </Suspense>
      </body>
    </html>
  );
}
