import bcrypt from "bcryptjs";
import { db } from "./index";
import { users, categories, contentItems, contentImages, settings } from "./schema";
import { sql, eq } from "drizzle-orm";

async function setup() {
  console.log("Running database setup...");

  // Seed admin user (idempotent)
  const hashedPassword = await bcrypt.hash("changeme123", 12);
  const existingUser = await db.select().from(users).where(sql`email = 'admin@sofia.com'`);
  if (existingUser.length === 0) {
    await db.insert(users).values({
      email: "admin@sofia.com",
      password: hashedPassword,
      name: "Admin",
      role: "admin",
    });
    console.log("Admin user created: admin@sofia.com / changeme123");
  } else {
    console.log("Admin user already exists, skipping.");
  }

  // Seed categories (idempotent)
  const categoryData = [
    { name: "Fashion", slug: "fashion", description: "Fashion styling and editorial work", sortOrder: 0 },
    { name: "Video", slug: "video", description: "Music videos, commercials, and motion", sortOrder: 1 },
    { name: "Design", slug: "design", description: "Art direction and creative design", sortOrder: 2 },
  ];
  for (const cat of categoryData) {
    const existing = await db.select().from(categories).where(eq(categories.slug, cat.slug));
    if (existing.length === 0) {
      await db.insert(categories).values(cat);
      console.log("Category created: " + cat.name);
    }
  }

  // Seed settings (idempotent)
  const settingsData = [
    { key: "site_name", value: "SOFIA" },
    { key: "tagline", value: "STYLING, DESIGN, ART DIRECTION" },
    { key: "bio", value: "Sofia is a creative director and stylist based in Athens, working across fashion editorial, brand identity, and visual storytelling." },
    { key: "profile_image_url", value: "https://picsum.photos/seed/sofia-profile/600/800" },
    { key: "instagram", value: "https://instagram.com/sofia" },
    { key: "tiktok", value: "https://tiktok.com/@sofia" },
    { key: "email", value: "hello@sofia.com" },
    { key: "phone", value: "+30 210 000 0000" },
    { key: "location", value: "Athens, Greece" },
  ];
  for (const s of settingsData) {
    const existing = await db.select().from(settings).where(eq(settings.key, s.key));
    if (existing.length === 0) {
      await db.insert(settings).values(s);
    }
  }
  console.log("Settings seeded.");

  // Seed sample content (idempotent)
  const allCategories = await db.select().from(categories);
  const fashionCat = allCategories.find((c) => c.slug === "fashion")!;
  const videoCat = allCategories.find((c) => c.slug === "video")!;
  const designCat = allCategories.find((c) => c.slug === "design")!;

  const contentData = [
    {
      title: "Ancient Greek Sandals",
      slug: "ancient-greek-sandals",
      description: "Editorial campaign for Ancient Greek Sandals SS25 collection.",
      longDescription: "A sun-drenched editorial capturing the essence of Mediterranean summer.",
      categoryId: fashionCat.id,
      status: "published" as const,
      featured: true,
      thumbnailUrl: "https://picsum.photos/seed/ags/800/1200",
      sortOrder: 0,
    },
    {
      title: "Kennedy Magazine — Cameron Kendrick",
      slug: "kennedy-magazine-cameron-kendrick",
      description: "Editorial feature in Kennedy Magazine.",
      longDescription: "An exploration of masculinity and vulnerability.",
      categoryId: fashionCat.id,
      status: "published" as const,
      featured: true,
      thumbnailUrl: "https://picsum.photos/seed/kennedy/800/600",
      sortOrder: 1,
    },
    {
      title: "Athens Kallithea FC",
      slug: "athens-kallithea-fc",
      description: "Brand identity and creative direction for Athens Kallithea FC.",
      categoryId: designCat.id,
      status: "published" as const,
      featured: false,
      thumbnailUrl: "https://picsum.photos/seed/akfc/800/1000",
      sortOrder: 0,
    },
    {
      title: "Adidas Tennis — Serve & Return",
      slug: "adidas-tennis-serve-return",
      description: "Campaign styling for Adidas Tennis spring/summer collection.",
      categoryId: fashionCat.id,
      status: "published" as const,
      featured: false,
      thumbnailUrl: "https://picsum.photos/seed/adidas/800/700",
      sortOrder: 2,
    },
    {
      title: "Monolith — Music Video",
      slug: "monolith-music-video",
      description: "Creative direction and styling for Monolith's latest music video.",
      categoryId: videoCat.id,
      status: "published" as const,
      featured: false,
      thumbnailUrl: "https://picsum.photos/seed/monolith/800/500",
      sortOrder: 0,
    },
    {
      title: "Atelier Nomad — Visual Identity",
      slug: "atelier-nomad-visual-identity",
      description: "Brand identity and packaging design for Atelier Nomad.",
      categoryId: designCat.id,
      status: "draft" as const,
      featured: false,
      thumbnailUrl: "https://picsum.photos/seed/nomad/800/900",
      sortOrder: 1,
    },
  ];

  for (const item of contentData) {
    const existing = await db.select().from(contentItems).where(eq(contentItems.slug, item.slug));
    if (existing.length === 0) {
      const [inserted] = await db.insert(contentItems).values(item).returning();
      console.log("Content created: " + item.title);
      const imageCount = 2;
      for (let i = 0; i < imageCount; i++) {
        const w = 800 + Math.floor(Math.random() * 400);
        const h = 600 + Math.floor(Math.random() * 600);
        await db.insert(contentImages).values({
          contentItemId: inserted.id,
          url: "https://picsum.photos/seed/" + item.slug + "-" + i + "/" + w + "/" + h,
          alt: item.title + " - Image " + (i + 1),
          sortOrder: i,
        });
      }
    }
  }

  console.log("Setup complete.");
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
