"use client";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SearchBar({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  function submit(event: FormEvent) {
    event.preventDefault();
    const value = query.trim();
    if (value) router.push("/tra-cuu?search=" + encodeURIComponent(value));
  }
  return <form onSubmit={submit} className={compact ? "hidden md:block" : "w-full"}><input className="input" aria-label="Tìm kiếm game, GPU, CPU, laptop" placeholder="Tìm game, GPU, CPU..." value={query} onChange={(event) => setQuery(event.target.value)} /></form>;
}
