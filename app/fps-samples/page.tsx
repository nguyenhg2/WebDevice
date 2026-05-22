import Link from "next/link";
import type { Metadata } from "next";
import { dataSourceStatuses, externalFpsSamples, games, gpus } from "@/lib/data";

export const metadata: Metadata = {
  title: "Mẫu FPS từ nguồn ngoài",
  description: "Duyệt mẫu FPS cào từ các nguồn công khai trước khi đưa vào benchmark chính.",
};

type FpsSamplesParams = {
  game?: string;
  gpu?: string;
  source?: string;
  confidence?: string;
};

export default async function FpsSamplesPage({ searchParams }: { searchParams: Promise<FpsSamplesParams> }) {
  const params = await searchParams;
  const filteredSamples = externalFpsSamples
    .filter((sample) => !params.game || sample.gameSlug === params.game)
    .filter((sample) => !params.gpu || sample.gpuSlug === params.gpu)
    .filter((sample) => !params.source || sample.source === params.source)
    .filter((sample) => !params.confidence || sample.confidence === params.confidence)
    .sort((a, b) => {
      const confidenceDelta = confidenceRank(a.confidence) - confidenceRank(b.confidence);
      if (confidenceDelta) return confidenceDelta;
      return b.normalizedFps - a.normalizedFps;
    });
  const visibleSamples = filteredSamples.slice(0, 160);
  const matchedCount = externalFpsSamples.filter((sample) => sample.confidence === "matched").length;
  const gameOptions = games
    .filter((game) => externalFpsSamples.some((sample) => sample.gameSlug === game.slug))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  const gpuOptions = gpus
    .filter((gpu) => externalFpsSamples.some((sample) => sample.gpuSlug === gpu.slug))
    .sort((a, b) => a.name.localeCompare(b.name, "vi"));
  const sourceOptions = Array.from(new Set(externalFpsSamples.map((sample) => sample.source)));

  return (
    <section>
      <header className="bg-slate-950 text-white">
        <div className="container py-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">External FPS Samples</p>
          <h1 className="mt-3 text-4xl font-black">Mẫu FPS từ nguồn ngoài</h1>
          <p className="mt-4 max-w-3xl text-slate-200">
            Đây là lớp dữ liệu tham khảo lấy từ các trang FPS calculator công khai. Các mẫu đã match game/GPU có thể dùng để kiểm chứng, nhưng không tự động ghi đè benchmark chuẩn.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-4">
            <Stat label="Tổng mẫu" value={externalFpsSamples.length.toLocaleString("vi-VN")} />
            <Stat label="Đã match" value={matchedCount.toLocaleString("vi-VN")} />
            <Stat label="Nguồn" value={sourceOptions.length.toLocaleString("vi-VN")} />
            <Stat label="Đang hiển thị" value={filteredSamples.length.toLocaleString("vi-VN")} />
          </div>
        </div>
      </header>

      <div className="container grid gap-6 py-8 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <form className="card grid gap-3 p-4">
            <h2 className="text-xl font-black">Bộ lọc</h2>
            <label className="grid gap-1 text-sm font-semibold">
              Game
              <select name="game" className="input" defaultValue={params.game ?? ""}>
                <option value="">Tất cả game</option>
                {gameOptions.map((game) => (
                  <option key={game.slug} value={game.slug}>
                    {game.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              GPU
              <select name="gpu" className="input" defaultValue={params.gpu ?? ""}>
                <option value="">Tất cả GPU</option>
                {gpuOptions.map((gpu) => (
                  <option key={gpu.slug} value={gpu.slug}>
                    {gpu.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Nguồn
              <select name="source" className="input" defaultValue={params.source ?? ""}>
                <option value="">Tất cả nguồn</option>
                {sourceOptions.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Match
              <select name="confidence" className="input" defaultValue={params.confidence ?? ""}>
                <option value="">Tất cả</option>
                <option value="matched">Đã match game/GPU</option>
                <option value="partial">Match một phần</option>
                <option value="raw">Raw</option>
              </select>
            </label>
            <button className="btn">Lọc mẫu</button>
            <Link href="/fps-samples" className="rounded-md border px-3 py-2 text-center text-sm font-bold">
              Xóa lọc
            </Link>
          </form>

          <section className="card p-4">
            <h2 className="text-xl font-black">Tình trạng nguồn</h2>
            <div className="mt-3 grid gap-2">
              {dataSourceStatuses.map((source) => (
                <a key={source.key} href={source.url} target="_blank" rel="nofollow noreferrer" className="rounded-md border border-slate-200 p-3 text-sm dark:border-gray-700">
                  <span className="font-black">{source.name}</span>
                  <span className="mt-1 block text-xs text-slate-500">
                    {source.status} · {source.recordsImported.toLocaleString("vi-VN")} mẫu
                  </span>
                </a>
              ))}
            </div>
          </section>
        </aside>

        <main>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">Bảng mẫu FPS</h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">Hiển thị tối đa 160 dòng để trang tải nhanh. Dùng bộ lọc để thu hẹp.</p>
            </div>
            <Link href="/benchmark" className="font-bold text-blue-700 dark:text-blue-300">
              Benchmark chính
            </Link>
          </div>
          <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-gray-700">
            <table className="w-full min-w-[980px] table-fixed border-collapse text-sm">
              <colgroup>
                <col className="w-[180px]" />
                <col className="w-[210px]" />
                <col className="w-[220px]" />
                <col className="w-[80px]" />
                <col className="w-[82px]" />
                <col className="w-[82px]" />
                <col className="w-[82px]" />
                <col className="w-[110px]" />
                <col />
              </colgroup>
              <thead className="bg-slate-50 dark:bg-gray-800">
                <tr className="border-b border-slate-200 text-left dark:border-gray-700">
                  <th className="p-3">Game</th>
                  <th className="p-3">CPU</th>
                  <th className="p-3">GPU</th>
                  <th className="p-3 text-right">RAM</th>
                  <th className="p-3 text-right">Low</th>
                  <th className="p-3 text-right">Mid</th>
                  <th className="p-3 text-right">High</th>
                  <th className="p-3">Match</th>
                  <th className="p-3">Nguồn</th>
                </tr>
              </thead>
              <tbody>
                {visibleSamples.map((sample) => (
                  <tr key={sample.id} className="border-b border-slate-100 bg-white last:border-0 dark:border-gray-800 dark:bg-gray-900">
                    <td className="p-3 font-semibold">
                      {sample.gameSlug ? (
                        <Link href={`/game/${sample.gameSlug}`} className="hover:text-blue-700 dark:hover:text-blue-300">
                          {sample.gameName}
                        </Link>
                      ) : (
                        sample.gameName
                      )}
                    </td>
                    <td className="p-3">{sample.cpuName}</td>
                    <td className="p-3">
                      {sample.gpuSlug ? (
                        <Link href={`/gpu/${sample.gpuSlug}`} className="hover:text-blue-700 dark:hover:text-blue-300">
                          {sample.gpuName}
                        </Link>
                      ) : (
                        sample.gpuName
                      )}
                    </td>
                    <td className="p-3 text-right tabular-nums">{sample.ramGb ? `${sample.ramGb}GB` : "-"}</td>
                    <td className="p-3 text-right tabular-nums">{sample.fpsLow}</td>
                    <td className="p-3 text-right font-black tabular-nums">{sample.fpsAverage}</td>
                    <td className="p-3 text-right tabular-nums">{sample.fpsHigh}</td>
                    <td className="p-3">
                      <ConfidencePill value={sample.confidence} />
                    </td>
                    <td className="p-3">
                      <a href={sample.sourceUrl} target="_blank" rel="nofollow noreferrer" className="font-semibold text-blue-700 dark:text-blue-300">
                        {sample.sourceName}
                      </a>
                    </td>
                  </tr>
                ))}
                {visibleSamples.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-6 text-center text-slate-500">
                      Không có mẫu phù hợp bộ lọc.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-3">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function ConfidencePill({ value }: { value: string }) {
  const className =
    value === "matched"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
      : value === "partial"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
        : "bg-slate-100 text-slate-700 dark:bg-gray-800 dark:text-gray-200";
  const label = value === "matched" ? "Đã match" : value === "partial" ? "Một phần" : "Raw";
  return <span className={`rounded-md px-2 py-1 text-xs font-black ${className}`}>{label}</span>;
}

function confidenceRank(value: string) {
  if (value === "matched") return 0;
  if (value === "partial") return 1;
  return 2;
}
