"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function HeroSection() {
  const imageRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 100;
      if (imageRef.current) {
        if (scrollY > threshold) {
          imageRef.current.classList.add("scrolled");
        } else {
          imageRef.current.classList.remove("scrolled");
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="pt-40 pb-20 px-4">
      <div className="container mx-auto text-center">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tighter mb-6 gradient-title">
          Manage Your Finances
          <br />
          with Intelligence
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
          An AI-powered financial platform that helps you track, analyze, and
          optimize your spending with smart insights and automated tools.
        </p>
        <div className="flex justify-center gap-4 mb-16">
          <Link href="/dashboard">
            <Button size="lg" className="gradient px-8 py-6 text-lg">
              Get Started Free
            </Button>
          </Link>
          <Link href="#features">
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-6 text-lg"
            >
              Learn More
            </Button>
          </Link>
        </div>

        <div className="hero-image-wrapper mt-8 mx-auto max-w-5xl">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner.jpeg"
              alt="AI Finance dashboard preview"
              width={1280}
              height={720}
              className="rounded-xl shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
