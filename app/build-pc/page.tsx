import Link from "next/link";
import type { Metadata } from "next";
import {
  createPcBuilderPlan,
  popularBuilderGames,
  type BuildUsage,
  type ComponentBuild,
  type DeviceRecommendation,
  type GraphicsQuality,
} from "@/lib/pc-builder";
import { formatVnd } from "@/lib/utils";
import type { Resolution } from "@/types";

export const metadata: Metadata = {
  title: "Build PC theo game và ngân sách",
  description: "Công cụ đề xuất cấu hình PC/laptop theo ngân sách, game mục tiêu, FPS, setting và dữ liệu benchmark.",
};

type BuildPcSearchParams = {
  budget?: string;
  games?: string | string[];
  resolution?: string;
  fps?: string;
  quality?: string;
  usage?: string;
  laptop?: string;
};

const budgetOptions = [8_000_000, 12_000_000, 15_000_000, 20_000_000, 25_000_000, 30_000_000, 40_000_000, 60_000_000];
const fpsOptions = [60, 90, 120, 144, 240];
const resolutionOptions: Array<[Resolution, string]> = [
  ["720p", "720p"],
  ["1080p", "1080p"],
  ["1440p", "1440p"],
  ["4k", "4K"],
];
const qualityOptions: Array<[GraphicsQuality, string]> = [
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["ultra", "Ultra"],
];
const usageOptions: Array<[BuildUsage, string]> = [
  ["gaming", "Gaming"],
  ["streaming", "Streaming + Gaming"],
];

