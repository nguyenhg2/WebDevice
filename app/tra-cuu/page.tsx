import ConfigCombobox from "@/components/ConfigCombobox";
import GameCard from "@/components/GameCard";
import SystemDetector from "@/components/SystemDetector";
import UpgradeAdviceCard from "@/components/UpgradeAdviceCard";
import { classifyGame } from "@/lib/compatibility-engine";
import { benchmarks, cpus, games, gpus } from "@/lib/data";
import type { Resolution, Status } from "@/types";

type LookupParams = {
  gpu?: string;
  cpu?: string;
  ram?: string;
  res?: string;
};

const statusLabels: Record<Status, string> = {
  smooth: "Chơi mượt",
  playable: "Chơi được",
  not_recommended: "Nên nâng cấp",
};

const statusDescriptions: Record<Status, string> = {
  smooth: "Ưu tiên tải hoặc mua trước.",
  playable: "Chơi được nếu giảm setting hợp lý.",
  not_recommended: "Cấu hình hiện tại chưa phù hợp.",
};

export default function LookupPage({ searchParams }: { searchParams: Promise<LookupParams> }) {
  return <LookupContent searchParams={searchParams} />;
}

async function LookupContent({ searchParams }: { searchParams: Promise<LookupParams> }) {
  const params = await searchParams;
  const selectedGpu = gpus.find((item) => item.slug === params.gpu) ?? gpus.find((item) => item.slug === "nvidia-rtx-3060") ?? gpus[0];
  const selectedCpu = cpus.find((item) => item.slug === params.cpu) ?? cpus.find((item) => item.slug.includes("i5-12400")) ?? cpus[0];
  const ramGb = normalizeRam(params.ram);
  const resolution = normalizeResolution(params.res);
  const rows = games
    .map((game) => {
      const benchmark = benchmarks.find((row) => row.gameSlug === game.slug && row.gpuSlug === selectedGpu.slug && row.resolution === resolution);
      return {
        game,
        ...classifyGame(selectedGpu.benchmarkScore, selectedCpu.benchmarkScore, ramGb, resolution, game.minSpecs, game.recSpecs, benchmark),
      };
    })
    .sort((a, b) => b.estimatedFps - a.estimatedFps);
  const groupedRows = {
    smooth: rows.filter((row) => row.status === "smooth"),
    playable: rows.filter((row) => row.status === "playable"),
    not_recommended: rows.filter((row) => row.status === "not_recommended"),
  };

  return (
    <main className="container page-section">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <p className="eyebrow">Tra cứu cấu hình</p>
          <h1 className="mt-2 text-4xl font-black">Máy này chơi được game gì?</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-gray-300">
            Chọn cấu hình đang dùng. Kết quả sẽ ưu tiên game chơi mượt và setting nên chọn.
          </p>
        </div>
        <div className="surface p-4">
          <p className="text-sm text-slate-500 dark:text-gray-400">Đang kiểm tra</p>
          <p className="mt-1 font-black">{selectedGpu.name}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
            {selectedCpu.name} · {ramGb}GB RAM · {resolution}
          </p>
        </div>
      </header>

      <SystemDetector
        cpus={cpus}
        gpus={gpus}
        current={{
          cpuSlug: selectedCpu.slug,
          gpuSlug: selectedGpu.slug,
          ramGb,
          resolution,
        }}
      />

      <LookupForm gpuSlug={selectedGpu.slug} cpuSlug={selectedCpu.slug} ramGb={ramGb} resolution={resolution} />

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {(["smooth", "playable", "not_recommended"] as Status[]).map((status) => (
          <a key={status} href={`#${status}`} className="surface p-4 hover:border-teal-300">
            <p className="text-sm text-slate-500 dark:text-gray-400">{statusLabels[status]}</p>
            <p className="mt-1 text-3xl font-black">{groupedRows[status].length}</p>
          </a>
        ))}
      </div>

      {(["smooth", "playable", "not_recommended"] as Status[]).map((status) => (
        <ResultSection key={status} status={status} rows={groupedRows[status]} />
      ))}

      {rows[0]?.upgradeAdvice.length ? (
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {rows[0].upgradeAdvice.map((advice) => (
            <UpgradeAdviceCard key={advice} advice={advice} />
          ))}
        </section>
      ) : null}
    </main>
  );
}

function LookupForm({ gpuSlug, cpuSlug, ramGb, resolution }: { gpuSlug: string; cpuSlug: string; ramGb: number; resolution: Resolution }) {
  return (
    <form className="surface mt-5 grid gap-3 p-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_120px_140px_auto]">
      <ConfigCombobox
        label="GPU"
        name="gpu"
        defaultValue={gpuSlug}
        placeholder="Tìm GPU, ví dụ RTX 3060..."
        options={gpus.map((item) => ({
          value: item.slug,
          label: item.name,
          meta: `${item.brand} · ${item.vram ?? 0}GB VRAM · ${shortNumber(item.benchmarkScore)} điểm`,
        }))}
      />
      <ConfigCombobox
        label="CPU"
        name="cpu"
        defaultValue={cpuSlug}
        placeholder="Tìm CPU, ví dụ i5 12400F..."
        options={cpus.map((item) => ({
          value: item.slug,
          label: item.name,
          meta: `${item.cores} nhân/${item.threads} luồng · ${shortNumber(item.benchmarkScore)} điểm`,
        }))}
      />
      <label className="grid gap-1 text-sm font-semibold">
        RAM
        <select name="ram" className="input" defaultValue={ramGb}>
          {[8, 16, 32].map((value) => (
            <option key={value} value={value}>
              {value}GB
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Màn hình
        <select name="res" className="input" defaultValue={resolution}>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="1440p">1440p</option>
          <option value="4k">4K</option>
        </select>
      </label>
      <button className="btn self-end">Xem kết quả</button>
    </form>
  );
}

function ResultSection({
  status,
  rows,
}: {
  status: Status;
  rows: Array<{ game: (typeof games)[number]; status: Status; estimatedFps: number; recommendedSetting: string }>;
}) {
  return (
    <section id={status} className="scroll-mt-24">
      <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black">
            {statusLabels[status]} ({rows.length})
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">{statusDescriptions[status]}</p>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map((row) => (
          <GameCard key={row.game.slug} game={row.game} status={row.status} fps={row.estimatedFps} setting={row.recommendedSetting} />
        ))}
      </div>
    </section>
  );
}

function normalizeRam(value?: string) {
  const ram = Number(value ?? 16);
  return [8, 16, 32].includes(ram) ? ram : 16;
}

function normalizeResolution(value?: string): Resolution {
  return value === "720p" || value === "1080p" || value === "1440p" || value === "4k" ? value : "1080p";
}

function shortNumber(value: number) {
  return value >= 1000 ? `${Math.round(value / 100) / 10}k` : String(value);
}
