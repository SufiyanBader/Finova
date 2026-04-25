"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 32 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] },
});

const features = [
  {
    icon: "◈",
    title: "Expense Intelligence",
    desc: "Every transaction, automatically categorized and analyzed. No spreadsheets. No guesswork.",
  },
  {
    icon: "◎",
    title: "Predictive Forecasting",
    desc: "See next month's cash flow before it happens. AI models built on your real patterns.",
  },
  {
    icon: "⊕",
    title: "Live Tracking",
    desc: "Your financial pulse, always on. Instant alerts when something needs attention.",
  },
  {
    icon: "◇",
    title: "Adaptive Budgets",
    desc: "Budgets that flex with your life — recalibrated automatically as habits shift.",
  },
  {
    icon: "⊗",
    title: "Zero-Knowledge Security",
    desc: "Your data is encrypted end-to-end. We analyze patterns, never raw numbers.",
  },
  {
    icon: "◉",
    title: "Weekly AI Briefs",
    desc: "A concise, personalised financial report every Sunday. Know your week before it starts.",
  },
];

const stats = [
  { value: "2.4M+", label: "Transactions Analyzed" },
  { value: "$180B", label: "Assets Tracked" },
  { value: "94%", label: "Accuracy Rate" },
  { value: "< 1s", label: "Real-Time Updates" },
];