export default async function BuildPcPage({ searchParams }: { searchParams: Promise<BuildPcSearchParams> }) {
  const params = await searchParams;
  const plan = createPcBuilderPlan({
    budgetVnd: Number(params.budget),
    gameSlugs: parseGameParams(params.games),
    resolution: parseResolution(params.resolution),
    targetFps: Number(params.fps),
    quality: parseQuality(params.quality),
    usage: params.usage === "streaming" ? "streaming" : "gaming",
    preferLaptop: params.laptop === "1",
  });

  return (
    <section>
      <header className="border-b border-slate-200 bg-white dark:border-gray-700 dark:bg-gray-900">
        <div className="container grid gap-6 py-8 lg:grid-cols-[1fr_380px]">
          <div>
            <p className="text-sm font-bold uppercase text-blue-700 dark:text-blue-300">PC Builder</p>
            <h1 className="mt-2 text-3xl font-black lg:text-4xl">Build PC theo game và ngân sách</h1>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <Metric label="Ngân sách" value={formatVnd(plan.input.budgetVnd)} />
              <Metric label="Mục tiêu" value={`${plan.input.targetFps} FPS ${resolutionLabel(plan.input.resolution)}`} />
              <Metric label="Game" value={`${plan.selectedGames.length} game`} />
            </div>
          </div>
          <div className="card p-4">
            <p className="text-sm font-bold text-slate-500 dark:text-gray-300">Đề xuất chính</p>
            <h2 className="mt-2 text-xl font-black">{plan.primaryBuild.gpu.name}</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
              {plan.primaryBuild.cpu.name} · {plan.primaryBuild.ramGb}GB RAM · {plan.primaryBuild.storageGb >= 1024 ? `${plan.primaryBuild.storageGb / 1024}TB` : `${plan.primaryBuild.storageGb}GB`} SSD
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Metric label="Giá ước tính" value={formatVnd(plan.primaryBuild.estimatedPriceVnd)} />
              <Metric label="FPS thấp nhất" value={`${plan.primaryBuild.minFps} FPS`} />
            </div>
          </div>
        </div>
      </header>

      <div className="container grid gap-6 py-8 lg:grid-cols-[360px_1fr]">
        <aside>
          <BuilderForm plan={plan} />
          <div className="card mt-4 p-4">
            <h2 className="text-lg font-black">Luồng DropReference đã tham khảo</h2>
            <div className="mt-3 grid gap-2 text-sm">
              <FlowLink href="/build-pc" label="Quick builder" active />
              <FlowLink href="/tra-cuu" label="Expert tra cứu cấu hình" />
              <FlowLink href="/benchmark" label="Benchmark FPS" />
              <FlowLink href="/gpu" label="Kho GPU" />
            </div>
          </div>
        </aside>

        <main className="grid gap-6">
          <BuildSummary build={plan.primaryBuild} />

          <section className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <div className="card p-4">
              <h2 className="text-2xl font-black">FPS theo game mục tiêu</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[620px] table-fixed border-collapse text-sm">
                  <colgroup>
                    <col className="w-[230px]" />
                    <col className="w-[90px]" />
                    <col className="w-[110px]" />
                    <col />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-slate-200 text-left dark:border-gray-700">
                      <th className="p-3">Game</th>
                      <th className="p-3 text-right">FPS</th>
                      <th className="p-3">Trạng thái</th>
                      <th className="p-3">Nguồn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.primaryBuild.performance.map((item) => (
                      <tr key={item.game.slug} className="border-b border-slate-100 last:border-0 dark:border-gray-800">
                        <td className="p-3 font-semibold">
                          <Link href={`/game/${item.game.slug}`} className="hover:text-blue-700 dark:hover:text-blue-300">
                            {item.game.name}
                          </Link>
                        </td>
                        <td className="p-3 text-right font-black tabular-nums">{item.fps}</td>
                        <td className="p-3">
                          <StatusPill status={item.status} />
                        </td>
                        <td className="p-3 text-slate-600 dark:text-gray-300">Benchmark nếu có, còn lại dùng engine cấu hình</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-4">
              <h2 className="text-xl font-black">Cấu hình nền</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <SpecRow label="RAM" value={`${plan.requiredRamGb}GB`} />
                <SpecRow label="SSD" value={plan.requiredStorageGb >= 1024 ? `${plan.requiredStorageGb / 1024}TB` : `${plan.requiredStorageGb}GB`} />
                <SpecRow label="Setting" value={qualityLabel(plan.input.quality)} />
                <SpecRow label="Nhu cầu" value={plan.input.usage === "streaming" ? "Streaming + Gaming" : "Gaming"} />
              </dl>
            </div>
          </section>

          {plan.deviceRecommendations.length ? (
            <section>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black">Máy có sẵn phù hợp</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">Ưu tiên giá trong ngân sách, FPS và loại máy đã chọn.</p>
                </div>
                <Link href="/laptop" className="font-bold text-blue-700 dark:text-blue-300">
                  Xem toàn bộ máy
                </Link>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {plan.deviceRecommendations.slice(0, 3).map((item) => (
                  <DeviceResultCard key={item.device.slug} item={item} />
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="text-2xl font-black">Phương án thay thế</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {plan.alternativeBuilds.map((build) => (
                <CompactBuildCard key={`${build.gpu.slug}-${build.cpu.slug}`} build={build} />
              ))}
            </div>
          </section>
        </main>
      </div>
    </section>
  );
}

function BuilderForm({ plan }: { plan: ReturnType<typeof createPcBuilderPlan> }) {
  return (
    <form className="card grid gap-4 p-4">
      <h2 className="text-xl font-black">Tiêu chí build</h2>
      <label className="grid gap-1 text-sm font-semibold">
        Ngân sách
        <select name="budget" className="input" defaultValue={plan.input.budgetVnd}>
          {budgetOptions.map((value) => (
            <option key={value} value={value}>
              {formatVnd(value)}
            </option>
          ))}
        </select>
      </label>

      <fieldset>
        <legend className="text-sm font-semibold">Game mục tiêu</legend>
        <div className="mt-2 grid max-h-72 gap-2 overflow-auto pr-1">
          {popularBuilderGames.map((game) => (
            <label key={game.slug} className="flex items-start gap-2 rounded-md border border-slate-200 p-2 text-sm dark:border-gray-700">
              <input type="checkbox" name="games" value={game.slug} defaultChecked={plan.selectedGames.some((selected) => selected.slug === game.slug)} className="mt-1" />
              <span>
                <span className="block font-semibold">{game.name}</span>
                <span className="text-xs text-slate-500">{game.genres.slice(0, 2).join(", ")}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="grid gap-1 text-sm font-semibold">
          Độ phân giải
          <select name="resolution" className="input" defaultValue={plan.input.resolution}>
            {resolutionOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          FPS
          <select name="fps" className="input" defaultValue={plan.input.targetFps}>
            {fpsOptions.map((value) => (
              <option key={value} value={value}>
                {value} FPS
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="grid gap-1 text-sm font-semibold">
          Setting
          <select name="quality" className="input" defaultValue={plan.input.quality}>
            {qualityOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">
          Nhu cầu
          <select name="usage" className="input" defaultValue={plan.input.usage}>
            {usageOptions.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" name="laptop" value="1" defaultChecked={plan.input.preferLaptop} />
        Ưu tiên laptop
      </label>

      <button className="btn w-full">Tạo cấu hình</button>
    </form>
  );
}

function BuildSummary({ build }: { build: ComponentBuild }) {
  return (
    <section className="card p-4">
      <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
        <div>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-slate-500 dark:text-gray-300">Combo đề xuất</p>
              <h2 className="mt-1 text-2xl font-black">{build.gpu.name}</h2>
              <p className="mt-1 text-slate-600 dark:text-gray-300">{build.cpu.name}</p>
            </div>
            <BudgetPill status={build.budgetStatus} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-4">
            <Metric label="Giá ước tính" value={formatVnd(build.estimatedPriceVnd)} />
            <Metric label="FPS thấp nhất" value={`${build.minFps} FPS`} />
            <Metric label="FPS trung bình" value={`${build.averageFps} FPS`} />
            <Metric label="VRAM" value={`${build.gpu.vram ?? 0}GB`} />
          </div>
        </div>
        <ul className="grid gap-2 text-sm text-slate-700 dark:text-gray-200">
          {build.notes.map((note) => (
            <li key={note} className="rounded-md bg-slate-50 p-3 dark:bg-gray-800">
              {note}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function DeviceResultCard({ item }: { item: DeviceRecommendation }) {
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={`/laptop/${item.device.slug}`} className="font-black hover:text-blue-700 dark:hover:text-blue-300">
            {item.device.name}
          </Link>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            {item.device.cpu} · {item.device.gpu} · {item.device.ramGb}GB RAM
          </p>
        </div>
        <BudgetPill status={item.budgetStatus} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="Giá" value={formatVnd(item.device.priceVnd)} />
        <Metric label="Min FPS" value={`${item.minFps}`} />
        <Metric label="Avg FPS" value={`${item.averageFps}`} />
      </div>
      <ul className="mt-3 grid gap-2 text-sm text-slate-600 dark:text-gray-300">
        {item.notes.slice(0, 2).map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </article>
  );
}

function CompactBuildCard({ build }: { build: ComponentBuild }) {
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-black">{build.gpu.name}</h3>
        <BudgetPill status={build.budgetStatus} />
      </div>
      <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">{build.cpu.name}</p>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Metric label="Giá" value={formatVnd(build.estimatedPriceVnd)} />
        <Metric label="Min FPS" value={`${build.minFps}`} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-3 dark:border-gray-700">
      <p className="text-xs text-slate-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-200 p-3 dark:border-gray-700">
      <dt className="text-slate-500 dark:text-gray-400">{label}</dt>
      <dd className="font-black">{value}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: "pass" | "near" | "miss" }) {
  const className =
    status === "pass"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
      : status === "near"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200";
  return <span className={`inline-flex rounded-md px-2 py-1 text-xs font-black ${className}`}>{status === "pass" ? "Đạt" : status === "near" ? "Gần đạt" : "Thiếu"}</span>;
}

function BudgetPill({ status }: { status: "within" | "stretch" | "over" }) {
  const className =
    status === "within"
      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
      : status === "stretch"
        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200"
        : "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200";
  const label = status === "within" ? "Trong ngân sách" : status === "stretch" ? "Vượt nhẹ" : "Vượt ngân sách";
  return <span className={`shrink-0 rounded-md px-2 py-1 text-xs font-black ${className}`}>{label}</span>;
}

function FlowLink({ href, label, active }: { href: string; label: string; active?: boolean }) {
  return (
    <Link
      href={href}
      className={
        "rounded-md border px-3 py-2 font-semibold " +
        (active ? "border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-200" : "border-slate-200 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800")
      }
    >
      {label}
    </Link>
  );
}

function parseGameParams(value?: string | string[]): string[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string" && value.length) return [value];
  return [];
}

function parseResolution(value?: string): Resolution | undefined {
  return value === "720p" || value === "1080p" || value === "1440p" || value === "4k" ? value : undefined;
}

function parseQuality(value?: string): GraphicsQuality | undefined {
  return value === "low" || value === "medium" || value === "high" || value === "ultra" ? value : undefined;
}

function qualityLabel(value: GraphicsQuality): string {
  return qualityOptions.find(([quality]) => quality === value)?.[1] ?? value;
}

function resolutionLabel(value: Resolution): string {
  return resolutionOptions.find(([resolution]) => resolution === value)?.[1] ?? value;
}
