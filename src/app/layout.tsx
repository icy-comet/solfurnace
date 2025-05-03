import type { Metadata } from "next";
import { Orbitron } from "next/font/google";
import "./globals.css";

const orbitronFont = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SOL Cleaner",
  description: "Satisfy your brain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${orbitronFont.variable} antialiased font-[family-name:var(--font-orbitron)]`}
      >
        {children}
      </body>
    </html>
  );
}
