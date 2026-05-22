export default function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  return <div className="mt-6 flex gap-2"><a className="btn" href={"?page=" + Math.max(1, page - 1)}>Trước</a><span className="px-3 py-2">Trang {page}/{totalPages}</span><a className="btn" href={"?page=" + Math.min(totalPages, page + 1)}>Sau</a></div>;
}
