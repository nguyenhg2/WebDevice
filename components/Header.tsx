import { BarChart3, Cpu, Gamepad2, Laptop, MonitorCheck, Search, Wrench } from "lucide-react";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";

const nav = [
  ["/tra-cuu", "Tra cứu", MonitorCheck],
  ["/chon-game", "Game", Gamepad2],
  ["/benchmark", "FPS", BarChart3],
  ["/build-pc", "Build PC", Wrench],
  ["/laptop", "Laptop", Laptop],
  ["/gpu", "GPU", Cpu],
] as const;

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/88">
      <div className="container flex min-h-16 items-center gap-3 py-3">
        <Link href="/" className="flex min-w-fit items-center gap-2.5 font-black text-slate-950 dark:text-white" aria-label="Trang chủ Fpsviet.com">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-slate-950 text-[13px] font-black text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950">
            FPS
          </span>
          <span className="hidden leading-tight sm:grid">
            <span>Fpsviet.com</span>
            <span className="text-[11px] font-extrabold text-slate-500 dark:text-gray-400">Game, GPU, FPS</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 text-sm font-bold xl:flex">
          {nav.map(([href, label, Icon]) => (
            <Link
              key={href}
              href={href}
              className="inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-lg px-3 text-slate-700 hover:bg-teal-50 hover:text-teal-800 dark:text-gray-200 dark:hover:bg-gray-900 dark:hover:text-teal-300"
            >
              <Icon aria-hidden size={16} strokeWidth={2.3} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="hidden w-[320px] lg:block">
            <SearchBar compact />
          </div>
          <Link href="/tra-cuu" className="btn hidden sm:inline-flex">
            <MonitorCheck aria-hidden size={18} strokeWidth={2.5} />
            Kiểm tra máy
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <nav className="container flex gap-2 overflow-x-auto pb-3 text-sm font-bold xl:hidden">
        <Link href="/chon-game" className="inline-flex min-w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
          <Search aria-hidden size={15} />
          Tìm game
        </Link>
        {nav.map(([href, label, Icon]) => (
          <Link key={href} href={href} className="inline-flex min-w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-700 shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
            <Icon aria-hidden size={15} />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
