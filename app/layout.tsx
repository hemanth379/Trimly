import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Trimly — URL Shortener",
  description: "Shorten any link in seconds. Track every click. Share anywhere.",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}