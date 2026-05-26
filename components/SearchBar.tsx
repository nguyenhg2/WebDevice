"use client";

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
    <form onSubmit={submit} className={compact ? "flex w-full items-center gap-2" : "flex w-full items-center gap-2"}>
      <input
        className="input min-w-0"
        aria-label="Tìm game"
        placeholder={compact ? "Tìm game..." : "Nhập tên game bạn muốn chơi..."}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      <button className={compact ? "btn min-h-10 px-3 py-2 text-sm" : "btn px-5"} type="submit">
        Tìm
      </button>
    </form>
  );
}
