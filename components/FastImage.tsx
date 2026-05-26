import Image, { type ImageProps } from "next/image";

const blurDataUrl =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nMTYnIGhlaWdodD0nOScgdmlld0JveD0nMCAwIDE2IDknIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zyc+PHJlY3Qgd2lkdGg9JzE2JyBoZWlnaHQ9JzknIGZpbGw9JyNlMmU4ZjAnLz48L3N2Zz4=";

type FastImageProps = Omit<ImageProps, "src" | "placeholder" | "blurDataURL" | "unoptimized"> & {
  src?: string | null;
};

export default function FastImage({ src, alt, quality = 64, loading, priority, ...props }: FastImageProps) {
  const imageSrc = src || "/images/placeholder.svg";
  const isSvg = imageSrc.endsWith(".svg");
  const isRemote = imageSrc.startsWith("http://") || imageSrc.startsWith("https://");

  return (
    <Image
      {...props}
      src={imageSrc}
      alt={alt}
      quality={quality}
      priority={priority}
      loading={priority ? undefined : (loading ?? "lazy")}
      decoding="async"
      placeholder={isSvg ? undefined : "blur"}
      blurDataURL={isSvg ? undefined : blurDataUrl}
      unoptimized={isSvg || isRemote}
    />
  );
}
