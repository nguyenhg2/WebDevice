import { blogPosts } from "@/lib/data";

export default function Blog() {
  return <section className="container py-8"><h1 className="text-3xl font-black">Bài viết cấu hình trò chơi</h1><div className="mt-5 grid gap-4 md:grid-cols-3">{blogPosts.map((post) => <a className="card p-4" key={post.slug} href={"/blog/" + post.slug}><h2 className="font-bold">{post.title}</h2><p className="mt-2 text-sm text-slate-600 dark:text-gray-300">{post.excerpt}</p></a>)}</div></section>;
}
