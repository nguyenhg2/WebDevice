"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { isPlaceholderGameImage, splitImageUrls, uniqueImageUrls, type GameImageItem } from "@/lib/game-images";

type ImageForm = {
  slug: string;
  name: string;
  coverImage: string;
  officialUrl: string;
  galleryText: string;
};

const emptyForm: ImageForm = {
  slug: "",
  name: "",
  coverImage: "",
  officialUrl: "",
  galleryText: "",
};

function joinGallery(urls: string[]) {
  return uniqueImageUrls(urls).join("\n");
}

function formFromItem(item: GameImageItem): ImageForm {
  return {
    slug: item.slug,
    name: item.name,
    coverImage: item.coverImage ?? "",
    officialUrl: item.officialUrl ?? "",
    galleryText: item.gallery.join("\n"),
  };
}

export default function AdminGameImageManager() {
  const [items, setItems] = useState<GameImageItem[]>([]);
  const [form, setForm] = useState<ImageForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [issuesOnly, setIssuesOnly] = useState(true);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [issueCount, setIssueCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [canWriteFiles, setCanWriteFiles] = useState(true);
  const [brokenUrls, setBrokenUrls] = useState<Set<string>>(() => new Set());
  const requestSeq = useRef(0);

  const selectedItem = useMemo(() => items.find((item) => item.slug === form.slug) ?? null, [items, form.slug]);
  const gallery = useMemo(() => splitImageUrls(form.galleryText), [form.galleryText]);
  const previews = useMemo(() => uniqueImageUrls([form.coverImage, ...gallery].filter(Boolean)), [form.coverImage, gallery]);
  const currentIssues = selectedItem?.issues ?? [];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadItems();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search, issuesOnly]);

  async function loadItems() {
    const seq = requestSeq.current + 1;
    requestSeq.current = seq;
    setLoading(true);
    const params = new URLSearchParams({
      search,
      issuesOnly: issuesOnly ? "1" : "0",
      limit: "120",
    });

    try {
      const response = await fetch(`/api/admin/game-images?${params}`);
      const result = await response.json();
      if (seq !== requestSeq.current) return;
      if (!result.success) throw new Error(result.error);

      const nextItems = result.items as GameImageItem[];
      setItems(nextItems);
      setIssueCount(Number(result.issueCount ?? 0));
      setTotalCount(Number(result.total ?? 0));
      setCanWriteFiles(result.canWriteFiles !== false);
      if (!form.slug && nextItems[0]) selectItem(nextItems[0]);
      if (!nextItems.length) setStatus("Không có game phù hợp với bộ lọc hiện tại.");
    } catch (error) {
      if (seq !== requestSeq.current) return;
      setStatus(`Lỗi tải ảnh: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }

  function selectItem(item: GameImageItem) {
    setForm(formFromItem(item));
    setBrokenUrls(new Set());
    setStatus(`Đang sửa: ${item.name}`);
  }

  function updateField(name: keyof ImageForm, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function useFirstGalleryAsCover() {
    const firstGood = gallery.find((url) => !isPlaceholderGameImage(url)) ?? gallery[0];
    if (!firstGood) {
      setStatus("Gallery chưa có ảnh để dùng làm bìa.");
      return;
    }
    updateField("coverImage", firstGood);
    setStatus("Đã đưa ảnh gallery đầu tiên vào ảnh bìa.");
  }

  function addCoverToGallery() {
    if (!form.coverImage.trim()) {
      setStatus("Chưa có ảnh bìa để thêm vào gallery.");
      return;
    }
    updateField("galleryText", joinGallery([form.coverImage, ...gallery]));
    setStatus("Đã thêm ảnh bìa vào đầu gallery.");
  }

  function cleanupGallery() {
    const cleaned = gallery.filter((url) => !isPlaceholderGameImage(url));
    if (!cleaned.length) {
      setStatus("Không xóa vì gallery sẽ trống. Hãy thêm ảnh thật trước.");
      return;
    }
    updateField("galleryText", joinGallery(cleaned));
    setStatus(`Đã lọc ${gallery.length - cleaned.length} ảnh nghi ngờ khỏi gallery.`);
  }

  function removeGalleryUrl(url: string) {
    updateField("galleryText", joinGallery(gallery.filter((item) => item !== url)));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.slug) return;
    setSaving(true);
    setStatus("Đang lưu ảnh...");

    try {
      const response = await fetch("/api/admin/game-images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug,
          coverImage: form.coverImage,
          officialUrl: form.officialUrl,
          gallery,
        }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);

      const saved = result.item as GameImageItem;
      setItems((current) => current.map((item) => (item.slug === saved.slug ? saved : item)));
      setForm(formFromItem(saved));
      setBrokenUrls(new Set());
      setStatus(`Đã lưu ảnh cho ${saved.name}. Cần deploy lại để production nhận dữ liệu mới.`);
    } catch (error) {
      setStatus(`Lỗi lưu ảnh: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="surface h-fit p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black">Danh sách game</h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
              {issueCount}/{totalCount} game cần kiểm tra ảnh.
            </p>
          </div>
          <button type="button" className="btn-secondary min-h-9 px-3 py-2 text-sm" onClick={() => loadItems()}>
            Tải lại
          </button>
        </div>

        {!canWriteFiles ? (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
            Môi trường này không cho ghi file data. Hãy sửa ở local rồi deploy lại.
          </div>
        ) : null}

        <div className="mt-4 grid gap-3">
          <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm tên, slug hoặc URL ảnh..." />
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={issuesOnly} onChange={(event) => setIssuesOnly(event.target.checked)} />
            Chỉ hiện game có vấn đề ảnh
          </label>
        </div>

        <div className="mt-4 max-h-[660px] overflow-auto divide-y divide-slate-100 dark:divide-gray-800">
          {loading ? <p className="py-4 text-sm text-slate-500">Đang tải...</p> : null}
          {!loading && !items.length ? <p className="py-4 text-sm text-slate-500">Không có game phù hợp.</p> : null}
          {items.map((item) => (
            <article key={item.slug} className="grid gap-2 py-3">
              <button type="button" className="text-left" onClick={() => selectItem(item)}>
                <span className={"font-bold hover:text-teal-700 dark:hover:text-teal-300 " + (form.slug === item.slug ? "text-teal-700 dark:text-teal-300" : "")}>{item.name}</span>
                <span className="mt-1 block text-xs text-slate-500">{item.slug}</span>
              </button>
              {item.issues.length ? (
                <div className="flex flex-wrap gap-1">
                  {item.issues.slice(0, 3).map((issue) => (
                    <span key={issue} className="rounded-md bg-amber-100 px-2 py-1 text-xs font-bold text-amber-800">
                      {issue}
                    </span>
                  ))}
                  {item.issues.length > 3 ? <span className="text-xs font-bold text-slate-500">+{item.issues.length - 3}</span> : null}
                </div>
              ) : (
                <span className="text-xs font-bold text-emerald-700">Ảnh ổn</span>
              )}
            </article>
          ))}
        </div>
      </section>

      <form onSubmit={submit} className="surface p-4">
        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 pb-4 dark:border-gray-700">
          <div>
            <h3 className="text-xl font-black">{form.name || "Chọn game để sửa ảnh"}</h3>
            {form.slug ? <p className="mt-1 text-sm text-slate-500">{form.slug}</p> : null}
          </div>
          <button className="btn" disabled={!form.slug || saving}>
            {saving ? "Đang lưu..." : "Lưu ảnh"}
          </button>
        </div>

        {!form.slug ? (
          <p className="mt-4 text-sm text-slate-600 dark:text-gray-300">Chọn một game ở danh sách bên trái để bắt đầu.</p>
        ) : (
          <>
            <div className="mt-4 grid gap-4">
              <label className="grid gap-1 text-sm font-semibold">
                URL ảnh bìa
                <input className="input" value={form.coverImage} onChange={(event) => updateField("coverImage", event.target.value)} placeholder="https://.../cover.jpg hoặc /images/games/name.svg" />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Trang chính thức
                <input className="input" value={form.officialUrl} onChange={(event) => updateField("officialUrl", event.target.value)} placeholder="https://..." />
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Gallery, mỗi dòng một URL
                <textarea className="input min-h-44 font-mono text-xs" value={form.galleryText} onChange={(event) => updateField("galleryText", event.target.value)} />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" className="btn-secondary min-h-9 px-3 py-2 text-sm" onClick={useFirstGalleryAsCover}>
                Lấy gallery làm bìa
              </button>
              <button type="button" className="btn-secondary min-h-9 px-3 py-2 text-sm" onClick={addCoverToGallery}>
                Thêm bìa vào gallery
              </button>
              <button type="button" className="btn-secondary min-h-9 px-3 py-2 text-sm" onClick={cleanupGallery}>
                Lọc ảnh nghi ngờ
              </button>
              <button type="button" className="btn-secondary min-h-9 px-3 py-2 text-sm" onClick={() => setBrokenUrls(new Set())}>
                Kiểm tra lại preview
              </button>
            </div>

            {currentIssues.length ? (
              <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                <p className="font-black">Cần xử lý</p>
                <ul className="mt-2 list-inside list-disc">
                  {currentIssues.map((issue) => (
                    <li key={issue}>{issue}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <section className="mt-5">
              <h4 className="font-black">Preview</h4>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {previews.map((url, index) => {
                  const broken = brokenUrls.has(url);
                  return (
                    <figure key={url} className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-gray-700 dark:bg-gray-900">
                      <div className="relative aspect-[16/9] bg-slate-200 dark:bg-gray-800">
                        {broken ? (
                          <div className="flex h-full items-center justify-center px-3 text-center text-sm font-bold text-rose-700">Không tải được ảnh</div>
                        ) : (
                          <img
                            src={url}
                            alt={`${form.name} ảnh ${index + 1}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            onError={() => setBrokenUrls((current) => new Set(current).add(url))}
                          />
                        )}
                      </div>
                      <figcaption className="grid gap-2 p-2 text-xs">
                        <span className="truncate font-mono" title={url}>
                          {url}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          {url === form.coverImage ? <span className="rounded bg-teal-100 px-2 py-1 font-bold text-teal-800">Bìa</span> : null}
                          {isPlaceholderGameImage(url) ? <span className="rounded bg-amber-100 px-2 py-1 font-bold text-amber-800">Nghi ngờ</span> : null}
                          {gallery.includes(url) ? (
                            <button type="button" className="rounded border px-2 py-1 font-bold" onClick={() => removeGalleryUrl(url)}>
                              Xóa khỏi gallery
                            </button>
                          ) : null}
                        </div>
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </section>
          </>
        )}

        {status ? <p className="mt-4 text-sm font-semibold">{status}</p> : null}
      </form>
    </div>
  );
}
