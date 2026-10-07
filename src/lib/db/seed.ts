import bcrypt from "bcryptjs";
import { db } from "./index";
import { users, categories, contentItems, contentImages, settings } from "./schema";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");
  console.log("Note: Run 'npm run db:push' or 'npx drizzle-kit push' first to create/migrate tables.");

  // Seed admin user
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

  // Seed categories
  const categoryData = [
    { name: "Fashion", slug: "fashion", description: "Fashion styling and editorial work", sortOrder: 0 },
    { name: "Video", slug: "video", description: "Music videos, commercials, and motion", sortOrder: 1 },
    { name: "Design", slug: "design", description: "Art direction and creative design", sortOrder: 2 },
  ];
  for (const cat of categoryData) {
    const existing = await db.select().from(categories).where(sql`slug = ${cat.slug}`);
    if (existing.length === 0) {
      await db.insert(categories).values(cat);
      console.log(`Category created: ${cat.name}`);
    }
  }

  // Get category IDs
  const allCategories = await db.select().from(categories);
  const fashionCat = allCategories.find((c) => c.slug === "fashion")!;
  const videoCat = allCategories.find((c) => c.slug === "video")!;
  const designCat = allCategories.find((c) => c.slug === "design")!;

  // Seed content items
  const contentData = [
    {
      title: "Ancient Greek Sandals",
      slug: "ancient-greek-sandals",
      description: "Editorial campaign for Ancient Greek Sandals SS25 collection.",
      longDescription: "A sun-drenched editorial capturing the essence of Mediterranean summer. Styled with natural linens, artisanal leather, and found objects from the Athenian coastline.",
      categoryId: fashionCat.id,
      status: "published" as const,
      featured: true,
      thumbnailUrl: "https://picsum.photos/seed/ags/800/1200",
      sortOrder: 0,
    },
    {
      title: "Kennedy Magazine — Cameron Kendrick",
      slug: "kennedy-magazine-cameron-kendrick",
      description: "Editorial feature in Kennedy Magazine with photographer Cameron Kendrick.",
      longDescription: "An exploration of masculinity and vulnerability through the lens of Cameron Kendrick. Published in Kennedy Magazine Issue 47.",
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
      longDescription: "Complete visual identity redesign for one of Athens' most storied football clubs. Blending heritage with a forward-thinking aesthetic.",
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
      longDescription: "On-court and off-court styling for Adidas Tennis, blending performance gear with street-ready silhouettes.",
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
      longDescription: "A visual journey through brutalist architecture and stark landscapes. Wardrobe inspired by deconstructed tailoring.",
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
      longDescription: "A complete visual identity system for a luxury artisanal brand. Hand-lettered logotype, earth-tone palette, and tactile packaging.",
      categoryId: designCat.id,
      status: "draft" as const,
      featured: false,
      thumbnailUrl: "https://picsum.photos/seed/nomad/800/900",
      sortOrder: 1,
    },
  ];

  for (const item of contentData) {
    const existing = await db.select().from(contentItems).where(sql`slug = ${item.slug}`);
    if (existing.length === 0) {
      const [inserted] = await db.insert(contentItems).values(item).returning();
      console.log(`Content created: ${item.title}`);

      // Insert 2-3 images per item
      const imageCount = 2 + Math.floor(Math.random() * 2);
      for (let i = 0; i < imageCount; i++) {
        const w = 800 + Math.floor(Math.random() * 400);
        const h = 600 + Math.floor(Math.random() * 600);
        await db.insert(contentImages).values({
          contentItemId: inserted.id,
          url: `https://picsum.photos/seed/${item.slug}-${i}/${w}/${h}`,
          alt: `${item.title} - Image ${i + 1}`,
          sortOrder: i,
        });
      }
      console.log(`  ${imageCount} images added.`);
    }
  }

  // Seed settings
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
    const existing = await db.select().from(settings).where(sql`key = ${s.key}`);
    if (existing.length === 0) {
      await db.insert(settings).values(s);
    }
  }
  console.log("Settings seeded.");

  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
