"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { submitConfession, type ActionState } from "@/lib/actions";

const CATEGORIES = [
  "Career",
  "Relationships",
  "Family",
  "Grief",
  "Identity",
  "Desire",
  "Fear",
  "Shame",
  "Other",
];

const MAX_CHARS = 600;
const initial: ActionState = {};

/** Extract unique words (≥3 chars) from text for the word picker */
function extractUniqueWords(text: string): string[] {
  const raw = text.match(/[a-zA-Z''\-]+/g) ?? [];
  const seen = new Set<string>();
  const result: string[] = [];
  for (const w of raw) {
    const key = w.toLowerCase();
    if (key.length >= 3 && !seen.has(key)) {
      seen.add(key);
      result.push(w);
    }
  }
  return result;
}

function WordPicker({
  text,
  redactedWords,
  onChange,
}: {
  text: string;
  redactedWords: string[];
  onChange: (words: string[]) => void;
}) {
  const words = extractUniqueWords(text);
  if (words.length === 0) return null;

  const redactedSet = new Set(redactedWords.map((w) => w.toLowerCase()));

  function toggle(word: string) {
    const key = word.toLowerCase();
    if (redactedSet.has(key)) {
      onChange(redactedWords.filter((w) => w.toLowerCase() !== key));
    } else {
      onChange([...redactedWords, word]);
    }
  }

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-center gap-3">
        <span className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.3em] uppercase text-[#2e2b28]">
          Redact words
        </span>
        <span className="font-[family-name:var(--font-geist-mono)] text-[9px] text-[#2e2b28]">
          — tap to hide until clicked
        </span>
        {redactedWords.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="ml-auto font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] uppercase text-[#2e2b28] hover:text-[#4a4540] transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            Clear
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {words.map((word) => {
          const isRedacted = redactedSet.has(word.toLowerCase());
          return (
            <button
              key={word}
              type="button"
              onClick={() => toggle(word)}
              className={`font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.05em] px-3 py-1.5 border transition-all duration-200 cursor-pointer select-none ${
                isRedacted
                  ? "bg-[#1a1817] border-[#1a1817] text-transparent hover:text-[#8b1a1a] hover:bg-[#1a1817] hover:border-[#8b1a1a]/40"
                  : "bg-transparent border-white/8 text-[#4a4540] hover:border-white/20 hover:text-[#c5bdb4]"
              }`}
              title={isRedacted ? `Unredact "${word}"` : `Redact "${word}"`}
            >
              {word}
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubmitModal({ isOpen, onClose }: Props) {
  const [state, action, pending] = useActionState(submitConfession, initial);
  const [text, setText] = useState("");
  const [category, setCategory] = useState("");
  const [redactedWords, setRedactedWords] = useState<string[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (isOpen) setTimeout(() => textareaRef.current?.focus(), 300);
  }, [isOpen]);

  useEffect(() => {
    if (state.success) {
      setText("");
      setCategory("");
      setRedactedWords([]);
      formRef.current?.reset();
    }
  }, [state.success]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  // Keep only redacted words that still exist in the current text
  useEffect(() => {
    if (redactedWords.length === 0) return;
    const textLower = text.toLowerCase();
    const stillPresent = redactedWords.filter((w) =>
      textLower.includes(w.toLowerCase())
    );
    if (stillPresent.length !== redactedWords.length) {
      setRedactedWords(stillPresent);
    }
  }, [text, redactedWords]);

  const remaining = MAX_CHARS - text.length;
  const overLimit = remaining < 0;
  const hasEnoughText = text.trim().length >= 20;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-[#0a0a0a]/92 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-2xl mx-6 flex flex-col max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute -top-10 right-0 text-[#4a4540] hover:text-[#e8e0d4] transition-colors duration-300 cursor-pointer bg-transparent border-none"
            >
              <X size={18} strokeWidth={1.2} />
            </button>

            {/* Heading */}
            <h2 className="font-[family-name:var(--font-playfair)] text-4xl md:text-5xl text-[#e8e0d4] font-normal mb-8 italic">
              Say it.
            </h2>

            <AnimatePresence mode="wait">
              {state.success ? (
                <motion.div
                  key="success"
                  className="py-14 flex flex-col items-center gap-4 text-center"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="font-[family-name:var(--font-playfair)] text-2xl text-[#e8e0d4] italic">
                    {state.message}
                  </p>
                  <p className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.25em] uppercase text-[#4a4540]">
                    It will appear after review.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.3em] uppercase text-[#4a4540] border border-white/10 px-6 py-2.5 hover:border-white/30 hover:text-[#e8e0d4] transition-all duration-300 cursor-pointer bg-transparent"
                  >
                    Close
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  ref={formRef}
                  action={action}
                  className="flex flex-col gap-6"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {/* Textarea */}
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      name="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      required
                      minLength={20}
                      maxLength={MAX_CHARS + 50}
                      rows={6}
                      placeholder="I have never told anyone that…"
                      className="w-full bg-transparent border-b border-white/10 focus:border-white/25 text-[#e8e0d4] font-[family-name:var(--font-playfair)] text-lg md:text-xl leading-relaxed py-3 outline-none resize-none transition-colors duration-300 placeholder:text-[#2e2b28] placeholder:italic"
                    />
                    <span
                      className={`absolute bottom-3 right-0 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.15em] transition-colors duration-200 ${
                        overLimit
                          ? "text-[#8b1a1a]"
                          : remaining < 80
                          ? "text-[#b8860b]"
                          : "text-[#2e2b28]"
                      }`}
                    >
                      {remaining}
                    </span>
                  </div>

                  {/* Word picker — only shown once there's enough text */}
                  <AnimatePresence>
                    {hasEnoughText && (
                      <WordPicker
                        text={text}
                        redactedWords={redactedWords}
                        onChange={setRedactedWords}
                      />
                    )}
                  </AnimatePresence>

                  {/* Hidden fields */}
                  <input type="hidden" name="category" value={category} />
                  <input
                    type="hidden"
                    name="redactedWords"
                    value={JSON.stringify(redactedWords)}
                  />

                  {/* Categories */}
                  <div className="flex flex-col gap-3">
                    <span className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.3em] uppercase text-[#2e2b28]">
                      Category
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() =>
                            setCategory(cat === category ? "" : cat)
                          }
                          className={`font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.2em] uppercase px-4 py-2 border transition-all duration-200 cursor-pointer bg-transparent ${
                            category === cat
                              ? "border-[#e8e0d4]/50 text-[#e8e0d4]"
                              : "border-white/10 text-[#4a4540] hover:border-white/25 hover:text-[#c5bdb4]"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Error */}
                  {state.error && (
                    <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.1em] text-[#8b1a1a]">
                      {state.error}
                    </p>
                  )}

                  {/* Submit row */}
                  <div className="flex items-center justify-between pt-2 pb-2">
                    <p className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] uppercase text-[#2e2b28]">
                      Anonymous · No IP logging
                    </p>
                    <button
                      type="submit"
                      disabled={
                        pending || overLimit || !hasEnoughText || !category
                      }
                      className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.3em] uppercase text-[#e8e0d4] border border-[#e8e0d4]/15 px-8 py-3 hover:border-[#e8e0d4]/50 hover:shadow-[0_0_28px_rgba(139,26,26,0.3)] disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-500 cursor-pointer bg-transparent"
                    >
                      {pending ? "Sending…" : "Confess"}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
