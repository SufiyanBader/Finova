import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Header from "@/components/header";
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
              <Header />
              <main className="min-h-screen">{children}</main>
              <Toaster richColors />
              <SignedIn>
                <ChatWidget />
              </SignedIn>
              <footer className="bg-blue-50 py-12">
                <div className="container mx-auto px-4 text-center text-gray-600">
                  <p>Made with care by the Finova Team</p>
                </div>
              </footer>
            </CurrencyProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}