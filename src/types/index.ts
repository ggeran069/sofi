export interface ContentItem {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  longDescription: string | null;
  categoryId: string | null;
  status: "draft" | "published";
  featured: boolean;
  thumbnailUrl: string | null;
  sortOrder: number;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
  images?: ContentImage[];
  category?: Category;
}

export interface ContentImage {
  id: string;
  contentItemId: string;
  url: string;
  alt: string;
  sortOrder: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sortOrder: number;
  createdAt: Date;
}

export interface Setting {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}
