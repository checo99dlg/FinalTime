import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-[var(--bg-secondary)] border-b border-[var(--border)] sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
      <div className="w-full px-4 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[var(--accent)] rounded-xl flex items-center justify-center shadow-lg shadow-emerald-400/20 glow">
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 3.3l1.35-.95c1.82.56 3.37 1.76 4.38 3.34l-.39 1.34-1.35.46L13 6.7V5.3zm-3.35-.95L11 5.3v1.4L7.01 9.49l-1.35-.46-.39-1.34c1.01-1.58 2.56-2.78 4.38-3.34zM7.08 17.11l-1.14.1C4.73 15.81 4 13.99 4 12c0-.12.01-.23.02-.35l1-.73 1.38.48 2.24 6.04-.56.67zm10.97.1l-1.14-.1-.56-.67 2.24-6.04 1.38-.48 1 .73c.01.12.02.23.02.35 0 1.99-.73 3.81-1.94 5.21zM15.97 19l-.93-.45-.48-1.36 1.07-2.88h2.1l.7 1.07L15.97 19zm-7.94 0l-2.46-3.62.7-1.07h2.1l1.07 2.88-.48 1.36L8.03 19z" />
            </svg>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">
            FinalTime
          </span>
        </Link>
      </div>
    </nav>
  );
}