export default function LandingPage() {
  return (
    <div
      style={{ fontFamily: "'DM Serif Display', Georgia, serif" }}
      className="bg-[#080810] text-white min-h-screen overflow-hidden"
    >
      {/* Import fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        body { margin: 0; }
      `}</style>

      {/* Subtle grid texture */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Nav */}
      <nav className="relative z-20 flex items-center justify-between px-8 py-6 max-w-7xl mx-auto">
        <span
          style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.02em" }}
          className="text-xl text-white"
        >
          fin<span className="text-emerald-400">ova</span>
        </span>
        <div
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
          className="hidden md:flex gap-8 text-sm text-white/50"
        >
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-white transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
        </div>
        <Link href="/dashboard">
          <button
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
            className="text-sm px-5 py-2 rounded-full border border-white/20 hover:border-emerald-400/60 hover:text-emerald-300 transition-all text-white/70"
          >
            Sign in →
          </button>
        </Link>
      </nav>

      {/* HERO */}
      <section className="relative z-10 flex flex-col items-center text-center px-6 pt-20 pb-28">
        {/* Glow orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-24 left-1/4 w-[300px] h-[300px] bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

        <motion.div {...fadeUp(0)}>
          <span
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, letterSpacing: "0.12em" }}
            className="text-xs uppercase text-emerald-400/80 mb-6 inline-block"
          >
            AI-Powered Financial Intelligence
          </span>
        </motion.div>

        <motion.h1
          {...fadeUp(0.1)}
          style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.03em", lineHeight: 1.05 }}
          className="text-6xl md:text-8xl font-normal mb-6 max-w-5xl"
        >
          Your money,<br />
          <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-teal-400">
            finally understood.
          </em>
        </motion.h1>

        <motion.p
          {...fadeUp(0.2)}
          style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, lineHeight: 1.7 }}
          className="text-white/50 max-w-xl text-lg mb-10"
        >
          Stop drowning in numbers. finova turns raw transactions into a clear story about
          your financial life — and tells you exactly what to do next.
        </motion.p>

        <motion.div {...fadeUp(0.3)} className="flex gap-3 flex-wrap justify-center">
          <Link href="/dashboard">
            <button
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              className="px-8 py-4 rounded-full bg-emerald-400 text-black text-sm font-medium hover:bg-emerald-300 transition-all hover:scale-105 active:scale-100"
            >
              Start for free — no card needed
            </button>
          </Link>
          
        </motion.div>

        {/* Stats strip */}
        <motion.div
          {...fadeUp(0.4)}
          className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px w-full max-w-3xl rounded-2xl overflow-hidden border border-white/5"
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="bg-white/[0.03] px-6 py-5 text-center hover:bg-white/[0.06] transition-colors"
            >
              <div
                style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.02em" }}
                className="text-2xl text-emerald-300 mb-1"
              >
                {s.value}
              </div>
              <div
                style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
                className="text-xs text-white/35 uppercase tracking-widest"
              >
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 w-full max-w-5xl rounded-2xl border border-white/[0.07] bg-white/[0.03] backdrop-blur-lg p-1 shadow-2xl"
        >
          {/* Fake browser bar */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.07]">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
              className="ml-3 text-xs text-white/20"
            >
              app.finova.co/dashboard
            </div>
          </div>
          <div className="relative h-64 md:h-96 bg-gradient-to-br from-emerald-500/10 via-transparent to-violet-500/10 rounded-xl flex items-center justify-center overflow-hidden">
             <Image
              src="/dashboard-preview.png"
              alt="Dashboard Preview"
              fill
              className="object-contain rounded-lg shadow-2xl p-2"
              priority
              />
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-16"
          >
            <p
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, letterSpacing: "0.12em" }}
              className="text-xs uppercase text-emerald-400/70 mb-4"
            >
              Everything you need
            </p>
            <h2
              style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.03em", lineHeight: 1.1 }}
              className="text-4xl md:text-5xl font-normal max-w-lg"
            >
              Built for people who want clarity, not more complexity.
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-px bg-white/[0.06] rounded-2xl overflow-hidden border border-white/[0.06]">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="bg-[#080810] p-8 hover:bg-white/[0.03] transition-colors group"
              >
                <div
                  style={{ fontFamily: "'DM Serif Display', serif" }}
                  className="text-2xl text-emerald-400/60 mb-5 group-hover:text-emerald-300 transition-colors"
                >
                  {f.icon}
                </div>
                <h3
                  style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.01em" }}
                  className="text-lg mb-3 text-white/90"
                >
                  {f.title}
                </h3>
                <p
                  style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, lineHeight: 1.65 }}
                  className="text-sm text-white/40"
                >
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="relative z-10 py-28 px-6">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-900/5 to-transparent pointer-events-none" />
        <div className="max-w-5xl mx-auto">
          <p
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, letterSpacing: "0.12em" }}
            className="text-xs uppercase text-emerald-400/70 mb-4 text-center"
          >
            The process
          </p>
          <h2
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.03em" }}
            className="text-4xl md:text-5xl font-normal text-center mb-20"
          >
            From raw data to real decisions.
          </h2>

          <div className="relative grid md:grid-cols-3 gap-12">
            {/* Connector line on desktop */}
            <div className="hidden md:block absolute top-6 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />

            {[
              {
                num: "I",
                title: "Connect once",
                desc: "Link your accounts securely in under 2 minutes. We support 10,000+ banks and financial institutions.",
              },
              {
                num: "II",
                title: "AI does the work",
                desc: "Our models run continuously — surfacing patterns, anomalies, and opportunities you'd never spot manually.",
              },
              {
                num: "III",
                title: "Act on insights",
                desc: "Clear, jargon-free guidance lands in your inbox weekly. Know what to do, not just what happened.",
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div
                  style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic" }}
                  className="text-4xl text-emerald-400/40 mb-6"
                >
                  {item.num}
                </div>
                <h3
                  style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.01em" }}
                  className="text-xl mb-3"
                >
                  {item.title}
                </h3>
                <p
                  style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300, lineHeight: 1.7 }}
                  className="text-sm text-white/40"
                >
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL / QUOTE */}
      <section className="relative z-10 py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            style={{ fontFamily: "'DM Serif Display', serif", fontStyle: "italic", letterSpacing: "-0.02em", lineHeight: 1.3 }}
            className="text-3xl md:text-4xl text-white/70 mb-8"
          >
            &quot;I spent 3 years thinking I had a spending problem. Turns out I had a visibility problem.&quot;
          </div>
          <div
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            className="text-sm text-white/30"
          >
            — Maya K., freelance designer, finova user since 2025
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative z-10 py-28 px-6 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <p
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400, letterSpacing: "0.12em" }}
            className="text-xs uppercase text-emerald-400/70 mb-6"
          >
            Get started today
          </p>
          <h2
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.03em", lineHeight: 1.1 }}
            className="text-5xl md:text-6xl font-normal mb-6"
          >
            The smartest thing<br />
            <em className="not-italic text-emerald-300">your money</em> can do.
          </h2>
          <p
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            className="text-white/40 mb-10 text-lg"
          >
            Free to start. Cancel anytime. Your first month of insights, on us.
          </p>
          <Link href="/dashboard">
            <button
              style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 400 }}
              className="px-12 py-5 rounded-full bg-emerald-400 text-black text-base hover:bg-emerald-300 transition-all hover:scale-105 active:scale-100 shadow-[0_0_60px_rgba(52,211,153,0.2)]"
            >
              Begin &mdash; it&apos;s free
            </button>
          </Link>
          <p
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            className="mt-4 text-xs text-white/25"
          >
            No credit card required · 256-bit encryption · Cancel any time
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.07] py-10 px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span
            style={{ fontFamily: "'DM Serif Display', serif", letterSpacing: "-0.02em" }}
            className="text-lg text-white/60"
          >
            fin<span className="text-emerald-400">ova</span>
          </span>
          <div
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            className="flex gap-6 text-xs text-white/25"
          >
            <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
            <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            <a href="#" className="hover:text-white/60 transition-colors">Security</a>
            <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
          </div>
          <span
            style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 300 }}
            className="text-xs text-white/20"
          >
            © 2026 finova · Smarter money decisions
          </span>
        </div>
      </footer>
    </div>
  );
}