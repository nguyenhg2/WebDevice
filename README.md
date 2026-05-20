# Maynaychoiduoc.vn

Nen tang tra cuu game theo cau hinh PC/laptop cho thi truong Viet Nam, dung Next.js 15, TypeScript, Tailwind CSS 4, Supabase, Redis Cloud va Vercel free tier.

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

Du lieu seed nam trong `data/`: 100 game, 50 GPU, 30 CPU, 30 thiet bi, hon 500 benchmark va 20 bai blog.

Game co the cap nhat tu nguon that bang:

```bash
npm run data:scrape
```

Script `scripts/scrape-real-game-data.mjs` lay du lieu tu Steam Store API voi vung `vn`, fallback `us` neu game bi gioi han vung. Cac game khong co tren Steam duoc gan website chinh thuc cua nha phat hanh. Nguon cua tung game nam trong `data/game-sources.json`.

## Deploy

Day repo len GitHub, import vao Vercel, cau hinh cac bien moi truong trong `.env.local.example`, sau do deploy. Sitemap nam tai `/sitemap.xml`, robots tai `/robots.txt`.
