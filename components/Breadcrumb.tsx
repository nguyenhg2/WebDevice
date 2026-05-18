import Link from "next/link";
export default function Breadcrumb({items}:{items:{href:string;label:string}[]}){ return <nav aria-label="Breadcrumb" className="mb-4 text-sm text-slate-500">{items.map((it,i)=><span key={it.href}>{i>0?" > ":""}<Link href={it.href}>{it.label}</Link></span>)}</nav> }
