"use client";

import { useMemo, useState } from "react";
import { gpus } from "@/lib/data";
import type { Benchmark } from "@/types";

const resolutionRank: Record<string, number> = { "720p": 1, "1080p": 2, "1440p": 3, "4k": 4 };
const settingRank: Record<string, number> = { Low: 1, Medium: 2, High: 3, Ultra: 4 };

type SortKey = "gpu" | "resolution" | "fpsLow" | "fpsMedium" | "fpsHigh" | "fpsUltra" | "recommendedSetting";
type SortDirection = "asc" | "desc";

export default function BenchmarkTable({ rows, highlightGpu }: { rows: Benchmark[]; highlightGpu?: string }) {
  const [sortKey, setSortKey] = useState<SortKey>("fpsHigh");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => compareRows(a, b, sortKey, direction));
  }, [rows, sortKey, direction]);

  function sortBy(key: SortKey) {
    if (sortKey === key) {
      setDirection((current) => current === "asc" ? "desc" : "asc");
      return;
    }
    setSortKey(key);
    setDirection(key.startsWith("fps") ? "desc" : "asc");
  }

  return <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-gray-700"><table className="w-full min-w-[820px] table-fixed border-collapse text-sm"><colgroup><col className="w-[260px]" /><col className="w-[120px]" /><col className="w-[82px]" /><col className="w-[82px]" /><col className="w-[82px]" /><col className="w-[82px]" /><col className="w-[130px]" /><col className="w-[80px]" /></colgroup><thead className="bg-slate-50 dark:bg-gray-800"><tr className="border-b border-slate-200 dark:border-gray-700"><SortableTh label="GPU" active={sortKey === "gpu"} direction={direction} onClick={() => sortBy("gpu")} align="left" /><SortableTh label="Độ phân giải" active={sortKey === "resolution"} direction={direction} onClick={() => sortBy("resolution")} align="left" /><SortableTh label="Low" active={sortKey === "fpsLow"} direction={direction} onClick={() => sortBy("fpsLow")} align="right" /><SortableTh label="Medium" active={sortKey === "fpsMedium"} direction={direction} onClick={() => sortBy("fpsMedium")} align="right" /><SortableTh label="High" active={sortKey === "fpsHigh"} direction={direction} onClick={() => sortBy("fpsHigh")} align="right" /><SortableTh label="Ultra" active={sortKey === "fpsUltra"} direction={direction} onClick={() => sortBy("fpsUltra")} align="right" /><SortableTh label="Setting" active={sortKey === "recommendedSetting"} direction={direction} onClick={() => sortBy("recommendedSetting")} align="left" /><th className="p-3 text-center font-black">Video</th></tr></thead><tbody>{sortedRows.map((row, index) => { const gpu = gpus.find((item) => item.slug === row.gpuSlug); return <tr key={`${row.gameSlug}-${row.gpuSlug}-${row.resolution}-${index}`} className={"border-b border-slate-100 last:border-0 dark:border-gray-800 " + (highlightGpu === row.gpuSlug ? "bg-blue-50 dark:bg-blue-950" : "bg-white dark:bg-gray-900")}><td className="p-3 font-semibold">{gpu?.name ?? row.gpuSlug}</td><td className="p-3">{row.resolution}</td><td className="p-3 text-right tabular-nums">{row.fpsLow}</td><td className="p-3 text-right tabular-nums">{row.fpsMedium}</td><td className="p-3 text-right tabular-nums">{row.fpsHigh}</td><td className="p-3 text-right tabular-nums">{row.fpsUltra}</td><td className="p-3">{row.recommendedSetting}</td><td className="p-3 text-center"><a className="font-semibold text-blue-600" href={row.videoTestUrl ?? "#"} target="_blank" rel="nofollow">Xem</a></td></tr>; })}</tbody></table></div>;
}

function SortableTh({ label, active, direction, onClick, align }: { label: string; active: boolean; direction: SortDirection; onClick: () => void; align: "left" | "right" }) {
  const arrow = active ? direction === "asc" ? " ↑" : " ↓" : "";
  return <th className={"p-0 font-black " + (align === "right" ? "text-right" : "text-left")}><button type="button" onClick={onClick} className={"w-full px-3 py-3 font-black hover:bg-slate-100 dark:hover:bg-gray-700 " + (align === "right" ? "text-right" : "text-left")} aria-sort={active ? direction === "asc" ? "ascending" : "descending" : "none"}>{label}{arrow}</button></th>;
}

function compareRows(a: Benchmark, b: Benchmark, key: SortKey, direction: SortDirection) {
  const multiplier = direction === "asc" ? 1 : -1;
  let result = 0;

  if (key === "gpu") {
    const gpuA = gpus.find((item) => item.slug === a.gpuSlug)?.name ?? a.gpuSlug;
    const gpuB = gpus.find((item) => item.slug === b.gpuSlug)?.name ?? b.gpuSlug;
    result = gpuA.localeCompare(gpuB, "vi");
  } else if (key === "resolution") {
    result = (resolutionRank[a.resolution] ?? 0) - (resolutionRank[b.resolution] ?? 0);
  } else if (key === "recommendedSetting") {
    result = (settingRank[a.recommendedSetting] ?? 0) - (settingRank[b.recommendedSetting] ?? 0);
  } else {
    result = a[key] - b[key];
  }

  return result * multiplier;
}
