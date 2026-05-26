"use client";

import { useMemo, useState } from "react";
import { buildVideoSearchUrl, getBenchmarkVideoUrl, type BenchmarkTableRow } from "@/lib/benchmark-links";
import { games, gpus } from "@/lib/data";

type SortKey = "game" | "gpu" | "fps" | "recommendedSetting";
type SortDirection = "asc" | "desc";

const settingRank: Record<string, number> = { Low: 1, Medium: 2, High: 3, Ultra: 4 };

export default function BenchmarkTable({ rows, highlightGpu }: { rows: BenchmarkTableRow[]; highlightGpu?: string }) {
  const [sortKey, setSortKey] = useState<SortKey>("fps");
  const [direction, setDirection] = useState<SortDirection>("desc");

  const sortedRows = useMemo(() => [...rows].sort((a, b) => compareRows(a, b, sortKey, direction)), [rows, sortKey, direction]);

  function sortBy(key: SortKey) {
    if (sortKey === key) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection(key === "fps" ? "desc" : "asc");
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-gray-800 dark:text-gray-300">
            <tr className="border-b border-slate-200 dark:border-gray-700">
              <SortableTh label="Game" active={sortKey === "game"} direction={direction} onClick={() => sortBy("game")} />
              <SortableTh label="GPU" active={sortKey === "gpu"} direction={direction} onClick={() => sortBy("gpu")} />
              <th className="p-3 text-left font-black">Độ phân giải</th>
              <SortableTh label="FPS" active={sortKey === "fps"} direction={direction} onClick={() => sortBy("fps")} align="right" />
              <SortableTh label="Setting" active={sortKey === "recommendedSetting"} direction={direction} onClick={() => sortBy("recommendedSetting")} />
              <th className="p-3 text-left font-black">Video</th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row, index) => {
              const gpu = gpus.find((item) => item.slug === row.gpuSlug);
              const game = games.find((item) => item.slug === row.gameSlug);
              const videoUrl = getBenchmarkVideoUrl(row);
              const videoSearchUrl = buildVideoSearchUrl({ gameName: game?.name ?? row.gameSlug, gpuName: gpu?.name ?? row.gpuSlug });
              const fps = bestFps(row);

              return (
                <tr
                  key={`${row.gameSlug}-${row.gpuSlug}-${row.resolution}-${index}`}
                  className={
                    "border-b border-slate-100 last:border-0 dark:border-gray-800 " +
                    (highlightGpu === row.gpuSlug ? "bg-teal-50 dark:bg-teal-950/40" : "bg-white dark:bg-gray-900")
                  }
                >
                  <td className="p-3 font-bold">{game?.name ?? row.gameSlug}</td>
                  <td className="p-3 text-slate-700 dark:text-gray-300">{gpu?.name ?? row.gpuSlug}</td>
                  <td className="p-3">{row.resolution}</td>
                  <td className="p-3 text-right text-base font-black tabular-nums">{fps > 0 ? fps : "-"}</td>
                  <td className="p-3">{row.recommendedSetting}</td>
                  <td className="p-3">
                    <a
                      className="font-bold text-teal-700 hover:text-teal-900 dark:text-teal-300 dark:hover:text-teal-100"
                      href={videoUrl ?? videoSearchUrl}
                      target="_blank"
                      rel="nofollow noreferrer"
                    >
                      {videoUrl ? "Mở video" : "Tìm video"}
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortableTh({
  label,
  active,
  direction,
  onClick,
  align = "left",
}: {
  label: string;
  active: boolean;
  direction: SortDirection;
  onClick: () => void;
  align?: "left" | "right";
}) {
  const arrow = active ? (direction === "asc" ? "↑" : "↓") : "";
  return (
    <th className={"p-0 font-black " + (align === "right" ? "text-right" : "text-left")}>
      <button
        type="button"
        onClick={onClick}
        className={"w-full px-3 py-3 font-black hover:bg-slate-100 dark:hover:bg-gray-700 " + (align === "right" ? "text-right" : "text-left")}
        aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
      >
        {label} {arrow}
      </button>
    </th>
  );
}

function compareRows(a: BenchmarkTableRow, b: BenchmarkTableRow, key: SortKey, direction: SortDirection) {
  const multiplier = direction === "asc" ? 1 : -1;
  let result = 0;

  if (key === "game") {
    result = nameForGame(a.gameSlug).localeCompare(nameForGame(b.gameSlug), "vi");
  } else if (key === "gpu") {
    result = nameForGpu(a.gpuSlug).localeCompare(nameForGpu(b.gpuSlug), "vi");
  } else if (key === "recommendedSetting") {
    result = (settingRank[a.recommendedSetting] ?? 0) - (settingRank[b.recommendedSetting] ?? 0);
  } else {
    result = bestFps(a) - bestFps(b);
  }

  return result * multiplier;
}

function nameForGame(slug: string) {
  return games.find((item) => item.slug === slug)?.name ?? slug;
}

function nameForGpu(slug: string) {
  return gpus.find((item) => item.slug === slug)?.name ?? slug;
}

function bestFps(row: BenchmarkTableRow) {
  return row.avgFps || row.fpsUltra || row.fpsHigh || row.fpsMedium || row.fpsLow;
}
