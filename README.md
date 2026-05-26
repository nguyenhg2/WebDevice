# Fpsviet.com

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

Du lieu seed nam trong `data/`: game co anh that, GPU co benchmark, thiet bi co GPU ton tai trong catalog, benchmark FPS noi bo va blog huong dan. Catalog khong luu link nguon benchmark tu website canh tranh; cot URL nguon da duoc loai bo. Neu can kiem chung FPS, chi dung `videoTestUrl` la link video test da duyet hoac link tim kiem YouTube tao o frontend.

Cap nhat thong tin game tu nguon chinh thuc bang:

```bash
npm run data:scrape
```

Cap nhat gallery anh bang:

```bash
npm run data:images
```

Phat hien game moi tu sitemap cong khai cua cac site tham khao bang:

```bash
npm run data:discover-games
```

Lenh nay chi tao `data/game-expansion-candidates.json` de admin duyet them game. File candidate khong luu FPS, khong luu URL nguon ngoai va khong duoc dung truc tiep trong frontend. Benchmark chinh chi nhan FPS noi bo, video test da duyet hoac so lieu da duoc kiem chung/duoc cap quyen.

Kiem tra du lieu, typecheck va build truoc deploy:

```bash
npm run verify
```

Cap nhat va build bang mot lenh:

```bash
npm run data:update
```

## Deploy

Project Vercel `web-device` da ket noi voi GitHub repo `nguyenhg2/WebDevice`, nen moi lan push len `main` se tu dong build/deploy tren Vercel. Neu can deploy thu cong tu may local:

```bash
npm run deploy
```

Can cau hinh cac bien moi truong trong Vercel theo `.env.local.example`. Sitemap nam tai `/sitemap.xml`, robots tai `/robots.txt`.

Domain production hien tai tren Vercel: `https://web-device-jade.vercel.app`.
