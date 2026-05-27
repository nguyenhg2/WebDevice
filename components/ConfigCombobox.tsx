"use client";

import { ChevronDown, Search } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState } from "react";

export type ComboboxOption = {
  value: string;
  label: string;
  meta?: string;
};

export default function ConfigCombobox({
  name,
  label,
  options,
  defaultValue,
  placeholder = "Tìm và chọn...",
}: {
  name: string;
  label: string;
  options: ComboboxOption[];
  defaultValue?: string;
  placeholder?: string;
}) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const selectedDefault = options.find((option) => option.value === defaultValue) ?? options[0];
  const [selectedValue, setSelectedValue] = useState(selectedDefault?.value ?? "");
  const [query, setQuery] = useState(selectedDefault?.label ?? "");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const selectedOption = options.find((option) => option.value === selectedValue) ?? selectedDefault;
  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalize(query);
    const scored = options
      .map((option) => ({ option, score: scoreOption(option, normalizedQuery) }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.option.label.localeCompare(b.option.label, "vi"))
      .slice(0, 30);
    return scored.map((item) => item.option);
  }, [options, query]);

  function choose(option: ComboboxOption) {
    setSelectedValue(option.value);
    setQuery(option.label);
    setOpen(false);
  }

  function keepValidSelection() {
    const exact = options.find((option) => normalize(option.label) === normalize(query));
    if (exact) {
      choose(exact);
      return;
    }
    if (!selectedOption) return;
    setQuery(selectedOption.label);
  }

  return (
    <div ref={rootRef} className="relative grid gap-1 text-sm font-semibold">
      <label htmlFor={id}>{label}</label>
      <input type="hidden" name={name} value={selectedValue} />
      <Search aria-hidden size={16} className="pointer-events-none absolute left-3 top-[42px] -translate-y-1/2 text-slate-400" />
      <input
        id={id}
        className="input input-leading input-trailing"
        value={query}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        onFocus={() => setOpen(true)}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
        }}
        onBlur={keepValidSelection}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
          }
          if (event.key === "Enter" && open && filteredOptions[0]) {
            event.preventDefault();
            choose(filteredOptions[0]);
          }
          if (event.key === "Escape") setOpen(false);
        }}
      />
      <button
        type="button"
        className="absolute right-2 top-[31px] grid h-7 w-7 place-items-center rounded-md text-slate-500 hover:bg-slate-100 dark:text-gray-300 dark:hover:bg-gray-800"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Mở danh sách ${label}`}
      >
        <ChevronDown aria-hidden size={16} strokeWidth={2.5} />
      </button>

      {open ? (
        <div
          id={`${id}-list`}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-xl shadow-slate-900/10 dark:border-gray-700 dark:bg-gray-900"
        >
          {filteredOptions.length ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === selectedValue}
                className={
                  "grid w-full gap-0.5 rounded-md px-3 py-2 text-left hover:bg-teal-50 hover:text-teal-800 dark:hover:bg-gray-800 dark:hover:text-teal-200 " +
                  (option.value === selectedValue ? "bg-teal-50 text-teal-800 dark:bg-teal-950/50 dark:text-teal-200" : "")
                }
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => choose(option)}
              >
                <span className="font-black">{option.label}</span>
                {option.meta ? <span className="text-xs font-semibold text-slate-500 dark:text-gray-400">{option.meta}</span> : null}
              </button>
            ))
          ) : (
            <p className="px-3 py-2 text-sm font-semibold text-slate-500 dark:text-gray-400">Không tìm thấy lựa chọn phù hợp</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

function scoreOption(option: ComboboxOption, normalizedQuery: string) {
  if (!normalizedQuery) return 1;
  const label = normalize(option.label);
  const meta = normalize(option.meta ?? "");
  if (label === normalizedQuery) return 100;
  if (label.startsWith(normalizedQuery)) return 80;
  if (label.includes(normalizedQuery)) return 60;
  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const combined = `${label} ${meta}`;
  const matchedTokens = tokens.filter((token) => combined.includes(token)).length;
  return matchedTokens ? 20 + matchedTokens * 10 : 0;
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
