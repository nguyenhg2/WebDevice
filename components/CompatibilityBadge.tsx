import type { Status } from "@/types";

export default function CompatibilityBadge({ status }: { status: Status }) {
  const map = {
    smooth: ["Chơi mượt", "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"],
    playable: ["Chơi được", "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"],
    not_recommended: ["Không khuyến nghị", "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"],
  } as const;
  return <span className={"inline-flex rounded-full px-2.5 py-1 text-xs font-bold " + map[status][1]}>{map[status][0]}</span>;
}
