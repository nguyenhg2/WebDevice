import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import ThemeToggle from "@/components/ThemeToggle";

const nav = [
  ["/tra-cuu", "Tra cứu"],
  ["/chon-game", "Game"],
  ["/benchmark", "FPS"],
  ["/build-pc", "Build PC"],
  ["/laptop", "Laptop"],
  ["/gpu", "GPU"],
] as const;

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/92 backdrop-blur-xl dark:border-gray-800 dark:bg-gray-950/90">
      <div className="container flex min-h-16 items-center gap-3 py-3">
        <Link href="/" className="flex min-w-fit items-center gap-2 font-black text-slate-950 dark:text-white" aria-label="Trang chủ Fpsviet.com">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-slate-950 text-sm text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-950">F</span>
          <span className="hidden sm:inline">Fpsviet.com</span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 text-sm font-bold dark:border-gray-800 dark:bg-gray-900 xl:flex">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-md px-3 py-1.5 text-slate-700 hover:bg-white hover:text-teal-700 dark:text-gray-200 dark:hover:bg-gray-800 dark:hover:text-teal-300">
              {label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 items-center gap-2">
          <div className="hidden w-[340px] lg:block">
            <SearchBar compact />
          </div>
          <Link href="/tra-cuu" className="btn hidden sm:inline-flex">
            Kiểm tra máy
          </Link>
          <ThemeToggle />
        </div>
      </div>

      <nav className="container flex gap-2 overflow-x-auto pb-3 text-sm font-bold xl:hidden">
        {nav.map(([href, label]) => (
          <Link key={href} href={href} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200">
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
