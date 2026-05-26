export default function FpsBar({ fps }: { fps: number }) {
  const width = Math.min(100, Math.max(8, Math.round((fps / 140) * 100)));
  const tone = fps >= 75 ? "bg-emerald-500" : fps >= 45 ? "bg-amber-500" : "bg-rose-500";

  return (
    <div aria-label={`FPS ước tính ${fps}`} className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-gray-700">
      <div className={"h-2 rounded-full " + tone} style={{ width: width + "%" }} />
    </div>
  );
}
