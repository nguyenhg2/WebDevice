# Maynaychoiduoc.vn

Nen tang tra cuu game theo cau hinh PC/laptop cho thi truong Viet Nam, dung Next.js 15, TypeScript, Tailwind CSS 4, Supabase, Redis Cloud va Vercel free tier. Cac luong chinh gom tra cuu cau hinh, benchmark FPS, build PC theo ngan sach/game muc tieu, danh muc GPU/laptop va SEO pages.

## Cai dat

```bash
npm install
cp .env.local.example .env.local
npm run prisma:generate
npm run seed
npm run dev
```

Bien moi truong can cau hinh tren Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `SHOPEE_AFFILIATE_ID`
- `TIKI_AFFILIATE_ID`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_SITE_URL`

## Du lieu

Du lieu seed nam trong `data/`: 132 game, 87 GPU, 30 CPU, 30 thiet bi, hon 3.400 benchmark va 20 bai blog.

Trang `/build-pc` tham khao mo hinh quick/guided builder cua DropReference: nguoi dung chon ngan sach, game, do phan giai, FPS, setting va nhu cau su dung; engine noi bo se xep hang combo GPU/CPU, may co san va phuong an thay the dua tren du lieu benchmark trong `data/`.

Game co the cap nhat tu nguon that bang:

```bash
npm run data:scrape
```

Script `scripts/scrape-real-game-data.mjs` lay du lieu tu Steam Store API voi vung `vn`, fallback `us` neu game bi gioi han vung. Cac game khong co tren Steam duoc gan website chinh thuc cua nha phat hanh. Nguon cua tung game nam trong `data/game-sources.json`.

Bo sung game, anh va FPS benchmark tu DropReference bang:

```bash
npm run data:dropreference
```

Script `scripts/scrape-dropreference-data.mjs` doc trang `https://dropreference.com/en/benchmarks`, cac trang chi tiet game, roi merge game moi, gallery anh, nguon anh va FPS 1080p medium vao cac file `data/` hien co.

Neu moi truong Codex bi chan network sandbox, chay truc tiep tren Windows:

```bat
scripts\run-dropreference-import.cmd
```

Runner nay goi importer DropReference o che do lay toan bo benchmark catalog tim thay qua pagination va sitemap, ghi log vao `data/dropreference-import.log`, tao tom tat `data/dropreference-import-summary.json`, roi chay `npm run build` de kiem tra du lieu sau khi merge.

Bo sung lop du lieu FPS ngoai de admin duyet bang:

```bash
npm run data:fps-sources
```

Script nay doc FPS cong khai tu PCGameBenchmark vao `data/external-fps-samples.json`, cap nhat tinh trang nguon trong `data/data-source-status.json`, va khong bypass Cloudflare/robots.txt. HowManyFPS va PC-Builds se duoc ghi nhan neu bi browser verification chan; UserBenchmark bi tat truc tiep vi robots.txt `Disallow: /`.

## Deploy

Day repo len GitHub, import vao Vercel, cau hinh cac bien moi truong trong `.env.local.example`, sau do deploy. Sitemap nam tai `/sitemap.xml`, robots tai `/robots.txt`.
