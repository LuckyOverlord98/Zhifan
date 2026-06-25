import { optimizedImages } from "../data/imageManifest.js";

function OptimizedImage({ src, alt, className, loading = "lazy", sizes = "(max-width: 760px) 100vw, 50vw", ...props }) {
  const image = optimizedImages[src];

  if (!image || !image.variants?.length) {
    return <img src={src} alt={alt} className={className} loading={loading} {...props} />;
  }

  const srcSet = image.variants.map((variant) => `${variant.src} ${variant.width}w`).join(", ");

  return (
    <picture className="optimized-picture">
      <source type="image/webp" srcSet={srcSet} sizes={sizes} />
      <img
        src={image.fallback || src}
        alt={alt}
        className={className}
        loading={loading}
        width={image.width}
        height={image.height}
        decoding={loading === "eager" ? "sync" : "async"}
        {...props}
      />
    </picture>
  );
}

export default OptimizedImage;
