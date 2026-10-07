export const STATUS = {
  DRAFT: "draft",
  PUBLISHED: "published",
} as const;

export const ROLES = {
  ADMIN: "admin",
} as const;

export const SETTINGS_KEYS = [
  "site_name",
  "tagline",
  "bio",
  "profile_image_url",
  "instagram",
  "tiktok",
  "email",
  "phone",
  "location",
] as const;

export type SettingKey = (typeof SETTINGS_KEYS)[number];

export const NAV_CATEGORIES = ["fashion", "video", "design"] as const;
