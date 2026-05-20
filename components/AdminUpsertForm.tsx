"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";

type FieldType = "text" | "number" | "textarea" | "checkbox" | "select" | "tags";
type Field = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  defaultValue?: string | number | boolean;
};
type Values = Record<string, string | number | boolean | null | undefined>;
type ModuleConfig = {
  label: string;
  description: string;
  keyField: string;
  titleField: string;
  fields: Field[];
  transform: (values: Values) => unknown;
};

const modules: Record<string, ModuleConfig> = {
  game: {
    label: "Trò chơi",
    description: "Thêm, sửa, xóa trò chơi, ảnh bìa, giá, thể loại và cấu hình yêu cầu.",
    keyField: "slug",
    titleField: "name",
    fields: [
      { name: "name", label: "Tên trò chơi", required: true, defaultValue: "Tên trò chơi mẫu" },
      { name: "slug", label: "Đường dẫn rút gọn", required: true, defaultValue: "ten-tro-choi-mau" },
      { name: "steamId", label: "Mã ứng dụng Steam", placeholder: "Có thể để trống" },
      { name: "genres", label: "Thể loại", type: "tags", defaultValue: "Hành động, Phiêu lưu" },
      { name: "sizeGb", label: "Dung lượng (GB)", type: "number", defaultValue: 20 },
      { name: "price", label: "Giá VND", type: "number", defaultValue: 0 },
      { name: "isFree", label: "Miễn phí", type: "checkbox", defaultValue: true },
      { name: "coverImage", label: "Đường dẫn ảnh bìa thật", required: true, defaultValue: "https://example.com/game.jpg" },
      { name: "officialUrl", label: "Trang chính thức", defaultValue: "https://example.com" },
      { name: "description", label: "Mô tả", type: "textarea", defaultValue: "Mô tả ngắn về trò chơi." },
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
    label: "Card đồ họa",
    description: "Quản lý GPU, điểm benchmark, VRAM và nhóm hiệu năng.",
    keyField: "slug",
    titleField: "name",
    fields: [
      { name: "name", label: "Tên GPU", required: true, defaultValue: "NVIDIA RTX 4060" },
      { name: "slug", label: "Đường dẫn rút gọn", required: true, defaultValue: "nvidia-rtx-4060" },
      { name: "brand", label: "Hãng", type: "select", options: ["NVIDIA", "AMD", "Intel"], defaultValue: "NVIDIA" },
      { name: "benchmarkScore", label: "Điểm benchmark", type: "number", defaultValue: 19600 },
      { name: "category", label: "Nhóm hiệu năng", type: "select", options: ["integrated", "low", "mid", "high", "ultra"], defaultValue: "mid" },
      { name: "tdp", label: "TDP (W)", type: "number", defaultValue: 115 },
      { name: "vram", label: "VRAM (GB)", type: "number", defaultValue: 8 },
      { name: "priceRangeVnd", label: "Tầm giá", defaultValue: "7-12trieu" },
      { name: "isLaptop", label: "GPU laptop", type: "checkbox" },
      { name: "commonInVietnam", label: "Phổ biến ở Việt Nam", type: "checkbox", defaultValue: true },
    ],
    transform: (v) => ({ name: text(v.name), slug: text(v.slug), brand: text(v.brand), benchmarkScore: number(v.benchmarkScore), category: text(v.category), tdp: nullableNumber(v.tdp), vram: nullableNumber(v.vram), priceRangeVnd: text(v.priceRangeVnd), isLaptop: Boolean(v.isLaptop), commonInVietnam: Boolean(v.commonInVietnam) }),
  },
  cpu: {
    label: "Bộ xử lý",
    description: "Quản lý CPU, thế hệ, socket, số nhân/luồng và điểm benchmark.",
    keyField: "slug",
    titleField: "name",
    fields: [
      { name: "name", label: "Tên CPU", required: true, defaultValue: "Intel Core i5-12400F" },
      { name: "slug", label: "Đường dẫn rút gọn", required: true, defaultValue: "intel-core-i5-12400f" },
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
    description: "Quản lý laptop/PC, ảnh sản phẩm, giá và link affiliate.",
    keyField: "slug",
    titleField: "name",
    fields: [
      { name: "name", label: "Tên thiết bị", required: true, defaultValue: "Laptop gaming mẫu" },
      { name: "slug", label: "Đường dẫn rút gọn", required: true, defaultValue: "laptop-gaming-mau" },
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
      { name: "imageUrl", label: "Đường dẫn ảnh sản phẩm", defaultValue: "https://example.com/laptop.jpg" },
      { name: "shopeeUrl", label: "Đường dẫn Shopee" },
      { name: "tikiUrl", label: "Đường dẫn Tiki" },
      { name: "phongvuUrl", label: "Đường dẫn Phong Vũ" },
      { name: "gearvnUrl", label: "Đường dẫn GearVN" },
    ],
    transform: (v) => ({ name: text(v.name), slug: text(v.slug), type: text(v.type), brand: text(v.brand), cpu: text(v.cpu), gpu: text(v.gpu), ramGb: number(v.ramGb), storageGb: number(v.storageGb), storageType: text(v.storageType), screenSize: nullableNumber(v.screenSize), screenResolution: nullable(v.screenResolution), priceVnd: number(v.priceVnd), priceRange: text(v.priceRange), shopeeUrl: nullable(v.shopeeUrl), tikiUrl: nullable(v.tikiUrl), phongvuUrl: nullable(v.phongvuUrl), gearvnUrl: nullable(v.gearvnUrl), imageUrl: nullable(v.imageUrl) }),
  },
  benchmark: {
    label: "Đo hiệu năng",
    description: "Quản lý FPS thực tế hoặc ước tính cho một cặp trò chơi/GPU.",
    keyField: "id",
    titleField: "gameSlug",
    fields: [
      { name: "gameSlug", label: "Đường dẫn trò chơi", required: true, defaultValue: "ten-tro-choi-mau" },
      { name: "gpuSlug", label: "Đường dẫn GPU", required: true, defaultValue: "nvidia-rtx-4060" },
      { name: "resolution", label: "Độ phân giải", type: "select", options: ["720p", "1080p", "1440p", "4k"], defaultValue: "1080p" },
      { name: "fpsLow", label: "FPS Low", type: "number", defaultValue: 70 },
      { name: "fpsMedium", label: "FPS Medium", type: "number", defaultValue: 100 },
      { name: "fpsHigh", label: "FPS High", type: "number", defaultValue: 85 },
      { name: "fpsUltra", label: "FPS Ultra", type: "number", defaultValue: 60 },
      { name: "recommendedSetting", label: "Setting đề xuất", type: "select", options: ["Low", "Medium", "High", "Ultra"], defaultValue: "High" },
      { name: "status", label: "Trạng thái", type: "select", options: ["smooth", "playable", "not_recommended"], defaultValue: "smooth" },
      { name: "videoTestUrl", label: "Đường dẫn video test" },
      { name: "source", label: "Nguồn", defaultValue: "Quản trị nhập thủ công" },
    ],
    transform: (v) => ({ gameSlug: text(v.gameSlug), gpuSlug: text(v.gpuSlug), resolution: text(v.resolution), fpsLow: number(v.fpsLow), fpsMedium: number(v.fpsMedium), fpsHigh: number(v.fpsHigh), fpsUltra: number(v.fpsUltra), recommendedSetting: text(v.recommendedSetting), status: text(v.status), videoTestUrl: nullable(v.videoTestUrl), source: text(v.source) }),
  },
  blogPost: {
    label: "Bài viết",
    description: "Thêm, sửa, xóa bài blog SEO/hướng dẫn, nội dung hỗ trợ HTML.",
    keyField: "slug",
    titleField: "title",
    fields: [
      { name: "title", label: "Tiêu đề", required: true, defaultValue: "Bài viết mẫu" },
      { name: "slug", label: "Đường dẫn rút gọn", required: true, defaultValue: "bai-viet-mau" },
      { name: "excerpt", label: "Tóm tắt", type: "textarea", defaultValue: "Tóm tắt bài viết." },
      { name: "content", label: "Nội dung HTML", type: "textarea", defaultValue: "<p>Nội dung bài viết</p>" },
      { name: "category", label: "Danh mục", type: "select", options: ["so-sanh", "huong-dan", "top-game", "nang-cap", "tin-tuc"], defaultValue: "huong-dan" },
      { name: "tags", label: "Thẻ nội dung", type: "tags", defaultValue: "game, cau-hinh" },
      { name: "metaTitle", label: "Tiêu đề SEO", defaultValue: "Bài viết mẫu" },
      { name: "metaDescription", label: "Mô tả SEO", defaultValue: "Tóm tắt bài viết." },
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

function defaultValues(module: ModuleConfig): Values {
  return Object.fromEntries(module.fields.map((field) => [field.name, field.defaultValue ?? (field.type === "checkbox" ? false : "")]));
}

function valueForInput(value: Values[string]) {
  return value === null || value === undefined ? "" : String(value);
}

function displayTitle(item: Values, module: ModuleConfig) {
  if (module.keyField === "id" && item.gameSlug && item.gpuSlug) {
    return `${String(item.gameSlug)} / ${String(item.gpuSlug)} / ${String(item.resolution ?? "")}`;
  }
  return String(item[module.titleField] ?? item[module.keyField] ?? "");
}

export default function AdminUpsertForm() {
  const [moduleKey, setModuleKey] = useState("game");
  const [values, setValues] = useState<Values>(() => defaultValues(modules.game));
  const [items, setItems] = useState<Values[]>([]);
  const [search, setSearch] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [status, setStatus] = useState("");
  const requestSeq = useRef(0);
  const module = modules[moduleKey];
  const moduleEntries = useMemo(() => Object.entries(modules), []);

  useEffect(() => {
    setValues(defaultValues(module));
    setEditingKey(null);
    setSearch("");
    setStatus("");
  }, [moduleKey]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadItems(moduleKey, search);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [moduleKey, search]);

  async function loadItems(collection = moduleKey, query = search) {
    const seq = requestSeq.current + 1;
    requestSeq.current = seq;
    setSearchLoading(true);
    const params = new URLSearchParams({ collection, search: query, limit: "30" });
    try {
      const response = await fetch(`/api/admin/items?${params}`);
      const result = await response.json();
      if (seq !== requestSeq.current) return;
      if (result.success) {
        setItems(result.items);
        if (query.trim()) setStatus(result.items.length ? `Tìm thấy ${result.items.length} gợi ý từ Supabase.` : "Không tìm thấy dữ liệu phù hợp trong Supabase.");
      } else {
        setStatus(`Lỗi tải danh sách: ${result.error}`);
      }
    } catch (error) {
      if (seq !== requestSeq.current) return;
      setStatus(`Lỗi tải danh sách: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (seq === requestSeq.current) setSearchLoading(false);
    }
  }

  function updateValue(name: string, value: string | boolean) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  function selectItem(item: Values) {
    const next = defaultValues(module);
    for (const field of module.fields) next[field.name] = item[field.name] ?? next[field.name];
    setValues(next);
    setEditingKey(String(item[module.keyField] ?? ""));
    setStatus(`Đang sửa: ${displayTitle(item, module)}`);
  }

  function createNew() {
    setValues(defaultValues(module));
    setEditingKey(null);
    setStatus("Đang tạo bản ghi mới.");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("Đang lưu...");
    const form = new FormData();
    form.set("collection", moduleKey);
    form.set("payload", JSON.stringify(module.transform(values)));
    const response = await fetch("/api/admin/upsert", { method: "POST", body: form });
    const result = await response.json();
    if (result.success) {
      setStatus(`Đã lưu ${result.count} bản ghi vào cơ sở dữ liệu.`);
      setEditingKey(String(values[module.keyField] ?? ""));
      await loadItems();
    } else {
      setStatus(`Lỗi: ${result.error}`);
    }
  }

  async function deleteItem(item: Values) {
    const key = String(item[module.keyField] ?? "");
    const title = displayTitle(item, module);
    if (!key || !window.confirm(`Xóa "${title}"? Thao tác này không thể hoàn tác.`)) return;
    const response = await fetch("/api/admin/items", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection: moduleKey, key }) });
    const result = await response.json();
    if (result.success) {
      setStatus(`Đã xóa: ${title}`);
      if (editingKey === key) createNew();
      await loadItems();
    } else {
      setStatus(`Lỗi xóa: ${result.error}`);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[240px_360px_1fr]">
      <aside className="card h-fit p-2">
        {moduleEntries.map(([key, item]) => (
          <button type="button" key={key} onClick={() => setModuleKey(key)} className={"block w-full rounded-md px-3 py-2 text-left text-sm font-bold " + (moduleKey === key ? "bg-blue-600 text-white" : "hover:bg-slate-100 dark:hover:bg-gray-800")}>
            {item.label}
          </button>
        ))}
      </aside>

      <section className="card h-fit p-4">
        <h3 className="text-lg font-black">Tìm kiếm</h3>
        <div className="mt-3 flex gap-2">
          <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Tìm ${module.label.toLowerCase()}...`} />
          <button className="btn" type="button" onClick={() => loadItems()}>Tìm</button>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          {searchLoading ? "Đang tải gợi ý..." : search.trim() ? "Gõ tên, slug, hãng, CPU/GPU hoặc từ khóa liên quan để lọc nhanh." : `Đang hiển thị ${items.length} bản ghi mới nhất.`}
        </p>
        <button type="button" className="mt-3 w-full rounded-md border px-3 py-2 text-sm font-bold" onClick={createNew}>Tạo mới</button>
        <div className="mt-4 max-h-[620px] overflow-auto divide-y dark:divide-gray-700">
          {!searchLoading && items.length === 0 ? <p className="py-4 text-sm text-slate-500">Không có gợi ý phù hợp.</p> : null}
          {items.map((item) => {
            const key = String(item[module.keyField] ?? "");
            const title = displayTitle(item, module);
            return (
              <article key={key} className="py-3">
                <button type="button" className="block w-full text-left font-bold hover:text-blue-600" onClick={() => selectItem(item)}>{title}</button>
                <p className="mt-1 truncate text-xs text-slate-500">{key}</p>
                <div className="mt-2 flex gap-2">
                  <button type="button" className="rounded-md border px-2 py-1 text-xs font-bold" onClick={() => selectItem(item)}>Sửa</button>
                  <button type="button" className="rounded-md border border-red-200 px-2 py-1 text-xs font-bold text-red-600" onClick={() => deleteItem(item)}>Xóa</button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <form onSubmit={submit} className="card p-4">
        <div className="border-b pb-4 dark:border-gray-700">
          <h3 className="text-xl font-black">{editingKey ? "Sửa" : "Thêm"} {module.label.toLowerCase()}</h3>
          <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">{module.description}</p>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {module.fields.map((field) => (
            <label key={field.name} className={(field.type === "textarea" ? "md:col-span-2 " : "") + "grid gap-1 text-sm font-semibold"}>
              {field.label}
              {renderField(field, values[field.name], updateValue)}
            </label>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button className="btn">Lưu</button>
          <button type="button" className="rounded-md border px-3 py-2 text-sm font-bold" onClick={createNew}>Hủy sửa</button>
          {status ? <span className="text-sm font-semibold">{status}</span> : null}
        </div>
      </form>
    </div>
  );
}

function renderField(field: Field, value: Values[string], update: (name: string, value: string | boolean) => void) {
  if (field.type === "textarea") return <textarea className="input min-h-28" name={field.name} value={valueForInput(value)} onChange={(event) => update(field.name, event.target.value)} required={field.required} placeholder={field.placeholder} />;
  if (field.type === "checkbox") return <input className="h-5 w-5" name={field.name} type="checkbox" checked={Boolean(value)} onChange={(event) => update(field.name, event.target.checked)} />;
  if (field.type === "select") return <select className="input" name={field.name} value={valueForInput(value)} onChange={(event) => update(field.name, event.target.value)} required={field.required}>{field.options?.map((option) => <option key={option} value={option}>{option}</option>)}</select>;
  return <input className="input" name={field.name} type={field.type === "number" ? "number" : "text"} step={field.type === "number" ? "any" : undefined} value={valueForInput(value)} onChange={(event) => update(field.name, event.target.value)} required={field.required} placeholder={field.placeholder ?? (field.type === "tags" ? "Nhập cách nhau bằng dấu phẩy" : undefined)} />;
}
