"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import ConfessionCard from "@/components/ConfessionCard";
import SubmitModal from "@/components/SubmitModal";
import type { Confession } from "@/lib/db";

export default function HomeClient({
  confessions,
}: {
  confessions: Confession[];
}) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <main className="flex flex-col min-h-screen">
        <HeroSection onSubmitClick={() => setModalOpen(true)} />

        {/* Feed header */}
        <div className="px-6 md:px-16 lg:px-24 pt-8 pb-4">
          <div className="flex items-center gap-4 max-w-[54ch]">
            <span className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.4em] uppercase text-[#2e2b28]">
              Latest Confessions
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-[#2e2b28] to-transparent" />
            <span className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] uppercase text-[#2e2b28]">
              {confessions.length} tonight
            </span>
          </div>
        </div>

        {/* Feed */}
        <section
          className="feed-container flex-1 px-6 md:px-16 lg:px-24 pb-40"
          aria-label="Confession feed"
        >
          {confessions.length === 0 && (
            <div className="py-32 text-center">
              <p className="font-[family-name:var(--font-playfair)] text-3xl text-[#2e2b28] italic">
                Nothing yet.
              </p>
              <p className="mt-4 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.25em] uppercase text-[#2e2b28]">
                Be the first to confess.
              </p>
            </div>
          )}
          {confessions.map((confession, index) => (
            <div key={confession.id}>
              <ConfessionCard confession={confession} />
              {index < confessions.length - 1 && (
                <div className="confession-divider max-w-[54ch]" />
              )}
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="border-t border-white/[0.04] px-6 md:px-16 lg:px-24 py-10">
          <div className="flex items-center justify-between">
            <span className="font-[family-name:var(--font-playfair)] text-xl text-[#2e2b28] italic">
              DMC Confesses
            </span>
            <a
              href="/admin/login"
              className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] uppercase text-[#1a1917] hover:text-[#2e2b28] transition-colors duration-500"
              aria-label="Admin access"
            >
              Admin
            </a>
          </div>
        </footer>
      </main>

      <SubmitModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}

function HeroSection({ onSubmitClick }: { onSubmitClick: () => void }) {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.6], [0, -40]);

  return (
    <motion.section
      ref={heroRef}
      className="relative flex flex-col justify-end min-h-[92vh] pb-20 px-6 md:px-16 lg:px-24"
      style={{ opacity: heroOpacity, y: heroY }}
    >
      <div className="max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(3rem,10vw,9rem)] leading-[0.9] text-[#e8e0d4] font-normal tracking-[-0.03em] select-none">
            DMC Confesses
          </h1>
        </motion.div>

        <motion.div
          className="mt-10 ml-1 flex flex-col sm:flex-row items-start sm:items-end gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.9 }}
        >
          <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.25em] uppercase text-[#4a4540] max-w-[38ch] leading-relaxed">
            Anonymous. Encrypted. Permanent.
            <br />
            Say the thing you have never said out loud.
          </p>

          <button
            onClick={onSubmitClick}
            className="sm:ml-auto font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.3em] uppercase text-[#e8e0d4] border border-[#e8e0d4]/15 px-7 py-3 hover:border-[#e8e0d4]/50 hover:shadow-[0_0_28px_rgba(139,26,26,0.25)] transition-all duration-500 cursor-pointer bg-transparent whitespace-nowrap"
          >
            Submit Confession
          </button>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.div
        className="absolute bottom-8 right-6 md:right-16 lg:right-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.3em] uppercase text-[#2e2b28]">
            Scroll
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-[#2e2b28] to-transparent" />
        </div>
      </motion.div>
    </motion.section>
  );
}
