"use client";

import { useMemo, useState } from "react";
import { buildVideoSearchUrl, getBenchmarkVideoUrl, type BenchmarkTableRow } from "@/lib/benchmark-links";
import { games, gpus } from "@/lib/data";

type SortKey = "game" | "gpu" | "fps" | "recommendedSetting";
type SortDirection = "asc" | "desc";
type SettingFilter = "all" | "Low" | "Medium" | "High" | "Ultra";

const settingRank: Record<string, number> = { Low: 1, Medium: 2, High: 3, Ultra: 4 };

export default function BenchmarkTable({ rows, highlightGpu }: { rows: BenchmarkTableRow[]; highlightGpu?: string }) {
  const [sortKey, setSortKey] = useState<SortKey>("fps");
  const [direction, setDirection] = useState<SortDirection>("desc");
  const [query, setQuery] = useState("");
  const [settingFilter, setSettingFilter] = useState<SettingFilter>("all");

  const visibleRows = useMemo(() => {
    const normalizedQuery = normalize(query);
    return rows
      .filter((row) => settingFilter === "all" || row.recommendedSetting === settingFilter)
      .filter((row) => {
        if (!normalizedQuery) return true;
        const game = nameForGame(row.gameSlug);
        const gpu = nameForGpu(row.gpuSlug);
        return normalize(`${game} ${gpu} ${row.resolution} ${row.recommendedSetting}`).includes(normalizedQuery);
      })
      .sort((a, b) => compareRows(a, b, sortKey, direction));
  }, [direction, query, rows, settingFilter, sortKey]);

  const summary = useMemo(() => {
    const fpsValues = visibleRows.map(bestFps).filter((fps) => fps > 0);
    const avgFps = fpsValues.length ? Math.round(fpsValues.reduce((sum, fps) => sum + fps, 0) / fpsValues.length) : 0;
    const smooth = fpsValues.filter((fps) => fps >= 55).length;
    return { total: visibleRows.length, avgFps, smooth };
  }, [visibleRows]);

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
      <div className="grid gap-4 border-b border-slate-200 bg-slate-50 p-4 dark:border-gray-800 dark:bg-gray-900/80 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="grid gap-3 sm:grid-cols-3">
          <SummaryTile label="Dòng FPS" value={summary.total.toLocaleString("vi-VN")} />
          <SummaryTile label="FPS trung bình" value={summary.avgFps ? `${summary.avgFps}` : "-"} />
          <SummaryTile label="Mượt" value={summary.smooth.toLocaleString("vi-VN")} />
        </div>
        <div className="grid gap-2 sm:grid-cols-[260px_160px]">
          <input
            className="input bg-white dark:bg-gray-950"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tìm game hoặc GPU..."
            aria-label="Tìm trong bảng FPS"
          />
          <select className="input bg-white dark:bg-gray-950" value={settingFilter} onChange={(event) => setSettingFilter(event.target.value as SettingFilter)} aria-label="Lọc setting">
            <option value="all">Tất cả setting</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Ultra">Ultra</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1080px] border-collapse text-sm">
          <thead className="bg-slate-50 text-slate-600 dark:bg-gray-800 dark:text-gray-300">
            <tr className="border-b border-slate-200 dark:border-gray-700">
              <SortableTh label="Game / GPU" active={sortKey === "game"} direction={direction} onClick={() => sortBy("game")} />
              <SortableTh label="FPS" active={sortKey === "fps"} direction={direction} onClick={() => sortBy("fps")} align="right" />
              <SortableTh label="Setting" active={sortKey === "recommendedSetting"} direction={direction} onClick={() => sortBy("recommendedSetting")} align="center" />
              <th className="p-3 text-left font-black">Chi tiết FPS</th>
              <th className="p-3 text-left font-black">Độ phân giải</th>
              <th className="p-3 text-left font-black">Video</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => {
              const gpu = gpus.find((item) => item.slug === row.gpuSlug);
              const game = games.find((item) => item.slug === row.gameSlug);
              const videoUrl = getBenchmarkVideoUrl(row);
              const videoSearchUrl = buildVideoSearchUrl({ gameName: game?.name ?? row.gameSlug, gpuName: gpu?.name ?? row.gpuSlug });
              const fps = bestFps(row);

              return (
                <tr
                  key={`${row.gameSlug}-${row.gpuSlug}-${row.resolution}-${index}`}
                  className={
                    "border-b border-slate-100 last:border-0 hover:bg-slate-50 dark:border-gray-800 dark:hover:bg-gray-800/60 " +
                    (highlightGpu === row.gpuSlug ? "bg-teal-50/80 dark:bg-teal-950/35" : "bg-white dark:bg-gray-900")
                  }
                >
                  <td className="w-[360px] p-3">
                    <div className="min-w-0 max-w-[330px]">
                      <p className="font-black">{game?.name ?? row.gameSlug}</p>
                      <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-gray-400">{gpu?.name ?? row.gpuSlug}</p>
                    </div>
                  </td>
                  <td className="w-[180px] p-3 text-right">
                    <div className="ml-auto grid max-w-[160px] gap-1">
                      <div className="flex items-center justify-end gap-2">
                        <FpsStatus fps={fps} />
                        <span className="text-xl font-black tabular-nums">{fps > 0 ? fps : "-"}</span>
                      </div>
                      <FpsMeter fps={fps} />
                    </div>
                  </td>
                  <td className="p-3 text-center">
                    <SettingPill setting={row.recommendedSetting} />
                  </td>
                  <td className="w-[260px] p-3">
                    <div className="grid grid-cols-4 gap-1 text-[11px] font-bold">
                      <FpsChip label="Low" value={row.fpsLow} />
                      <FpsChip label="Med" value={row.fpsMedium} />
                      <FpsChip label="High" value={row.fpsHigh} />
                      <FpsChip label="Ultra" value={row.fpsUltra} />
                    </div>
                  </td>
                  <td className="w-[120px] p-3 font-bold text-slate-700 dark:text-gray-300">{row.resolution}</td>
                  <td className="w-[110px] p-3">
                    <a
                      className="inline-flex rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-black text-teal-700 hover:border-teal-300 hover:bg-teal-50 dark:border-gray-700 dark:text-teal-300 dark:hover:bg-gray-800"
                      href={videoUrl ?? videoSearchUrl}
                      target="_blank"
                      rel="nofollow noreferrer"
                    >
                      {videoUrl ? "Video" : "Tìm video"}
                    </a>
                  </td>
                </tr>
              );
            })}
            {!visibleRows.length ? (
              <tr>
                <td colSpan={6} className="p-8 text-center font-semibold text-slate-500 dark:text-gray-400">
                  Không có dòng FPS phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : null}
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
  align?: "left" | "center" | "right";
}) {
  const arrow = active ? (direction === "asc" ? "↑" : "↓") : "";
  const alignClass = align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  return (
    <th className={"p-0 font-black " + alignClass}>
      <button
        type="button"
        onClick={onClick}
        className={"w-full px-3 py-3 font-black hover:bg-slate-100 dark:hover:bg-gray-700 " + alignClass}
        aria-sort={active ? (direction === "asc" ? "ascending" : "descending") : "none"}
      >
        {label} {arrow}
      </button>
    </th>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-950">
      <p className="text-xs font-black uppercase text-slate-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
    </div>
  );
}

