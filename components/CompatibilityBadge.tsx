import type { Status } from "@/types";

const statusMap: Record<Status, { label: string; className: string }> = {
  smooth: {
    label: "Mượt",
    className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-100",
  },
  playable: {
    label: "Chơi được",
    className: "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100",
  },
  not_recommended: {
    label: "Yếu",
    className: "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-100",
  },
};

export default function CompatibilityBadge({ status }: { status: Status }) {
  const item = statusMap[status];
  return <span className={"inline-flex rounded-full px-2.5 py-1 text-xs font-black " + item.className}>{item.label}</span>;
}
