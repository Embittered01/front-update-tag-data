import type { Metadata, Viewport } from "next";
import "./globals.css";
import '@/lib/fontawesome';
import { AppProvider } from '@/contexts/AppContext';
import { Geist, Figtree } from 'next/font/google';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
});

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: "Toll Gate Manager",
  description: "Sistema de gestión de Peajes - Administración completa de tarifas, horarios y concesionarios",
  keywords: ["toll gate", "peaje", "gestión", "tarifas", "concesionarios", "administración"],
  authors: [{ name: "Toll Gate Manager Team" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.ico" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={`${geistSans.variable} ${figtree.variable} antialiased`}>
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
