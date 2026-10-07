"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import ImageUploader from "./ImageUploader";
import type { ContentItem, ContentImage, Category } from "@/types";

interface ContentFormProps {
  initialData?: {
    item: ContentItem;
    images: ContentImage[];
  };
}

export default function ContentForm({ initialData }: ContentFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.item.title ?? "");
  const [slug, setSlug] = useState(initialData?.item.slug ?? "");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(isEditing);
  const [description, setDescription] = useState(
    initialData?.item.description ?? ""
  );
  const [longDescription, setLongDescription] = useState(
    initialData?.item.longDescription ?? ""
  );
  const [categoryId, setCategoryId] = useState<string>(
    initialData?.item.categoryId ?? ""
  );
  const [status, setStatus] = useState<"draft" | "published">(
    initialData?.item.status ?? "draft"
  );
  const [featured, setFeatured] = useState(initialData?.item.featured ?? false);
  const [thumbnailUrl, setThumbnailUrl] = useState(
    initialData?.item.thumbnailUrl ?? ""
  );
  const [sortOrder, setSortOrder] = useState(
    initialData?.item.sortOrder ?? 0
  );
  const [images, setImages] = useState<ContentImage[]>(
    initialData?.images ?? []
  );
  const [categories, setCategories] = useState<Category[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data);
        }
      } catch {
        // Silently handle fetch errors
      }
    }
    fetchCategories();
  }, []);

  const handleTitleChange = useCallback(
    (value: string) => {
      setTitle(value);
      if (!slugManuallyEdited) {
        setSlug(slugify(value));
      }
    },
    [slugManuallyEdited]
  );

  const handleSlugChange = useCallback((value: string) => {
    setSlug(value);
    setSlugManuallyEdited(true);
  }, []);

  const handleImageUpload = useCallback(
    (url: string) => {
      const newImage: ContentImage = {
        id: `temp-${Date.now()}`,
        contentItemId: initialData?.item.id ?? "",
        url,
        alt: title || "Image",
        sortOrder: images.length,
      };
      setImages((prev) => [...prev, newImage]);
    },
    [initialData?.item.id, title, images.length]
  );

  const handleDeleteImage = useCallback((imageId: string) => {
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    const payload = {
      title,
      slug,
      description: description || null,
      longDescription: longDescription || null,
      categoryId: categoryId || null,
      status,
      featured,
      thumbnailUrl: thumbnailUrl || null,
      sortOrder,
      imageUrls: images.map((img, i) => ({
        url: img.url,
        alt: img.alt,
        sortOrder: i,
      })),
    };

    try {
      const url = isEditing
        ? `/api/admin/content/${initialData!.item.id}`
        : "/api/admin/content";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Something went wrong");
        return;
      }

      router.push("/admin/content");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const labelClass = "block text-[11px] tracking-[0.1em] uppercase font-semibold mb-2";
  const inputClass =
    "w-full border border-[var(--color-border)] px-3 py-2 text-[13px] bg-transparent focus:outline-none focus:border-2";
  const slugDisplayClass = slugManuallyEdited
    ? inputClass
    : `${inputClass} text-[var(--color-secondary)]`;

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl">
      {error && (
        <div className="mb-6 p-3 border border-[var(--color-error)] text-[var(--color-error)] text-[12px]">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Title */}
        <div>
          <label htmlFor="title" className={labelClass}>
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className={inputClass}
          />
        </div>

        {/* Slug */}
        <div>
          <label htmlFor="slug" className={labelClass}>
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            required
            className={slugDisplayClass}
          />
          {!slugManuallyEdited && (
            <p className="text-[11px] text-[var(--color-secondary)] mt-1">
              Auto-generated from title
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className={labelClass}>
            Description
          </label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            className={inputClass}
          />
        </div>

        {/* Long Description */}
        <div>
          <label htmlFor="longDescription" className={labelClass}>
            Long Description
          </label>
          <textarea
            id="longDescription"
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            rows={6}
            className={inputClass}
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className={labelClass}>
            Category
          </label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={inputClass}
          >
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label htmlFor="status" className={labelClass}>
            Status
          </label>
          <select
            id="status"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "draft" | "published")
            }
            className={inputClass}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        {/* Featured */}
        <div className="flex items-center gap-3">
          <input
            id="featured"
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="w-4 h-4 accent-[var(--color-primary)]"
          />
          <label htmlFor="featured" className={labelClass}>
            Featured
          </label>
        </div>

        {/* Thumbnail URL */}
        <div>
          <label htmlFor="thumbnailUrl" className={labelClass}>
            Thumbnail URL
          </label>
          <input
            id="thumbnailUrl"
            type="text"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://..."
            className={inputClass}
          />
        </div>

        {/* Sort Order */}
        <div>
          <label htmlFor="sortOrder" className={labelClass}>
            Sort Order
          </label>
          <input
            id="sortOrder"
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
            className={inputClass}
          />
        </div>

        {/* Images */}
        <div>
          <label className={labelClass}>Images</label>

          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <img
                    src={img.url}
                    alt={img.alt}
                    className="w-full aspect-square object-cover border border-[var(--color-surface-dim)]"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 bg-[var(--color-primary)] text-[var(--color-background)] text-[10px] tracking-[0.05em] uppercase px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          <ImageUploader onUpload={handleImageUpload} />
        </div>

        {/* Submit */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="border border-[var(--color-border)] px-6 py-3 text-editorial-sm text-[12px] tracking-[0.15em] bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-transparent hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
          >
            {submitting
              ? "Saving..."
              : isEditing
                ? "Update Content"
                : "Create Content"}
          </button>
        </div>
      </div>
    </form>
  );
}
