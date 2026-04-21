export const dynamic = "force-dynamic";

import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider, SignedIn } from "@clerk/nextjs";
import { Toaster } from "sonner";
import Header from "@/components/header";
import ThemeProvider from "@/components/theme-provider";
import ChatWidget from "@/components/chat/chat-widget";
import { CurrencyProvider } from "@/components/currency-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "AI Finance",
  description: "AI-powered personal finance platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className} suppressHydrationWarning>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <CurrencyProvider>
              <Header />
              <main className="min-h-screen">{children}</main>
              <Toaster richColors />
              <SignedIn>
                <ChatWidget />
              </SignedIn>
            </CurrencyProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
