import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AdminUpsertForm from "@/components/AdminUpsertForm";
import { ADMIN_COOKIE, verifyAdminToken } from "@/lib/admin-auth";
import { benchmarks, blogPosts, cpus, devices, games, gpus } from "@/lib/data";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const admin = verifyAdminToken(cookieStore.get(ADMIN_COOKIE)?.value);
  if (!admin) redirect("/admin/login");

  const remoteImages = games.filter((game) => /^https?:\/\//.test(game.coverImage || "")).length;
  const freeGames = games.filter((game) => game.isFree).length;
  const steamGames = games.filter((game) => game.steamId).length;
  const stats = [
    ["Game", games.length],
    ["Game có ảnh thật", remoteImages],
    ["Game Steam", steamGames],
    ["Game miễn phí", freeGames],
    ["GPU", gpus.length],
    ["CPU", cpus.length],
    ["Thiết bị", devices.length],
    ["Benchmark", benchmarks.length],
    ["Bài viết", blogPosts.length],
  ];

  return <section className="container py-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-3xl font-black">Quản trị Maynaychoiduoc.vn</h1><p className="mt-2 text-slate-600 dark:text-gray-300">Đăng nhập: {admin.email}. Quản lý dữ liệu bằng form trực quan, xem thống kê nhanh và lưu vào cơ sở dữ liệu.</p></div><form action="/api/admin/logout" method="post"><button className="rounded-md border px-3 py-2 text-sm font-bold">Đăng xuất</button></form></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([label, value]) => <div className="card p-4" key={label}><p className="text-sm text-slate-500">{label}</p><p className="mt-1 text-3xl font-black">{value}</p></div>)}</div><h2 className="mt-8 text-2xl font-black">Cập nhật dữ liệu thủ công</h2><p className="mt-2 text-sm text-slate-600 dark:text-gray-300">Chọn mục dữ liệu, nhập từng trường và bấm lưu. Dữ liệu được ghi trực tiếp vào Supabase/Postgres qua `DATABASE_URL`.</p><div className="mt-4"><AdminUpsertForm /></div></section>;
}
