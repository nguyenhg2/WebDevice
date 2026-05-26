import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white/90 py-10 text-sm dark:border-gray-800 dark:bg-gray-950/90">
      <div className="container grid gap-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <b className="text-base">Fpsviet.com</b>
          <p className="mt-2 max-w-sm text-slate-600 dark:text-gray-300">
            Tra FPS, chọn game theo cấu hình và tìm laptop/PC phù hợp cho người dùng Việt Nam.
          </p>
        </div>
        <FooterGroup title="Công cụ" links={[["/tra-cuu", "Kiểm tra máy"], ["/benchmark", "Bảng FPS"], ["/chon-game", "Danh sách game"]]} />
        <FooterGroup title="Mua máy" links={[["/laptop", "Laptop gợi ý"], ["/build-pc", "Build PC"], ["/gpu", "Danh sách GPU"]]} />
        <FooterGroup title="Thông tin" links={[["/gioi-thieu", "Giới thiệu"], ["/lien-he", "Liên hệ"], ["/affiliate-disclosure", "Affiliate"]]} />
      </div>
      <div className="container mt-8 text-slate-500">© 2026 Fpsviet.com</div>
    </footer>
  );
}

function FooterGroup({ title, links }: { title: string; links: Array<[string, string]> }) {
  return (
    <div>
      <b>{title}</b>
      <div className="mt-2 grid gap-2 text-slate-600 dark:text-gray-300">
        {links.map(([href, label]) => (
          <Link key={href} href={href} className="hover:text-teal-700 dark:hover:text-teal-300">
            {label}
          </Link>
        ))}
      </div>
    </div>
  );
}
