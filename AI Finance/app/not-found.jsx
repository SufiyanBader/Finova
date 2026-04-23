import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center bg-gradient-to-b from-emerald-50 to-white">
      <div className="space-y-2">
        <h1 className="text-9xl font-extrabold gradient-title">404</h1>
        <h2 className="text-2xl font-semibold text-gray-800">Page Not Found</h2>
        <p className="text-gray-500 max-w-md mx-auto text-sm leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
        </Link>
        <Link href="/">
          <Button className="gradient gap-2">
            <Home className="h-4 w-4" />
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
}

