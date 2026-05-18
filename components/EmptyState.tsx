export default function EmptyState({message="Không có kết quả phù hợp."}:{message?:string}){ return <div className="card p-6 text-center text-slate-600 dark:text-gray-300">{message}</div> }
