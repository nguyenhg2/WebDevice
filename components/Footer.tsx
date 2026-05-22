import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-10 text-sm dark:border-gray-700 dark:bg-gray-900">
      <div className="container grid gap-6 md:grid-cols-4">
        <div>
          <b>Maynaychoiduoc.vn</b>
          <p className="mt-2 text-slate-600 dark:text-gray-300">Tra cứu cấu hình game, FPS và gợi ý nâng cấp cho người dùng Việt Nam.</p>
        </div>
        <div>
          <b>Công cụ</b>
          <p><Link href="/tra-cuu">Tra cứu cấu hình</Link></p>
          <p><Link href="/benchmark">Benchmark FPS</Link></p>
          <p><Link href="/chon-game">Chọn game</Link></p>
        </div>
        <div>
          <b>Liên kết</b>
          <p><Link href="/gpu">Danh sách GPU</Link></p>
          <p><Link href="/laptop">Laptop theo tầm giá</Link></p>
          <p><Link href="/affiliate-disclosure">Affiliate Disclosure</Link></p>
        </div>
        <div>
          <b>Thông tin</b>
          <p><Link href="/gioi-thieu">Giới thiệu</Link></p>
          <p><Link href="/lien-he">Liên hệ</Link></p>
          <p><Link href="/chinh-sach-bao-mat">Chính sách bảo mật</Link></p>
          <p><Link href="/dieu-khoan-su-dung">Điều khoản sử dụng</Link></p>
        </div>
      </div>
      <div className="container mt-8 text-slate-500">© 2026 Maynaychoiduoc.vn</div>
    </footer>
  );
}
