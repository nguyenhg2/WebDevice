"use client";

import { useMemo, useState } from "react";

type Field = {
  name: string;
  label: string;
  type?: "text" | "number" | "textarea" | "checkbox" | "select" | "tags";
  required?: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string | number | boolean;
};

const modules: Record<string, { label: string; description: string; fields: Field[]; transform: (values: Record<string, FormDataEntryValue | boolean>) => unknown }> = {
  game: {
    label: "Game",
    description: "Thêm hoặc cập nhật game, ảnh bìa, giá, thể loại và cấu hình yêu cầu.",
    fields: [
      { name: "name", label: "Tên game", required: true, defaultValue: "Example Game" },
      { name: "slug", label: "Slug", required: true, defaultValue: "example-game" },
      { name: "steamId", label: "Steam App ID", placeholder: "Có thể để trống" },
      { name: "genres", label: "Thể loại", type: "tags", defaultValue: "Action, Adventure" },
      { name: "sizeGb", label: "Dung lượng (GB)", type: "number", defaultValue: 20 },
      { name: "price", label: "Giá VND", type: "number", defaultValue: 0 },
      { name: "isFree", label: "Miễn phí", type: "checkbox", defaultValue: true },
      { name: "coverImage", label: "URL ảnh bìa thật", required: true, defaultValue: "https://example.com/game.jpg" },
      { name: "officialUrl", label: "Website chính thức", defaultValue: "https://example.com" },
      { name: "description", label: "Mô tả", type: "textarea", defaultValue: "Mô tả ngắn về game." },
      { name: "minCpu", label: "CPU tối thiểu", defaultValue: "Intel Core i3" },
      { name: "minGpu", label: "GPU tối thiểu", defaultValue: "GTX 750 Ti" },
      { name: "minCpuBenchmark", label: "Điểm CPU tối thiểu", type: "number", defaultValue: 4000 },
      { name: "minGpuBenchmark", label: "Điểm GPU tối thiểu", type: "number", defaultValue: 3900 },
      { name: "minRamGb", label: "RAM tối thiểu (GB)", type: "number", defaultValue: 8 },
      { name: "minStorageGb", label: "Ổ cứng tối thiểu (GB)", type: "number", defaultValue: 20 },
      { name: "recCpu", label: "CPU đề xuất", defaultValue: "Intel Core i5" },
      { name: "recGpu", label: "GPU đề xuất", defaultValue: "GTX 1060" },
      { name: "recCpuBenchmark", label: "Điểm CPU đề xuất", type: "number", defaultValue: 9000 },
      { name: "recGpuBenchmark", label: "Điểm GPU đề xuất", type: "number", defaultValue: 9500 },
      { name: "recRamGb", label: "RAM đề xuất (GB)", type: "number", defaultValue: 16 },
      { name: "recStorageGb", label: "Ổ cứng đề xuất (GB)", type: "number", defaultValue: 20 },
    ],
    transform: (v) => ({
      name: text(v.name),
      slug: text(v.slug),
      steamId: nullable(v.steamId),
      genres: tags(v.genres),
      sizeGb: number(v.sizeGb),
      price: number(v.price),
      isFree: Boolean(v.isFree),
      description: text(v.description),
      coverImage: nullable(v.coverImage),
      officialUrl: nullable(v.officialUrl),
      minSpecs: { cpuName: text(v.minCpu), gpuName: text(v.minGpu), cpuBenchmark: number(v.minCpuBenchmark), gpuBenchmark: number(v.minGpuBenchmark), ramGb: number(v.minRamGb), storageGb: number(v.minStorageGb) },
      recSpecs: { cpuName: text(v.recCpu), gpuName: text(v.recGpu), cpuBenchmark: number(v.recCpuBenchmark), gpuBenchmark: number(v.recGpuBenchmark), ramGb: number(v.recRamGb), storageGb: number(v.recStorageGb) },
    }),
  },
  gpu: {
    label: "GPU",
    description: "Cập nhật card đồ họa, điểm benchmark, VRAM và nhóm hiệu năng.",
    fields: [
      { name: "name", label: "Tên GPU", required: true, defaultValue: "NVIDIA RTX 4060" },
      { name: "slug", label: "Slug", required: true, defaultValue: "nvidia-rtx-4060" },
      { name: "brand", label: "Hãng", type: "select", options: ["NVIDIA", "AMD", "Intel"], defaultValue: "NVIDIA" },
      { name: "benchmarkScore", label: "Điểm benchmark", type: "number", defaultValue: 19600 },
      { name: "category", label: "Nhóm", type: "select", options: ["integrated", "low", "mid", "high", "ultra"], defaultValue: "mid" },
      { name: "tdp", label: "TDP (W)", type: "number", defaultValue: 115 },
      { name: "vram", label: "VRAM (GB)", type: "number", defaultValue: 8 },
      { name: "priceRangeVnd", label: "Tầm giá", defaultValue: "7-12trieu" },
      { name: "isLaptop", label: "GPU laptop", type: "checkbox" },
      { name: "commonInVietnam", label: "Phổ biến ở Việt Nam", type: "checkbox", defaultValue: true },
    ],
    transform: (v) => ({ name: text(v.name), slug: text(v.slug), brand: text(v.brand), benchmarkScore: number(v.benchmarkScore), category: text(v.category), tdp: nullableNumber(v.tdp), vram: nullableNumber(v.vram), priceRangeVnd: text(v.priceRangeVnd), isLaptop: Boolean(v.isLaptop), commonInVietnam: Boolean(v.commonInVietnam) }),
  },
  cpu: {
    label: "CPU",
    description: "Cập nhật CPU, thế hệ, socket, số nhân/luồng và điểm benchmark.",
    fields: [
      { name: "name", label: "Tên CPU", required: true, defaultValue: "Intel Core i5-12400F" },
      { name: "slug", label: "Slug", required: true, defaultValue: "intel-core-i5-12400f" },
      { name: "brand", label: "Hãng", type: "select", options: ["Intel", "AMD"], defaultValue: "Intel" },
      { name: "benchmarkScore", label: "Điểm benchmark", type: "number", defaultValue: 19500 },
      { name: "cores", label: "Số nhân", type: "number", defaultValue: 6 },
      { name: "threads", label: "Số luồng", type: "number", defaultValue: 12 },
      { name: "generation", label: "Thế hệ", defaultValue: "12th Gen" },
      { name: "socket", label: "Socket", defaultValue: "LGA1700" },
      { name: "integratedGpu", label: "GPU tích hợp", placeholder: "Có thể để trống" },
      { name: "priceRangeVnd", label: "Tầm giá", defaultValue: "3-7trieu" },
      { name: "commonInVietnam", label: "Phổ biến ở Việt Nam", type: "checkbox", defaultValue: true },
    ],
    transform: (v) => ({ name: text(v.name), slug: text(v.slug), brand: text(v.brand), benchmarkScore: number(v.benchmarkScore), cores: number(v.cores), threads: number(v.threads), generation: text(v.generation), socket: nullable(v.socket), integratedGpu: nullable(v.integratedGpu), priceRangeVnd: text(v.priceRangeVnd), commonInVietnam: Boolean(v.commonInVietnam) }),
  },
  device: {
    label: "Thiết bị",
    description: "Cập nhật laptop/PC, ảnh sản phẩm, giá và link affiliate.",
    fields: [
      { name: "name", label: "Tên thiết bị", required: true, defaultValue: "Laptop gaming mẫu" },
      { name: "slug", label: "Slug", required: true, defaultValue: "laptop-gaming-mau" },
      { name: "type", label: "Loại", type: "select", options: ["laptop", "desktop_prebuilt", "custom_build"], defaultValue: "laptop" },
      { name: "brand", label: "Hãng", defaultValue: "ASUS" },
      { name: "cpu", label: "CPU", defaultValue: "Intel Core i5-12400F" },
      { name: "gpu", label: "GPU", defaultValue: "NVIDIA RTX 4060" },
      { name: "ramGb", label: "RAM (GB)", type: "number", defaultValue: 16 },
      { name: "storageGb", label: "Ổ cứng (GB)", type: "number", defaultValue: 512 },
      { name: "storageType", label: "Loại ổ cứng", type: "select", options: ["SSD", "HDD", "SSD+HDD"], defaultValue: "SSD" },
      { name: "screenSize", label: "Màn hình (inch)", type: "number", defaultValue: 15.6 },
      { name: "screenResolution", label: "Độ phân giải màn hình", defaultValue: "1920x1080" },
      { name: "priceVnd", label: "Giá VND", type: "number", defaultValue: 18990000 },
      { name: "priceRange", label: "Khoảng giá", type: "select", options: ["duoi-10-trieu", "10-15-trieu", "15-20-trieu", "20-30-trieu", "tren-30-trieu"], defaultValue: "15-20-trieu" },
      { name: "imageUrl", label: "URL ảnh sản phẩm", defaultValue: "https://example.com/laptop.jpg" },
      { name: "shopeeUrl", label: "Shopee URL" },
      { name: "tikiUrl", label: "Tiki URL" },
      { name: "phongvuUrl", label: "Phong Vũ URL" },
      { name: "gearvnUrl", label: "GearVN URL" },
    ],
    transform: (v) => ({ name: text(v.name), slug: text(v.slug), type: text(v.type), brand: text(v.brand), cpu: text(v.cpu), gpu: text(v.gpu), ramGb: number(v.ramGb), storageGb: number(v.storageGb), storageType: text(v.storageType), screenSize: nullableNumber(v.screenSize), screenResolution: nullable(v.screenResolution), priceVnd: number(v.priceVnd), priceRange: text(v.priceRange), shopeeUrl: nullable(v.shopeeUrl), tikiUrl: nullable(v.tikiUrl), phongvuUrl: nullable(v.phongvuUrl), gearvnUrl: nullable(v.gearvnUrl), imageUrl: nullable(v.imageUrl) }),
  },
  benchmark: {
    label: "Benchmark",
    description: "Cập nhật FPS thực tế hoặc ước tính cho một cặp game/GPU.",
    fields: [
      { name: "gameSlug", label: "Game slug", required: true, defaultValue: "example-game" },
      { name: "gpuSlug", label: "GPU slug", required: true, defaultValue: "nvidia-rtx-4060" },
      { name: "resolution", label: "Độ phân giải", type: "select", options: ["720p", "1080p", "1440p", "4k"], defaultValue: "1080p" },
      { name: "fpsLow", label: "FPS Low", type: "number", defaultValue: 70 },
      { name: "fpsMedium", label: "FPS Medium", type: "number", defaultValue: 100 },
      { name: "fpsHigh", label: "FPS High", type: "number", defaultValue: 85 },
      { name: "fpsUltra", label: "FPS Ultra", type: "number", defaultValue: 60 },
      { name: "recommendedSetting", label: "Setting đề xuất", defaultValue: "High" },
      { name: "status", label: "Trạng thái", type: "select", options: ["smooth", "playable", "not_recommended"], defaultValue: "smooth" },
      { name: "videoTestUrl", label: "URL video test" },
      { name: "source", label: "Nguồn", defaultValue: "Admin nhập thủ công" },
    ],
    transform: (v) => ({ gameSlug: text(v.gameSlug), gpuSlug: text(v.gpuSlug), resolution: text(v.resolution), fpsLow: number(v.fpsLow), fpsMedium: number(v.fpsMedium), fpsHigh: number(v.fpsHigh), fpsUltra: number(v.fpsUltra), recommendedSetting: text(v.recommendedSetting), status: text(v.status), videoTestUrl: nullable(v.videoTestUrl), source: text(v.source) }),
  },
  blogPost: {
    label: "Bài viết",
    description: "Thêm bài blog SEO/hướng dẫn, nội dung hỗ trợ HTML.",
    fields: [
      { name: "title", label: "Tiêu đề", required: true, defaultValue: "Bài viết mẫu" },
      { name: "slug", label: "Slug", required: true, defaultValue: "bai-viet-mau" },
      { name: "excerpt", label: "Tóm tắt", type: "textarea", defaultValue: "Tóm tắt bài viết." },
      { name: "content", label: "Nội dung HTML", type: "textarea", defaultValue: "<p>Nội dung bài viết</p>" },
      { name: "category", label: "Danh mục", type: "select", options: ["so-sanh", "huong-dan", "top-game", "nang-cap", "tin-tuc"], defaultValue: "huong-dan" },
      { name: "tags", label: "Tags", type: "tags", defaultValue: "game, cau-hinh" },
      { name: "metaTitle", label: "Meta title", defaultValue: "Bài viết mẫu" },
      { name: "metaDescription", label: "Meta description", defaultValue: "Tóm tắt bài viết." },
      { name: "publishedAt", label: "Ngày xuất bản ISO", defaultValue: new Date().toISOString() },
    ],
    transform: (v) => ({ title: text(v.title), slug: text(v.slug), content: text(v.content), excerpt: text(v.excerpt), category: text(v.category), tags: tags(v.tags), metaTitle: text(v.metaTitle), metaDescription: text(v.metaDescription), publishedAt: text(v.publishedAt) }),
  },
};

