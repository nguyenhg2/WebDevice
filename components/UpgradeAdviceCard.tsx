import { getUpgradeAffiliateLinks } from "@/lib/affiliate";

export default function UpgradeAdviceCard({ advice }: { advice: string }) {
  const url = getUpgradeAffiliateLinks(advice, "linh kiện").shopee;
  return <article className="card p-4"><h3 className="font-bold">Gợi ý nâng cấp</h3><p className="mt-2 text-sm text-slate-700 dark:text-gray-200">{advice}</p><a className="btn mt-3" href={url} target="_blank" rel="nofollow sponsored">Tìm linh kiện</a></article>;
}
