export default function NotFound() {
  return (
    <section className="container py-16">
      <h1 className="text-3xl font-black">Không tìm thấy trang</h1>
      <p className="mt-3">Trang bạn cần có thể đã đổi địa chỉ hoặc không tồn tại.</p>
      <a className="btn mt-5" href="/">
        Về trang chủ
      </a>
    </section>
  );
}
