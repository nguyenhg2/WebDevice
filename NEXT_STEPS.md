# NEXT_STEPS

## Trang thai hien tai

- Ten hien thi: `Fpsviet.com`.
- Project Vercel `web-device` da ket noi voi GitHub repo `nguyenhg2/WebDevice`.
- Push len nhanh `main` se tu dong build/deploy qua Vercel Git Integration.
- GitHub Actions chay `npm run verify` de bat loi data/type/build som.
- `fpsviet.com` va `www.fpsviet.com` da duoc them vao project Vercel, nhung DNS nha cung cap domain van chua tro ve Vercel.
- `NEXT_PUBLIC_SITE_URL` tren Vercel da cap nhat thanh `https://fpsviet.com`.
- Du lieu van theo chinh sach an toan: chi giu game co anh va benchmark FPS, khong luu URL nguon benchmark tu website canh tranh.

## Quy trinh moi

1. Sua code hoac data.
2. Chay kiem tra local:

```bash
npm run verify
```

3. Commit va push len `main`. Vercel se tu deploy production.
4. Neu can deploy thu cong tu may local:

```bash
npm run deploy
```

## Viec can theo doi

1. Bo sung `videoTestUrl` that cho cac dong benchmark quan trong nhat.
2. Duyet `data/game-expansion-candidates.json` de them game moi vao catalog.
3. Kiem tra anh cover/gallery cua game co dau hieu logo, thumbnail hoac placeholder.
4. Doi DNS domain tai nha cung cap ten mien:
   - `A fpsviet.com 76.76.21.21`
   - `A www.fpsviet.com 76.76.21.21`

## File nguon ngoai dang bi vo hieu hoa

- `data/external-fps-samples.json`
- `data/data-source-status.json`
- `data/game-sources.json`
- `data/game-image-sources.json`
- `data/game-image-source-packs.json`
