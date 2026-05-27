"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const value = localStorage.getItem("theme") === "dark";
    setDark(value);
    document.documentElement.classList.toggle("dark", value);
  }, []);

  return (
    <button
      className="grid h-11 w-11 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-teal-300 hover:text-teal-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-teal-500 dark:hover:text-teal-300"
      aria-label="Đổi giao diện sáng tối"
      title="Đổi giao diện"
      onClick={() => {
        const next = !dark;
        setDark(next);
        localStorage.setItem("theme", next ? "dark" : "light");
        document.documentElement.classList.toggle("dark", next);
      }}
    >
      {dark ? <Sun aria-hidden size={18} strokeWidth={2.4} /> : <Moon aria-hidden size={18} strokeWidth={2.4} />}
    </button>
  );
}
