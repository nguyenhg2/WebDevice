import GameCard from "@/components/GameCard";
import SystemDetector from "@/components/SystemDetector";
import UpgradeAdviceCard from "@/components/UpgradeAdviceCard";
import { classifyGame } from "@/lib/compatibility-engine";
import { cpus, games, gpus } from "@/lib/data";
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
  not_recommended: "Không khuyến nghị",
};

export default function LookupPage({ searchParams }: { searchParams: Promise<LookupParams> }) {
  return <LookupContent searchParams={searchParams} />;
}

async function LookupContent({ searchParams }: { searchParams: Promise<LookupParams> }) {
  const params = await searchParams;
  const selectedGpu = gpus.find((item) => item.slug === params.gpu) ?? gpus[0];
  const selectedCpu = cpus.find((item) => item.slug === params.cpu) ?? cpus[0];
  const ramGb = normalizeRam(params.ram);
  const resolution = normalizeResolution(params.res);
  const rows = games.map((game) => ({
    game,
    ...classifyGame(selectedGpu.benchmarkScore, selectedCpu.benchmarkScore, ramGb, resolution, game.minSpecs, game.recSpecs),
  }));

  return (
    <section className="container py-8">
      <header>
        <h1 className="text-3xl font-black">Tra cứu cấu hình chơi game</h1>
        <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-gray-300">
          Chọn CPU, GPU, RAM và độ phân giải để xem game chơi được. Nếu không biết cấu hình máy, dùng nút tự nhận diện bên dưới.
        </p>
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

      {(["smooth", "playable", "not_recommended"] as Status[]).map((status) => (
        <ResultSection key={status} status={status} rows={rows.filter((row) => row.status === status)} />
      ))}

      {rows[0]?.upgradeAdvice.length ? (
        <section className="mt-8 grid gap-4 md:grid-cols-3">
          {rows[0].upgradeAdvice.map((advice) => (
            <UpgradeAdviceCard key={advice} advice={advice} />
          ))}
        </section>
      ) : null}
    </section>
  );
}

function LookupForm({ gpuSlug, cpuSlug, ramGb, resolution }: { gpuSlug: string; cpuSlug: string; ramGb: number; resolution: Resolution }) {
  return (
    <form className="card mt-5 grid gap-3 p-4 md:grid-cols-5">
      <label className="grid gap-1 text-sm font-semibold">
        GPU
        <select name="gpu" className="input" defaultValue={gpuSlug}>
          {gpus.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        CPU
        <select name="cpu" className="input" defaultValue={cpuSlug}>
          {cpus.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        RAM
        <select name="ram" className="input" defaultValue={ramGb}>
          {[4, 8, 16, 32].map((value) => (
            <option key={value} value={value}>
              {value}GB
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1 text-sm font-semibold">
        Độ phân giải
        <select name="res" className="input" defaultValue={resolution}>
          <option value="720p">720p</option>
          <option value="1080p">1080p</option>
          <option value="1440p">1440p</option>
          <option value="4k">4K</option>
        </select>
      </label>
      <button className="btn self-end">Kiểm tra cấu hình</button>
    </form>
  );
}

function ResultSection({ status, rows }: { status: Status; rows: Array<{ game: (typeof games)[number]; status: Status; estimatedFps: number; recommendedSetting: string }> }) {
  return (
    <section>
      <h2 className="mt-8 text-2xl font-black">
        {statusLabels[status]} ({rows.length} game)
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rows.slice(0, 9).map((row) => (
          <GameCard key={row.game.slug} game={row.game} status={row.status} fps={row.estimatedFps} setting={row.recommendedSetting} />
        ))}
      </div>
    </section>
  );
}

function normalizeRam(value?: string) {
  const ram = Number(value ?? 8);
  return [4, 8, 16, 32].includes(ram) ? ram : 8;
}

function normalizeResolution(value?: string): Resolution {
  return value === "720p" || value === "1080p" || value === "1440p" || value === "4k" ? value : "1080p";
}
