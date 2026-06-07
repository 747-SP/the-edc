import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The EDC",
  description: "Everyday Carry — Post to Bluesky, archive in a calendar.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 font-sans">
        {children}
      </body>
    </html>
  );
}
