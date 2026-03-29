"use client";

import { useRef, useState, useOptimistic, useTransition } from "react";
import { motion, useInView } from "framer-motion";
import { Heart, Eye, Share2 } from "lucide-react";
import { likeConfession } from "@/lib/actions";
import type { Confession } from "@/lib/db";

export type { Confession };

function RedactedSpan({ word }: { word: string }) {
  const [revealed, setRevealed] = useState(false);
  const minWidth = `${Math.max(word.length * 0.6, 2)}ch`;

  return (
    <span
      className={`redacted${revealed ? " revealed" : ""}`}
      style={{ minWidth }}
      onClick={() => setRevealed((v) => !v)}
      title="Click to reveal"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setRevealed((v) => !v)}
      aria-label={revealed ? word : "Redacted — click to reveal"}
    >
      {revealed ? word : "\u00a0".repeat(Math.max(word.length, 4))}
    </span>
  );
}

function parseText(
  text: string,
  redactedWords: string[]
): Array<{ type: "text" | "redacted"; content: string }> {
  if (!redactedWords.length) return [{ type: "text", content: text }];
  const escaped = redactedWords.map((w) =>
    w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  );
  const pattern = new RegExp(`(${escaped.join("|")})`, "gi");
  return text
    .split(pattern)
    .filter((p) => p.length > 0)
    .map((part) => ({
      type: redactedWords.some((w) => w.toLowerCase() === part.toLowerCase())
        ? "redacted"
        : "text",
      content: part,
    }));
}

function LikeButton({
  confessionId,
  initialLikes,
}: {
  confessionId: string;
  initialLikes: number;
}) {
  const [optimisticLikes, addOptimistic] = useOptimistic(
    initialLikes,
    (state: number) => state + 1
  );
  const [liked, setLiked] = useState(false);
  const [, startTransition] = useTransition();

  function handleLike() {
    if (liked) return;
    setLiked(true);
    startTransition(async () => {
      addOptimistic(undefined);
      await likeConfession(confessionId);
    });
  }

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      aria-label="Like confession"
      className={`flex items-center gap-1.5 group font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.15em] uppercase transition-colors duration-300 cursor-pointer bg-transparent border-none p-0 ${
        liked
          ? "text-[#8b1a1a]"
          : "text-[#4a4540] hover:text-[#e8e0d4]"
      }`}
    >
      <Heart
        size={12}
        strokeWidth={1.5}
        className={`transition-all duration-300 ${liked ? "fill-[#8b1a1a] stroke-[#8b1a1a]" : "opacity-70 group-hover:opacity-100"}`}
      />
      <span>{optimisticLikes.toLocaleString()}</span>
    </button>
  );
}

function ShareButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const excerpt = text.slice(0, 120) + (text.length > 120 ? "…" : "");
    try {
      await navigator.clipboard.writeText(excerpt);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  }

  return (
    <button
      onClick={handleShare}
      aria-label="Copy confession excerpt"
      className="flex items-center gap-1.5 group font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.15em] uppercase text-[#4a4540] hover:text-[#e8e0d4] transition-colors duration-300 cursor-pointer bg-transparent border-none p-0"
    >
      <Share2 size={12} strokeWidth={1.5} className="opacity-70 group-hover:opacity-100 transition-opacity" />
      <span>{copied ? "Copied" : "Share"}</span>
    </button>
  );
}

export default function ConfessionCard({
  confession,
}: {
  confession: Confession;
}) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px 0px" });
  const segments = parseText(confession.text, confession.redactedWords);

  return (
    <motion.article
      ref={ref}
      className="confession-item py-16 md:py-24 px-6 md:px-0"
      initial={{ opacity: 0, filter: "blur(10px)", y: 24 }}
      animate={
        isInView
          ? { opacity: 1, filter: "blur(0px)", y: 0 }
          : { opacity: 0, filter: "blur(10px)", y: 24 }
      }
      transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Category */}
      <div className="mb-8">
        <span className="text-[10px] tracking-[0.3em] uppercase font-[family-name:var(--font-geist-mono)] text-[#8b1a1a] border border-[#8b1a1a]/30 px-3 py-1">
          {confession.category}
        </span>
      </div>

      {/* Confession text */}
      <p className="font-[family-name:var(--font-playfair)] text-[clamp(1.5rem,3.5vw,2.8rem)] leading-[1.45] text-[#e8e0d4] font-normal tracking-[-0.01em] max-w-[54ch]">
        {segments.map((seg, i) =>
          seg.type === "redacted" ? (
            <RedactedSpan key={i} word={seg.content} />
          ) : (
            <span key={i}>{seg.content}</span>
          )
        )}
      </p>

      {/* Meta row */}
      <div className="mt-10 flex items-center justify-between max-w-[54ch]">
        <div className="flex items-center gap-6">
          <LikeButton
            confessionId={confession.id}
            initialLikes={confession.likes}
          />
          <button
            aria-label="View count"
            className="flex items-center gap-1.5 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.15em] uppercase text-[#4a4540] cursor-default bg-transparent border-none p-0"
          >
            <Eye size={12} strokeWidth={1.5} className="opacity-70" />
            <span>{confession.views.toLocaleString()}</span>
          </button>
          <ShareButton text={confession.text} />
        </div>

        <div className="flex flex-col items-end gap-1">
          <span className="text-[11px] tracking-[0.2em] uppercase font-[family-name:var(--font-geist-mono)] text-[#4a4540]">
            {confession.handle}
          </span>
          <time
            className="text-[10px] tracking-[0.15em] font-[family-name:var(--font-geist-mono)] text-[#2e2b28]"
            dateTime={confession.timestamp}
          >
            {confession.timestamp}
          </time>
        </div>
      </div>
    </motion.article>
  );
}
