import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIML Club x Red Bull | Inventra 2026",
  description: "An interactive cinematic sponsorship invitation experience for Red Bull at Inventra 2026.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#050608",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark bg-[#050608] text-white">
      <body className="min-h-screen bg-[#050608] text-white antialiased selection:bg-[#ea1d2d] selection:text-white">
        {children}
      </body>
    </html>
  );
}