function FpsStatus({ fps }: { fps: number }) {
  const label = fps >= 55 ? "Mượt" : fps >= 30 ? "Được" : "Yếu";
  const className =
    fps >= 55
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
      : fps >= 30
        ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100"
        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-100";
  return <span className={"rounded-full px-2 py-0.5 text-[11px] font-black " + className}>{label}</span>;
}

function FpsMeter({ fps }: { fps: number }) {
  const width = Math.min(100, Math.max(4, Math.round((fps / 160) * 100)));
  const tone = fps >= 75 ? "bg-emerald-500" : fps >= 45 ? "bg-teal-500" : fps >= 30 ? "bg-amber-500" : "bg-rose-500";
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
      <div className={"h-full rounded-full " + tone} style={{ width: `${width}%` }} />
    </div>
  );
}

function SettingPill({ setting }: { setting: string }) {
  const className =
    setting === "Ultra"
      ? "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950 dark:text-violet-100"
      : setting === "High"
        ? "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100"
        : setting === "Medium"
          ? "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950 dark:text-teal-100"
          : "border-slate-200 bg-slate-50 text-slate-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100";
  return <span className={"inline-flex rounded-full border px-2.5 py-1 text-xs font-black " + className}>{setting}</span>;
}

function FpsChip({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-center dark:border-gray-700 dark:bg-gray-800">
      <p className="text-[10px] uppercase text-slate-500 dark:text-gray-400">{label}</p>
      <p className="mt-0.5 tabular-nums text-slate-900 dark:text-gray-100">{value > 0 ? value : "-"}</p>
    </div>
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

function normalize(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
