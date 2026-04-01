import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ignitera OS | Neural Career Ecosystem",
  description: "Next-generation hierarchical talent management & internal currency OS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Outfit', sans-serif", margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}
