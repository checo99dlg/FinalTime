"use client";

import { useRouter } from "next/navigation";

export default function MatchdaySelector({
  code,
  currentMatchday,
  totalMatchdays,
  selectedMatchday,
}: {
  code: string;
  currentMatchday: number;
  totalMatchdays: number;
  selectedMatchday: number;
}) {
  const router = useRouter();

  function onChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const md = e.target.value;
    router.push(`/league/${code}?matchday=${md}`);
  }

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => {
          if (selectedMatchday > 1) {
            router.push(`/league/${code}?matchday=${selectedMatchday - 1}`);
          }
        }}
        disabled={selectedMatchday <= 1}
        className="p-2 text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card)] rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <select
        value={selectedMatchday}
        onChange={onChange}
        className="bg-[var(--bg-card)] text-[var(--text-secondary)] text-sm rounded-xl border border-[var(--border)] px-4 py-2 focus:outline-none focus:border-[var(--accent)] cursor-pointer"
      >
        {Array.from({ length: totalMatchdays }, (_, i) => i + 1).map((md) => (
          <option key={md} value={md}>
            Matchday {md}
            {md === currentMatchday ? " (Current)" : ""}
          </option>
        ))}
      </select>

      <button
        onClick={() => {
          if (selectedMatchday < totalMatchdays) {
            router.push(`/league/${code}?matchday=${selectedMatchday + 1}`);
          }
        }}
        disabled={selectedMatchday >= totalMatchdays}
        className="p-2 text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card)] rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
