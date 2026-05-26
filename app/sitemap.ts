import type { MetadataRoute } from "next";
import { blogPosts, games, gpus } from "@/lib/data";

const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fpsviet.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticUrls = [
    "",
    "/tra-cuu",
    "/benchmark",
    "/chon-game",
    "/gpu",
    "/blog",
    "/game-mien-phi-cho-may-yeu",
    "/game-nhe-duoi-2gb",
    "/game-nhe-duoi-5gb",
    "/game-nhe-duoi-10gb",
  ].map((path) => ({ url: site + path, lastModified: new Date() }));

  return staticUrls.concat(
    games.map((game) => ({ url: site + "/game/" + game.slug, lastModified: new Date() })),
    gpus.map((gpu) => ({ url: site + "/gpu/" + gpu.slug, lastModified: new Date() })),
    blogPosts.map((post) => ({ url: site + "/blog/" + post.slug, lastModified: new Date() })),
    games.flatMap((game) => gpus.map((gpu) => ({ url: site + "/game/" + game.slug + "/" + gpu.slug, lastModified: new Date() }))),
  );
}
