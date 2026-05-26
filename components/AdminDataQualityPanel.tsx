import Link from "next/link";
import { benchmarks, gameImages, games, gpus } from "@/lib/data";
import { getGameImageIssues } from "@/lib/game-images";

export default function AdminDataQualityPanel() {
  const benchmarkedGameSlugs = new Set(benchmarks.map((row) => row.gameSlug));
  const benchmarkedGpuSlugs = new Set(benchmarks.map((row) => row.gpuSlug));
  const benchmarkKeys = new Set(benchmarks.map((row) => `${row.gameSlug}|${row.gpuSlug}|${row.resolution}`));
  const missingMatrix = countMissingMatrix(benchmarkKeys);
  const gamesWithoutBenchmark = games.filter((game) => !benchmarkedGameSlugs.has(game.slug));
  const gpusWithoutBenchmark = gpus.filter((gpu) => !benchmarkedGpuSlugs.has(gpu.slug));
  const gamesWithImageIssues = games.filter((game) => getGameImageIssues(game, gameImages[game.slug] ?? []).length > 0);
  const benchmarksWithVideo = benchmarks.filter((row) => row.videoTestUrl);
  const estimatedRows = benchmarks.filter((row) => row.confidence === "estimated");

  return (
    <section className="grid gap-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Game có FPS" value={`${benchmarkedGameSlugs.size}/${games.length}`} tone="good" />
        <Metric label="GPU có FPS" value={`${benchmarkedGpuSlugs.size}/${gpus.length}`} tone="good" />
        <Metric label="Cặp FPS" value={benchmarks.length.toLocaleString("vi-VN")} tone="info" />
        <Metric label="Thiếu ma trận" value={missingMatrix.toLocaleString("vi-VN")} tone={missingMatrix ? "warn" : "good"} />
        <Metric label="Video đã duyệt" value={benchmarksWithVideo.length.toLocaleString("vi-VN")} tone={benchmarksWithVideo.length ? "good" : "warn"} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="surface p-4">
          <h3 className="text-xl font-black">Trạng thái catalog</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            Dữ liệu đang giữ đúng chính sách: game có ảnh, GPU có FPS, benchmark không lưu URL nguồn web ngoài.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Metric label="Game" value={games.length.toLocaleString("vi-VN")} />
            <Metric label="GPU" value={gpus.length.toLocaleString("vi-VN")} />
            <Metric label="FPS ước tính" value={estimatedRows.length.toLocaleString("vi-VN")} />
          </div>
        </section>

        <aside className="surface p-4">
          <h3 className="text-xl font-black">Việc nên làm tiếp</h3>
          <div className="mt-4 grid gap-2 text-sm">
            <Task href="#admin-images" label={`Sửa ảnh nghi ngờ (${gamesWithImageIssues.length})`} />
            <Task href="#admin-editor" label="Bổ sung video test cho game quan trọng" />
            <Task href="/benchmark" label="Kiểm tra bảng FPS ngoài frontend" />
          </div>
        </aside>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <IssueList title="Game thiếu benchmark" items={gamesWithoutBenchmark.map((game) => [game.name, `/game/${game.slug}`])} empty="Không còn game thiếu FPS." />
        <IssueList title="GPU thiếu benchmark" items={gpusWithoutBenchmark.map((gpu) => [gpu.name, `/gpu/${gpu.slug}`])} empty="Không còn GPU thiếu FPS." />
        <IssueList title="Ảnh cần kiểm tra" items={gamesWithImageIssues.map((game) => [game.name, `#admin-images`])} empty="Không phát hiện ảnh cần xử lý." />
      </div>
    </section>
  );
}

function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "good" | "warn" | "info" }) {
  const tones = {
    neutral: "",
    good: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
    warn: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
    info: "border-sky-200 bg-sky-50 dark:border-sky-900 dark:bg-sky-950/30",
  };
  return (
    <div className={"metric " + tones[tone]}>
      <p className="text-sm text-slate-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function Task({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-md border border-slate-200 px-3 py-2 font-bold hover:border-teal-300 hover:text-teal-700 dark:border-gray-700 dark:hover:text-teal-300">
      {label}
    </Link>
  );
}

function IssueList({ title, items, empty }: { title: string; items: string[][]; empty: string }) {
  return (
    <section className="surface p-4">
      <h3 className="text-lg font-black">{title}</h3>
      <div className="mt-3 max-h-64 overflow-auto divide-y divide-slate-100 dark:divide-gray-800">
        {items.slice(0, 18).map(([label, href]) => (
          <Link key={`${title}-${label}`} href={href} className="block py-2 text-sm font-semibold hover:text-teal-700 dark:hover:text-teal-300">
            {label}
          </Link>
        ))}
        {items.length === 0 ? <p className="py-3 text-sm text-slate-500">{empty}</p> : null}
        {items.length > 18 ? <p className="py-2 text-xs text-slate-500">Còn {items.length - 18} mục khác.</p> : null}
      </div>
    </section>
  );
}

function countMissingMatrix(keys: Set<string>) {
  let missing = 0;
  for (const game of games) {
    for (const gpu of gpus) {
      if (!keys.has(`${game.slug}|${gpu.slug}|1080p`)) missing += 1;
    }
  }
  return missing;
}
