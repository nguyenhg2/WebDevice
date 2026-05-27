"use client";

import { ArrowRight, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  function submit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push("/chon-game?search=" + encodeURIComponent(value));
  }

  return (
    <form onSubmit={submit} className="flex w-full items-center gap-2">
      <label className="relative min-w-0 flex-1">
        <Search aria-hidden size={compact ? 17 : 19} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <span className="sr-only">Tìm game</span>
        <input
          className={(compact ? "min-h-11" : "min-h-12 text-base") + " input input-leading min-w-0"}
          aria-label="Tìm game"
          placeholder={compact ? "Tìm game..." : "Nhập tên game muốn kiểm tra..."}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </label>
      <button className={compact ? "btn min-h-11 px-3 py-2 text-sm" : "btn min-h-12 px-5"} type="submit">
        <span className={compact ? "sr-only" : ""}>Tìm</span>
        <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
      </button>
    </form>
  );
}
