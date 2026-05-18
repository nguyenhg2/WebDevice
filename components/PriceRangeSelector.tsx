import { priceRangeLabel } from "@/lib/utils";
export default function PriceRangeSelector({active}:{active?:string}){ return <div className="flex flex-wrap gap-2">{Object.entries(priceRangeLabel).map(([k,v])=><a key={k} href={"?priceRange="+k} className={"rounded-md border px-3 py-2 text-sm font-semibold "+(active===k?"bg-blue-600 text-white":"")}>{v}</a>)}</div> }
