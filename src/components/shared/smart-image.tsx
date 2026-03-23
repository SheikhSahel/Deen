import Image, { ImageProps } from "next/image";

interface SmartImageProps extends Omit<ImageProps, "sizes"> {
  priority?: boolean;
}

export function SmartImage({
  alt,
  priority = false,
  quality = 85,
  ...props
}: SmartImageProps) {
  return (
    <Image
      alt={alt}
      quality={quality}
      priority={priority}
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 75vw, 50vw"
      {...props}
    />
  );
}