function text(value: unknown) {
  return String(value ?? "").trim();
}

function nullable(value: unknown) {
  const output = text(value);
  return output ? output : null;
}

function number(value: unknown) {
  return Number(value || 0);
}

function nullableNumber(value: unknown) {
  const output = text(value);
  return output ? Number(output) : null;
}

function tags(value: unknown) {
  return text(value).split(",").map((item) => item.trim()).filter(Boolean);
}

export default function AdminUpsertForm() {
  const [moduleKey, setModuleKey] = useState("game");
  const [status, setStatus] = useState("");
  const module = modules[moduleKey];
  const moduleEntries = useMemo(() => Object.entries(modules), []);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Đang lưu...");
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const values: Record<string, FormDataEntryValue | boolean> = {};

    for (const field of module.fields) {
      values[field.name] = field.type === "checkbox" ? data.get(field.name) === "on" : data.get(field.name) ?? "";
    }

    const payload = module.transform(values);
    const form = new FormData();
    form.set("collection", moduleKey);
    form.set("payload", JSON.stringify(payload));
    const response = await fetch("/api/admin/upsert", { method: "POST", body: form });
    const result = await response.json();
    setStatus(result.success ? `Đã lưu ${result.count} bản ghi vào database.` : `Lỗi: ${result.error}`);
  }

  return <div className="grid gap-4 lg:grid-cols-[240px_1fr]"><aside className="card h-fit p-2">{moduleEntries.map(([key, item]) => <button type="button" key={key} onClick={() => { setModuleKey(key); setStatus(""); }} className={"block w-full rounded-md px-3 py-2 text-left text-sm font-bold " + (moduleKey === key ? "bg-blue-600 text-white" : "hover:bg-slate-100 dark:hover:bg-gray-800")}>{item.label}</button>)}</aside><form onSubmit={submit} className="card p-4"><div className="border-b pb-4 dark:border-gray-700"><h3 className="text-xl font-black">{module.label}</h3><p className="mt-1 text-sm text-slate-600 dark:text-gray-300">{module.description}</p></div><div className="mt-4 grid gap-4 md:grid-cols-2">{module.fields.map((field) => <label key={field.name} className={(field.type === "textarea" ? "md:col-span-2 " : "") + "grid gap-1 text-sm font-semibold"}>{field.label}{renderField(field)}</label>)}</div><div className="mt-5 flex flex-wrap items-center gap-3"><button className="btn">Lưu vào database</button>{status ? <span className="text-sm font-semibold">{status}</span> : null}</div></form></div>;
}

function renderField(field: Field) {
  if (field.type === "textarea") return <textarea className="input min-h-28" name={field.name} defaultValue={String(field.defaultValue ?? "")} required={field.required} placeholder={field.placeholder} />;
  if (field.type === "checkbox") return <input className="h-5 w-5" name={field.name} type="checkbox" defaultChecked={Boolean(field.defaultValue)} />;
  if (field.type === "select") return <select className="input" name={field.name} defaultValue={String(field.defaultValue ?? "")} required={field.required}>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
  return <input className="input" name={field.name} type={field.type === "number" ? "number" : "text"} step={field.type === "number" ? "any" : undefined} defaultValue={String(field.defaultValue ?? "")} required={field.required} placeholder={field.placeholder ?? (field.type === "tags" ? "Nhập cách nhau bằng dấu phẩy" : undefined)} />;
}
