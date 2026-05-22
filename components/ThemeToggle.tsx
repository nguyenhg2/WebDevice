"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const value = localStorage.getItem("theme") === "dark";
    setDark(value);
    document.documentElement.classList.toggle("dark", value);
  }, []);

  return <button className="btn bg-slate-700" aria-label="Đổi giao diện sáng tối" onClick={() => { const next = !dark; setDark(next); localStorage.setItem("theme", next ? "dark" : "light"); document.documentElement.classList.toggle("dark", next); }}>{dark ? "Sáng" : "Tối"}</button>;
}
