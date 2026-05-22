import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminGameImageManager from "@/components/AdminGameImageManager";
import AdminDataQualityPanel from "@/components/AdminDataQualityPanel";
import AdminUpsertForm from "@/components/AdminUpsertForm";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { benchmarks, blogPosts, cpus, devices, gameImages, games, gpus } from "@/lib/data";
import { getGameImageIssues } from "@/lib/game-images";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const admin = verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!admin) redirect("/admin/login");

  const remoteImages = games.filter((game) => /^https?:\/\//.test(game.coverImage || "")).length;
  const freeGames = games.filter((game) => game.isFree).length;
  const steamGames = games.filter((game) => game.steamId).length;
  const imageIssueCount = games.filter((game) => getGameImageIssues(game, gameImages[game.slug] ?? []).length > 0).length;
  const stats = [
    ["Game", games.length],
    ["Game có ảnh thật", remoteImages],
    ["Game cần sửa ảnh", imageIssueCount],
    ["Game Steam", steamGames],
    ["Game miễn phí", freeGames],
    ["GPU", gpus.length],
    ["CPU", cpus.length],
    ["Thiết bị", devices.length],
    ["Benchmark", benchmarks.length],
    ["Bài viết", blogPosts.length],
  ];

  return (
    <section className="container py-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black">Quản trị Maynaychoiduoc.vn</h1>
          <p className="mt-2 max-w-4xl text-slate-600 dark:text-gray-300">
            Đăng nhập: {admin.email}. Ưu tiên dùng phần Ảnh game để sửa nhanh game bị ảnh bìa lỗi, gallery thiếu ảnh thật hoặc còn placeholder.
          </p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="rounded-md border px-3 py-2 text-sm font-bold">Đăng xuất</button>
        </form>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(([label, value]) => (
          <div className="card p-4" key={label}>
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-black">Chất lượng dữ liệu</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            Kiểm tra coverage benchmark, tình trạng nguồn cào dữ liệu và các mẫu FPS ngoài cần duyệt trước khi nhập vào benchmark chính.
          </p>
        </div>
        <AdminDataQualityPanel />
      </section>

      <section className="mt-8">
        <div className="mb-4">
          <h2 className="text-2xl font-black">Ảnh game</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            Sửa ảnh bìa và gallery trong các file dữ liệu tĩnh đang được frontend sử dụng. Khi sửa ở local, hãy deploy lại để production nhận dữ liệu mới.
          </p>
        </div>
        <AdminGameImageManager />
      </section>

      <section className="mt-8">
        <details className="card p-4">
          <summary className="cursor-pointer text-2xl font-black">Dữ liệu khác</summary>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            Form này lưu game, GPU, CPU, thiết bị, benchmark và blog vào Supabase/Postgres qua <code>DATABASE_URL</code> hoặc <code>ADMIN_DATABASE_URL</code>.
          </p>
          <div className="mt-4">
            <AdminUpsertForm />
          </div>
        </details>
      </section>
    </section>
  );
}
