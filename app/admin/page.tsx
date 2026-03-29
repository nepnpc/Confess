import { getConfessions, getStats, type Confession } from "@/lib/db";
import {
  approveConfession,
  rejectConfession,
  deleteConfession,
  adminLogout,
} from "@/lib/actions";

function StatusBadge({ status }: { status: Confession["status"] }) {
  const styles: Record<Confession["status"], string> = {
    pending: "text-[#b8860b] border-[#b8860b]/40",
    approved: "text-[#2d6a2d] border-[#2d6a2d]/40",
    rejected: "text-[#8b1a1a] border-[#8b1a1a]/40",
  };
  return (
    <span
      className={`font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] uppercase border px-2 py-0.5 ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col gap-1 border border-white/[0.06] px-6 py-5">
      <span className="font-[family-name:var(--font-playfair)] text-3xl text-[#e8e0d4]">
        {typeof value === "number" ? value.toLocaleString() : value}
      </span>
      <span className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.3em] uppercase text-[#4a4540]">
        {label}
      </span>
    </div>
  );
}

export default async function AdminPage() {
  const [confessions, stats] = await Promise.all([getConfessions(), getStats()]);

  return (
    <main className="min-h-screen px-6 md:px-12 lg:px-20 py-16">
      {/* Header */}
      <div className="flex items-end justify-between mb-14 pb-6 border-b border-white/[0.06]">
        <div>
          <h1 className="font-[family-name:var(--font-playfair)] text-5xl text-[#e8e0d4] font-normal italic">
            Admin
          </h1>
          <p className="mt-1 font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.3em] uppercase text-[#2e2b28]">
            Confession Dashboard
          </p>
        </div>
        <div className="flex items-center gap-6">
          <a
            href="/"
            className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.25em] uppercase text-[#4a4540] hover:text-[#e8e0d4] transition-colors duration-300"
          >
            ← Public Feed
          </a>
          <form action={adminLogout}>
            <button
              type="submit"
              className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.25em] uppercase text-[#8b1a1a] border border-[#8b1a1a]/30 px-4 py-2 hover:border-[#8b1a1a]/70 transition-colors duration-300 cursor-pointer bg-transparent"
            >
              Logout
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} />
        <StatCard label="Approved" value={stats.approved} />
        <StatCard label="Total Likes" value={stats.totalLikes} />
      </div>

      {/* Table header */}
      <div className="hidden md:grid grid-cols-[1fr_140px_100px_120px_180px] gap-4 px-4 pb-3 border-b border-white/[0.04]">
        {["Confession", "Category", "Likes", "Status", "Actions"].map((h) => (
          <span
            key={h}
            className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.3em] uppercase text-[#2e2b28]"
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      <div className="divide-y divide-white/[0.04]">
        {confessions.length === 0 && (
          <p className="py-12 text-center font-[family-name:var(--font-geist-mono)] text-[11px] tracking-[0.2em] uppercase text-[#2e2b28]">
            No confessions yet.
          </p>
        )}
        {confessions.map((c) => (
          <div
            key={c.id}
            className="group py-5 px-4 hover:bg-white/[0.015] transition-colors duration-300"
          >
            {/* Mobile layout */}
            <div className="flex flex-col gap-3 md:hidden">
              <p className="font-[family-name:var(--font-playfair)] text-base text-[#c5bdb4] leading-relaxed line-clamp-3">
                {c.text}
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={c.status} />
                <span className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] uppercase text-[#4a4540]">
                  {c.category}
                </span>
                <span className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] text-[#4a4540]">
                  {c.likes.toLocaleString()} likes
                </span>
              </div>
              <AdminActions confession={c} />
            </div>

            {/* Desktop layout */}
            <div className="hidden md:grid grid-cols-[1fr_140px_100px_120px_180px] gap-4 items-center">
              <div>
                <p className="font-[family-name:var(--font-playfair)] text-sm text-[#c5bdb4] leading-relaxed line-clamp-2">
                  {c.text}
                </p>
                <span className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.15em] text-[#2e2b28] mt-1 block">
                  {c.handle} · {c.timestamp}
                </span>
              </div>
              <span className="font-[family-name:var(--font-geist-mono)] text-[10px] tracking-[0.2em] uppercase text-[#4a4540]">
                {c.category}
              </span>
              <span className="font-[family-name:var(--font-geist-mono)] text-[13px] text-[#4a4540]">
                {c.likes.toLocaleString()}
              </span>
              <StatusBadge status={c.status} />
              <AdminActions confession={c} />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function AdminActions({ confession: c }: { confession: Confession }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {c.status !== "approved" && (
        <form
          action={async () => {
            "use server";
            await approveConfession(c.id);
          }}
        >
          <button
            type="submit"
            className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] uppercase text-[#2d6a2d] border border-[#2d6a2d]/40 px-3 py-1.5 hover:border-[#2d6a2d] transition-colors duration-200 cursor-pointer bg-transparent"
          >
            Approve
          </button>
        </form>
      )}
      {c.status !== "rejected" && c.status !== "pending" && (
        <form
          action={async () => {
            "use server";
            await rejectConfession(c.id);
          }}
        >
          <button
            type="submit"
            className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] uppercase text-[#4a4540] border border-white/10 px-3 py-1.5 hover:border-white/30 transition-colors duration-200 cursor-pointer bg-transparent"
          >
            Reject
          </button>
        </form>
      )}
      {c.status === "pending" && (
        <form
          action={async () => {
            "use server";
            await rejectConfession(c.id);
          }}
        >
          <button
            type="submit"
            className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] uppercase text-[#4a4540] border border-white/10 px-3 py-1.5 hover:border-white/30 transition-colors duration-200 cursor-pointer bg-transparent"
          >
            Reject
          </button>
        </form>
      )}
      <form
        action={async () => {
          "use server";
          await deleteConfession(c.id);
        }}
      >
        <button
          type="submit"
          className="font-[family-name:var(--font-geist-mono)] text-[9px] tracking-[0.2em] uppercase text-[#8b1a1a] border border-[#8b1a1a]/30 px-3 py-1.5 hover:border-[#8b1a1a] transition-colors duration-200 cursor-pointer bg-transparent"
        >
          Delete
        </button>
      </form>
    </div>
  );
}
