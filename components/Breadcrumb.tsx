import Link from "next/link";

export default function Breadcrumb({ items }: { items: { href: string; label: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-slate-500 dark:text-gray-400">
      {items.map((item, index) => (
        <span key={`${item.href}-${item.label}`}>
          {index > 0 ? <span className="mx-2">/</span> : null}
          {index === items.length - 1 ? <span>{item.label}</span> : <Link href={item.href}>{item.label}</Link>}
        </span>
      ))}
    </nav>
  );
}
