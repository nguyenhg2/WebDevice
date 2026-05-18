# MáyNàyChơiĐược.vn

Nền tảng tra cứu game theo cấu hình PC/laptop cho thị trường Việt Nam, dùng Next.js 15, TypeScript, Tailwind CSS 4, Supabase, Redis Cloud và Vercel free tier.

## Cài đặt

```bash
npm install
cp .env.local.example .env.local
npm run prisma:generate
npm run seed
npm run dev
```

Các biến môi trường cần cấu hình trên Vercel:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`
- `REDIS_URL`
- `SHOPEE_AFFILIATE_ID`
- `TIKI_AFFILIATE_ID`
- `NEXT_PUBLIC_GA_ID`
- `NEXT_PUBLIC_SITE_URL`

## Dữ liệu

Dữ liệu seed nằm trong `data/`: 100 game, 50 GPU, 30 CPU, 30 thiết bị, hơn 500 benchmark và 20 bài blog.

## Deploy

Đẩy repo lên GitHub, import vào Vercel, cấu hình các biến môi trường trong `.env.local.example`, sau đó deploy. Sitemap nằm tại `/sitemap.xml`, robots tại `/robots.txt`.
