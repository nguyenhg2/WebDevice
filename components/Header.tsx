import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import SearchBar from "@/components/SearchBar";

export default function Header() {
  const nav = [
    ["/tra-cuu", "Tra cứu"],
    ["/build-pc", "Build PC"],
    ["/chon-game", "Game"],
    ["/gpu", "GPU"],
    ["/laptop", "Laptop"],
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
      <div className="container flex min-h-16 flex-wrap items-center gap-3 py-3">
        <Link href="/" className="text-xl font-black text-blue-700 dark:text-blue-400">
          Maynaychoiduoc.vn
        </Link>
        <nav className="flex flex-wrap gap-1 text-sm font-semibold">
          {nav.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-md px-2 py-1 hover:bg-blue-50 dark:hover:bg-gray-800">
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex min-w-64 items-center gap-2">
          <SearchBar compact />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
