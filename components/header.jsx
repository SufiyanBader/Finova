import Link from "next/link";
import Image from "next/image";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { PenBox, Search } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import NotificationBell from "@/components/notifications/notification-bell";
import { checkUser } from "@/lib/check-user";
import CurrencySelector from "@/components/currency-selector";
import MainNav from "./main-nav";
import MobileNav from "./mobile-nav";

export default async function Header() {
  await checkUser();

  return (
    <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-50 border-b dark:border-gray-800">
      <nav className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/">
          <Image
            src="/logo.png"
            alt="Finova"
            width={200}
            height={60}
            className="h-12 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center space-x-4">
          <SignedIn>
            <MainNav />
            <Link href="/search">
              <Button variant="ghost" size="icon">
                <Search size={18} />
              </Button>
            </Link>
            <Link href="/transaction/create">
              <Button className="gradient">
                <PenBox size={18} />
                <span className="hidden md:inline ml-2">Add Transaction</span>
              </Button>
            </Link>

            <ThemeToggle />
            <CurrencySelector />
            <NotificationBell />

            <MobileNav />

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            />
          </SignedIn>

          <SignedOut>
            <SignInButton forceRedirectUrl="/dashboard">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}
