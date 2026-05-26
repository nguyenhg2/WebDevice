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
    <form onSubmit={submit} className={compact ? "w-full" : "w-full"}>
      <input
        className="input"
        aria-label="Tìm game"
        placeholder={compact ? "Tìm game..." : "Nhập tên game bạn muốn chơi..."}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </form>
  );
}
