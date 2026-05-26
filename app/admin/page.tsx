import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminDataQualityPanel from "@/components/AdminDataQualityPanel";
import AdminGameImageManager from "@/components/AdminGameImageManager";
import AdminUpsertForm from "@/components/AdminUpsertForm";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { benchmarks, blogPosts, cpus, devices, gameImages, games, gpus } from "@/lib/data";
import { getGameImageIssues } from "@/lib/game-images";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const admin = verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!admin) redirect("/admin/login");

  const imageIssueCount = games.filter((game) => getGameImageIssues(game, gameImages[game.slug] ?? []).length > 0).length;
  const videoCount = benchmarks.filter((row) => row.videoTestUrl).length;
  const stats = [
    ["Game", games.length.toLocaleString("vi-VN")],
    ["GPU", gpus.length.toLocaleString("vi-VN")],
    ["Benchmark", benchmarks.length.toLocaleString("vi-VN")],
    ["Video test", videoCount.toLocaleString("vi-VN")],
    ["Ảnh cần sửa", imageIssueCount.toLocaleString("vi-VN")],
    ["Laptop/PC", devices.length.toLocaleString("vi-VN")],
    ["CPU", cpus.length.toLocaleString("vi-VN")],
    ["Bài viết", blogPosts.length.toLocaleString("vi-VN")],
  ];

  return (
    <main className="container page-section">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Admin</p>
          <h1 className="mt-2 text-4xl font-black">Quản trị dữ liệu</h1>
          <p className="mt-2 max-w-3xl text-slate-600 dark:text-gray-300">
            Đăng nhập: {admin.email}. Ưu tiên sửa ảnh, bổ sung video test và kiểm tra coverage benchmark.
          </p>
        </div>
        <form action="/api/admin/logout" method="post">
          <button className="btn-secondary">Đăng xuất</button>
        </form>
      </header>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div className="surface p-4" key={label}>
            <p className="text-sm text-slate-500 dark:text-gray-400">{label}</p>
            <p className="mt-1 text-3xl font-black">{value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8">
        <SectionHeader title="Chất lượng dữ liệu" description="Theo dõi catalog đang dùng cho production: game, GPU, FPS, ảnh và video test." />
        <AdminDataQualityPanel />
      </section>

      <section id="admin-images" className="mt-8 scroll-mt-24">
        <SectionHeader title="Ảnh game" description="Sửa cover và gallery cho các game có ảnh lỗi, logo, thumbnail hoặc placeholder." />
        <AdminGameImageManager />
      </section>

      <section id="admin-editor" className="mt-8 scroll-mt-24">
        <SectionHeader title="Nhập liệu nâng cao" description="Chỉnh sửa game, GPU, CPU, thiết bị, benchmark và bài viết trong Supabase." />
        <AdminUpsertForm />
      </section>
    </main>
  );
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-2xl font-black">{title}</h2>
      <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
