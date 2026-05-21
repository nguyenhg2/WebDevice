import { blogPosts, findPost } from "@/lib/data";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = findPost(slug);
  return { title: post?.metaTitle, description: post?.metaDescription };
}
export default async function Post({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return <section className="container py-8"><h1>Không tìm thấy bài viết</h1></section>;
  return <section className="container grid gap-8 py-8 lg:grid-cols-[1fr_300px]"><article><h1 className="text-3xl font-black">{post.title}</h1><div className="prose mt-5 dark:prose-invert" dangerouslySetInnerHTML={{ __html: post.content }} /></article><aside className="card p-4"><h2 className="font-bold">Bài viết liên quan</h2>{blogPosts.slice(0, 6).map((item) => <a className="mt-3 block text-sm" key={item.slug} href={"/blog/" + item.slug}>{item.title}</a>)}<a className="btn mt-4" href="/tra-cuu">Tra cứu nhanh</a></aside><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@type": "Article", headline: post.title, datePublished: post.publishedAt }) }} /></section>;
}
