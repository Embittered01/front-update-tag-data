import type { Metadata } from "next";
import "./globals.css";
import '@/lib/fontawesome';
import { AppProvider } from '@/contexts/AppContext';

export const metadata: Metadata = {
  title: "Toll Gate Manager",
  description: "Sistema de gestión de toll gates (peajes) - Administración completa de tarifas, horarios y concesionarios",
  keywords: ["toll gate", "peaje", "gestión", "tarifas", "concesionarios", "administración"],
  authors: [{ name: "Toll Gate Manager Team" }],
  viewport: "width=device-width, initial-scale=1",
};

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
      <body className="antialiased">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
