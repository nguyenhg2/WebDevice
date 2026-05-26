export default async function AdminLoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams;

  return (
    <main className="container grid min-h-[70vh] max-w-md place-items-center py-10">
      <section className="surface w-full p-6">
        <p className="eyebrow">Admin</p>
        <h1 className="mt-2 text-3xl font-black">Đăng nhập quản trị</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-gray-300">Dùng tài khoản quản trị đã cấu hình trong môi trường triển khai.</p>
        {params.error ? <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700">Sai email hoặc mật khẩu.</p> : null}
        <form action="/api/admin/login" method="post" className="mt-5 grid gap-3">
          <label className="grid gap-1 text-sm font-semibold">
            Email
            <input className="input" name="email" type="email" defaultValue="admin@fpsviet.com" required />
          </label>
          <label className="grid gap-1 text-sm font-semibold">
            Mật khẩu
            <input className="input" name="password" type="password" required />
          </label>
          <button className="btn">Đăng nhập</button>
        </form>
      </section>
    </main>
  );
}
