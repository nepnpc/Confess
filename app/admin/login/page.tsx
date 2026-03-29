"use client";

import { useActionState } from "react";
import { adminLogin, type ActionState } from "@/lib/actions";

const initial: ActionState = {};

export default function AdminLoginPage() {
  const [state, action, pending] = useActionState(adminLogin, initial);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <div className="mb-14 text-center">
          <span className="font-[family-name:var(--font-playfair)] text-3xl text-[#e8e0d4] italic">
            Confess.
          </span>
          <p className="mt-2 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.3em] uppercase text-[#2e2b28]">
            Admin Access
          </p>
        </div>

        <form action={action} className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.3em] uppercase text-[#4a4540]"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="bg-transparent border border-white/10 text-[#e8e0d4] font-[family-name:var(--font-geist-mono)] text-sm px-4 py-3 outline-none focus:border-white/30 transition-colors duration-300 placeholder:text-[#2e2b28]"
              placeholder="••••••••••••"
            />
          </div>

          {state.error && (
            <p className="font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.1em] text-[#8b1a1a]">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-2 font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.3em] uppercase text-[#e8e0d4] border border-[#e8e0d4]/15 py-3 hover:border-[#e8e0d4]/50 hover:shadow-[0_0_28px_rgba(139,26,26,0.25)] transition-all duration-500 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer bg-transparent w-full"
          >
            {pending ? "Verifying..." : "Enter"}
          </button>
        </form>

        <div className="mt-10 text-center">
          <a
            href="/"
            className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.2em] uppercase text-[#2e2b28] hover:text-[#4a4540] transition-colors duration-300"
          >
            ← Back to feed
          </a>
        </div>
      </div>
    </main>
  );
}
