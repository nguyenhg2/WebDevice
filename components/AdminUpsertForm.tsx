"use client";

import { useMemo, useState } from "react";

const samples: Record<string, unknown> = {
  game: {
    name: "Example Game",
    slug: "example-game",
    steamId: null,
    genres: ["Action"],
    sizeGb: 20,
    price: 0,
    isFree: true,
    description: "Mô tả game.",
    coverImage: "https://example.com/game.jpg",
    officialUrl: "https://example.com",
    minSpecs: { cpuName: "Intel Core i3", gpuName: "GTX 750 Ti", cpuBenchmark: 4000, gpuBenchmark: 3900, ramGb: 8, storageGb: 20 },
    recSpecs: { cpuName: "Intel Core i5", gpuName: "GTX 1060", cpuBenchmark: 9000, gpuBenchmark: 9500, ramGb: 16, storageGb: 20 },
  },
  gpu: { name: "NVIDIA RTX 4060", slug: "nvidia-rtx-4060", brand: "NVIDIA", benchmarkScore: 19600, category: "mid", tdp: 115, vram: 8, priceRangeVnd: "7-12trieu", isLaptop: false, commonInVietnam: true },
  cpu: { name: "Intel Core i5-12400F", slug: "intel-core-i5-12400f", brand: "Intel", benchmarkScore: 19500, cores: 6, threads: 12, generation: "12th Gen", socket: "LGA1700", integratedGpu: null, priceRangeVnd: "3-7trieu", commonInVietnam: true },
  device: { name: "Laptop gaming mẫu", slug: "laptop-gaming-mau", type: "laptop", brand: "ASUS", cpu: "Intel Core i5-12400F", gpu: "NVIDIA RTX 4060", ramGb: 16, storageGb: 512, storageType: "SSD", screenSize: 15.6, screenResolution: "1920x1080", priceVnd: 18990000, priceRange: "15-20-trieu", shopeeUrl: null, tikiUrl: null, phongvuUrl: null, gearvnUrl: null, imageUrl: "https://example.com/laptop.jpg" },
  benchmark: { gameSlug: "example-game", gpuSlug: "nvidia-rtx-4060", resolution: "1080p", fpsLow: 70, fpsMedium: 100, fpsHigh: 85, fpsUltra: 60, recommendedSetting: "High", status: "smooth", videoTestUrl: null, source: "Admin nhập thủ công" },
  blogPost: { title: "Bài viết mẫu", slug: "bai-viet-mau", content: "Nội dung bài viết", excerpt: "Tóm tắt", category: "huong-dan", tags: ["game"], metaTitle: "Bài viết mẫu", metaDescription: "Tóm tắt", publishedAt: new Date().toISOString() },
};

export default function AdminUpsertForm() {
  const [collection, setCollection] = useState("game");
  const [payload, setPayload] = useState(JSON.stringify(samples.game, null, 2));
  const [status, setStatus] = useState("");
  const collections = useMemo(() => Object.keys(samples), []);

  function changeCollection(value: string) {
    setCollection(value);
    setPayload(JSON.stringify(samples[value], null, 2));
    setStatus("");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Đang lưu...");
    const form = new FormData();
    form.set("collection", collection);
    form.set("payload", payload);
    const response = await fetch("/api/admin/upsert", { method: "POST", body: form });
    const result = await response.json();
    setStatus(result.success ? `Đã lưu ${result.count} bản ghi vào database.` : `Lỗi: ${result.error}`);
  }

  return <form onSubmit={submit} className="card grid gap-3 p-4"><div className="grid gap-2 md:grid-cols-[220px_1fr]"><label className="grid gap-1 text-sm font-semibold">Module<select className="input" value={collection} onChange={(event) => changeCollection(event.target.value)}>{collections.map((item) => <option key={item} value={item}>{item}</option>)}</select></label><div className="text-sm text-slate-600 dark:text-gray-300">Dán một object JSON hoặc một mảng object JSON. Dữ liệu sẽ upsert theo `slug` hoặc khóa benchmark.</div></div><textarea className="input min-h-96 font-mono text-sm" value={payload} onChange={(event) => setPayload(event.target.value)} spellCheck={false} /><div className="flex flex-wrap items-center gap-3"><button className="btn">Lưu vào database</button>{status ? <span className="text-sm font-semibold">{status}</span> : null}</div></form>;
}
