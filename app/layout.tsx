import type { Metadata } from "next";

import { ToastProvider } from "@/src/components/toast-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SiteDNA",
  description: "AI-powered design intelligence for live websites.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="min-h-full bg-slate-100 text-slate-950">
        {children}
        <ToastProvider />
      </body>
    </html>
  );
}
