import Link from "next/link";
import { benchmarks, dataSourceStatuses, externalFpsSamples, gameImages, games, gpus } from "@/lib/data";
import { getGameImageIssues } from "@/lib/game-images";

export default function AdminDataQualityPanel() {
  const benchmarkedGameSlugs = new Set(benchmarks.map((row) => row.gameSlug));
  const benchmarkedGpuSlugs = new Set(benchmarks.map((row) => row.gpuSlug));
  const gamesWithoutBenchmark = games.filter((game) => !benchmarkedGameSlugs.has(game.slug));
  const gpusWithoutBenchmark = gpus.filter((gpu) => !benchmarkedGpuSlugs.has(gpu.slug));
  const gamesWithImageIssues = games.filter((game) => getGameImageIssues(game, gameImages[game.slug] ?? []).length > 0);
  const matchedExternalSamples = externalFpsSamples.filter((sample) => sample.confidence === "matched");
  const partialExternalSamples = externalFpsSamples.filter((sample) => sample.confidence !== "matched");
  const sourceCounts = countBy(benchmarks.map((row) => sourceKey(row.source)));

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Game có benchmark" value={`${benchmarkedGameSlugs.size}/${games.length}`} />
        <Metric label="GPU có benchmark" value={`${benchmarkedGpuSlugs.size}/${gpus.length}`} />
        <Metric label="Mẫu FPS ngoài" value={externalFpsSamples.length.toLocaleString("vi-VN")} />
        <Metric label="Mẫu đã match" value={matchedExternalSamples.length.toLocaleString("vi-VN")} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <div className="card p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-xl font-black">Nguồn dữ liệu ngoài</h3>
              <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">Theo dõi nguồn nào đã import, nguồn nào bị chặn và lý do không bypass.</p>
            </div>
            <Link href="/fps-samples" className="rounded-md border px-3 py-2 text-sm font-bold">
              Xem mẫu FPS
            </Link>
          </div>
          <div className="mt-4 grid gap-3">
            {dataSourceStatuses.map((source) => (
              <article key={source.key} className="rounded-md border border-slate-200 p-3 dark:border-gray-700">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <a href={source.url} target="_blank" rel="nofollow noreferrer" className="font-black hover:text-blue-700 dark:hover:text-blue-300">
                    {source.name}
                  </a>
                  <StatusPill status={source.status} />
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
                  Import: {source.recordsImported.toLocaleString("vi-VN")} · Phát hiện: {(source.recordsDiscovered ?? 0).toLocaleString("vi-VN")}
                </p>
                <ul className="mt-2 grid gap-1 text-xs text-slate-500">
                  {source.notes.slice(0, 3).map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>

        <aside className="card p-4">
          <h3 className="text-xl font-black">Benchmark chính</h3>
          <div className="mt-4 grid gap-3">
            {[...sourceCounts.entries()]
              .sort((a, b) => b[1] - a[1])
              .map(([source, count]) => (
                <div key={source} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3 text-sm dark:border-gray-700">
                  <span className="font-semibold">{source}</span>
                  <span className="font-black">{count.toLocaleString("vi-VN")}</span>
                </div>
              ))}
          </div>
        </aside>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <IssueList title="Game chưa có benchmark" items={gamesWithoutBenchmark.map((game) => [game.name, `/game/${game.slug}`])} />
        <IssueList title="GPU chưa có benchmark" items={gpusWithoutBenchmark.map((gpu) => [gpu.name, `/gpu/${gpu.slug}`])} />
        <IssueList title="Game cần sửa ảnh" items={gamesWithImageIssues.map((game) => [game.name, `/admin`])} />
      </div>

      {partialExternalSamples.length ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
          Có {partialExternalSamples.length.toLocaleString("vi-VN")} mẫu FPS ngoài chưa match đủ game/GPU. Dùng trang mẫu FPS để kiểm tra alias trước khi nhập vào benchmark chính.
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-4 dark:border-gray-700">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function IssueList({ title, items }: { title: string; items: string[][] }) {
  return (
    <section className="card p-4">
      <h3 className="text-lg font-black">{title}</h3>
      <div className="mt-3 max-h-64 overflow-auto divide-y divide-slate-100 dark:divide-gray-800">
        {items.slice(0, 18).map(([label, href]) => (
          <Link key={`${title}-${label}`} href={href} className="block py-2 text-sm font-semibold hover:text-blue-700 dark:hover:text-blue-300">
            {label}
          </Link>
        ))}
        {items.length === 0 ? <p className="py-3 text-sm text-slate-500">Không còn mục cần xử lý.</p> : null}
        {items.length > 18 ? <p className="py-2 text-xs text-slate-500">Còn {items.length - 18} mục khác.</p> : null}
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: string }) {
  const className =
    status === "imported"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
      : status === "partial"
        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200"
        : status === "blocked"
          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
          : "bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-200";
  return <span className={`rounded-md px-2 py-1 text-xs font-black ${className}`}>{status}</span>;
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function sourceKey(source: string) {
  if (/DropReference/i.test(source)) return "DropReference";
  if (/Technical\.city|Notebookcheck/i.test(source)) return "Technical.city";
  if (/PCGameBenchmark/i.test(source)) return "PCGameBenchmark";
  return source.split("(")[0].trim() || "Khác";
}
