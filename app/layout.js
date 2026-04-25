import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ThemeProvider from "@/components/theme-provider";
import { Toaster } from "sonner";
import ChatWidget from "@/components/chat/chat-widget";
import { SignedIn } from "@clerk/nextjs";
import { CurrencyProvider } from "@/components/currency-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Finova - Smart Financial Management",
  description: "AI-powered financial tracking and analytics",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <CurrencyProvider>
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