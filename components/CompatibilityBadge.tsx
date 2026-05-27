import type { Status } from "@/types";

const statusMap: Record<Status, { label: string; className: string }> = {
  smooth: {
    label: "Mượt",
    className: "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  },
  playable: {
    label: "Được",
    className: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  },
  not_recommended: {
    label: "Yếu",
    className: "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-100",
  },
};

export default function CompatibilityBadge({ status }: { status: Status }) {
  const item = statusMap[status];
  return <span className={"inline-flex rounded-full border px-2.5 py-1 text-xs font-black shadow-sm " + item.className}>{item.label}</span>;
}
