"use client";

import { useRouter } from "next/navigation";
import { formatDate, addDays, getTodayStr } from "../lib/utils";

export default function DateNav({ currentDate }: { currentDate: string }) {
  const router = useRouter();
  const today = getTodayStr();
  const isToday = currentDate === today;

  const dates = [];
  for (let i = -3; i <= 3; i++) {
    dates.push(addDays(currentDate, i));
  }

  function navigateToDate(date: string) {
    if (date === today) {
      router.push("/");
    } else {
      router.push(`/?date=${date}`);
    }
  }

  return (
    <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
      <button
        onClick={() => navigateToDate(addDays(currentDate, -1))}
        className="p-2 text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card)] rounded-xl transition-all shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {dates.map((date) => {
        const dateIsToday = date === today;
        const isActive = date === currentDate;
        return (
          <button
            key={date}
            onClick={() => navigateToDate(date)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 ${
              isActive
                ? "bg-[var(--accent)] text-white shadow-lg shadow-emerald-400/20 glow"
                : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-white press"
            }`}
          >
            {dateIsToday ? "Today" : formatDate(date)}
          </button>
        );
      })}

      <button
        onClick={() => navigateToDate(addDays(currentDate, 1))}
        className="p-2 text-[var(--text-muted)] hover:text-white hover:bg-[var(--bg-card)] rounded-xl transition-all shrink-0"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {!isToday && (
        <button
          onClick={() => navigateToDate(today)}
          className="ml-2 px-4 py-2 rounded-xl text-xs font-semibold text-[var(--accent)] hover:bg-[var(--accent-muted)] transition-all shrink-0"
        >
          Today
        </button>
      )}
    </div>
  );
}
