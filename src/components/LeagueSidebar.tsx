import Link from "next/link";
import { LEAGUES } from "../lib/leagues";

export default function LeagueSidebar() {
  return (
    <aside className="w-60 shrink-0 hidden lg:block border-r border-[var(--border)] bg-[var(--bg-secondary)]">
      <div className="sticky top-[64px] py-6 px-4 h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide">
        <h2 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.15em] px-3 mb-4">
          Competitions
        </h2>
        <ul className="space-y-0.5">
          {LEAGUES.map((league) => (
            <li key={league.code}>
              <Link
                href={`/league/${league.code}`}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-card)] hover:text-white text-sm group slide-right"
              >
                <span className="text-lg group-hover:scale-110 transition-transform">
                  {league.flag}
                </span>
                <span className="font-medium">{league.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
