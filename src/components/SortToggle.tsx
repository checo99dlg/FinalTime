"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function SortToggle() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "league";
  const date = searchParams.get("date");

  function toggle(sort: string) {
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (sort !== "league") params.set("sort", sort);
    const qs = params.toString();
    router.push(qs ? `/?${qs}` : "/");
  }

  return (
    <div className="flex items-center bg-[var(--bg-card)] rounded-xl p-1 border border-[var(--border)]">
      <button
        onClick={() => toggle("league")}
        className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
          currentSort === "league"
            ? "bg-[var(--accent)] text-white shadow-md shadow-emerald-400/20 glow"
            : "text-[var(--text-muted)] hover:text-white press"
        }`}
      >
        By League
      </button>
      <button
        onClick={() => toggle("time")}
        className={`px-4 py-1.5 rounded-lg text-xs font-semibold ${
          currentSort === "time"
            ? "bg-[var(--accent)] text-white shadow-md shadow-emerald-400/20 glow"
            : "text-[var(--text-muted)] hover:text-white press"
        }`}
      >
        By Time
      </button>
    </div>
  );
}
