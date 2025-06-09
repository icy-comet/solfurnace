import type { Metadata } from "next";
import "./globals.css";
import { Doto } from "next/font/google";
import { ChainContextProvider } from "@/providers/ChainProvider";
import { ActiveWalletAccountContextProvider } from "@/providers/ActiveWalletAccountProvider";
import { RpcContextProvider } from "@/providers/RpcProvider";
import { QueryClientProviderSSR } from "@/providers/QueryClientProvider";

const customFont = Doto({
  variable: "--font-doto",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  title: "SolFurnace",
  description: "Satisfy your brain.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`antialiased ${customFont.variable} font-(family-name:--font-doto)`}
      >
        <ChainContextProvider>
          <RpcContextProvider>
            <ActiveWalletAccountContextProvider>
              <QueryClientProviderSSR>{children}</QueryClientProviderSSR>
            </ActiveWalletAccountContextProvider>
          </RpcContextProvider>
        </ChainContextProvider>
      </body>
    </html>
  );
}
