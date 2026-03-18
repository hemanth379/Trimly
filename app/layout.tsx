import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trimly — URL Shortener",
  description: "Shorten any link in seconds. Track every click. Share anywhere.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico?v=2" sizes="any" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}