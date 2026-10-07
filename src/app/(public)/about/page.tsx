import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import Image from "next/image";

export const dynamic = "force-dynamic";

async function getAboutData() {
  const allSettings = await db.select().from(settings);
  const map = Object.fromEntries(allSettings.map((s) => [s.key, s.value]));
  return {
    bio: map.bio || "",
    profileImageUrl: map.profile_image_url || "",
    instagram: map.instagram || "",
    tiktok: map.tiktok || "",
    email: map.email || "",
    phone: map.phone || "",
    location: map.location || "",
    siteName: map.site_name || "SOFIA",
  };
}

export default async function AboutPage() {
  const data = await getAboutData();

  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)]">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-[var(--spacing-gutter)] max-w-[1000px]">
        {/* Profile image */}
        <div className="md:col-span-5">
          {data.profileImageUrl && (
            <div className="relative aspect-[3/4] overflow-hidden bg-[var(--color-accent)]">
              <Image
                src={data.profileImageUrl}
                alt={data.siteName}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 41.667vw"
                priority
              />
            </div>
          )}
        </div>

        {/* Bio & info */}
        <div className="md:col-span-7 flex flex-col justify-center">
          <h1 className="text-editorial text-xl tracking-[0.15em] font-bold mb-6">
            {data.siteName}
          </h1>

          {data.bio && (
            <p className="text-[14px] leading-[1.8] whitespace-pre-line mb-8">
              {data.bio}
            </p>
          )}

          {/* Contact info */}
          <div className="space-y-2 text-[13px] text-[var(--color-secondary)]">
            {data.location && <p>{data.location}</p>}
            {data.email && (
              <p>
                <a href={`mailto:${data.email}`} className="hover:text-[var(--color-primary)] transition-colors">
                  {data.email}
                </a>
              </p>
            )}
            {data.phone && <p>{data.phone}</p>}
          </div>

          {/* Social links */}
          <div className="flex gap-6 mt-6">
            {data.instagram && (
              <a
                href={data.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] tracking-[0.1em] uppercase text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                Instagram
              </a>
            )}
            {data.tiktok && (
              <a
                href={data.tiktok}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] tracking-[0.1em] uppercase text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
              >
                TikTok
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
