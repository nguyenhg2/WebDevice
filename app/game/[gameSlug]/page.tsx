import GamePage, { generateMetadata, generateStaticParams } from "@/app/chon-game/[gameSlug]/page";

export const revalidate = 86400;
export { generateMetadata, generateStaticParams };
export default GamePage;
