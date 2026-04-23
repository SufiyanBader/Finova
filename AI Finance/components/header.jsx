import Link from "next/link";
import Image from "next/image";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, PenBox, Target, BarChart3, Search, Menu, Plane, TrendingUp } from "lucide-react";
import ThemeToggle from "@/components/theme-toggle";
import NotificationBell from "@/components/notifications/notification-bell";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { checkUser } from "@/lib/check-user";
import CurrencySelector from "@/components/currency-selector";

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
            <Link href="/dashboard" className="hidden md:flex">
              <Button variant="ghost">
                <LayoutDashboard size={18} />
                <span className="ml-2">Dashboard</span>
              </Button>
            </Link>
            <Link href="/trips" className="hidden md:flex">
              <Button variant="ghost">
                <Plane size={18} />
                <span className="ml-2">Trips</span>
              </Button>
            </Link>
            <Link href="/portfolio" className="hidden md:flex">
              <Button variant="ghost">
                <TrendingUp size={18} />
                <span className="ml-2">Portfolio</span>
              </Button>
            </Link>
            <Link href="/analytics" className="hidden md:flex">
              <Button variant="ghost">
                <BarChart3 size={18} />
                <span className="ml-2">Analytics</span>
              </Button>
            </Link>
            <Link href="/goals" className="hidden md:flex">
              <Button variant="ghost">
                <Target size={18} />
                <span className="ml-2">Goals</span>
              </Button>
            </Link>
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

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="p-4 flex flex-col space-y-4">
                  <Link href="/trips">
                    <Button variant="ghost" className="w-full justify-start">
                      <Plane size={18} className="mr-2" />
                      Trips
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="ghost" className="w-full justify-start">
                      <LayoutDashboard size={18} className="mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/analytics">
                    <Button variant="ghost" className="w-full justify-start">
                      <BarChart3 size={18} className="mr-2" />
                      Analytics
                    </Button>
                  </Link>
                  <Link href="/portfolio">
                    <Button variant="ghost" className="w-full justify-start">
                      <TrendingUp size={18} className="mr-2" />
                      Portfolio
                    </Button>
                  </Link>
                  <Link href="/goals">
                    <Button variant="ghost" className="w-full justify-start">
                      <Target size={18} className="mr-2" />
                      Goals
                    </Button>
                  </Link>
                </DrawerContent>
              </Drawer>
            </div>

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
