import Image from "next/image";
import Link from "next/link";

interface ContentCardProps {
  slug: string;
  title: string;
  thumbnailUrl: string | null;
  description: string | null;
  category?: { name: string; slug: string } | null;
}

export default function ContentCard({
  slug,
  title,
  thumbnailUrl,
  description,
  category,
}: ContentCardProps) {
  return (
    <Link href={`/portfolio/${slug}`} className="group block">
      <div className="relative aspect-[4/5] overflow-hidden bg-[var(--color-accent)]">
        {thumbnailUrl && (
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            className="object-cover transition-opacity duration-300 group-hover:opacity-90"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          />
        )}
        {category && (
          <span className="absolute top-3 left-3 text-[10px] tracking-[0.15em] uppercase font-semibold bg-[var(--color-background)] px-2 py-1">
            {category.name}
          </span>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-editorial-sm text-[12px]">{title}</h3>
        {description && (
          <p className="text-[12px] text-[var(--color-secondary)] mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>
    </Link>
  );
}
