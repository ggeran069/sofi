"use client";

import { useState, useEffect, useCallback } from "react";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New category form
  const [newName, setNewName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newSlugManual, setNewSlugManual] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newSortOrder, setNewSortOrder] = useState(0);
  const [adding, setAdding] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editSortOrder, setEditSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleNewNameChange = useCallback((value: string) => {
    setNewName(value);
    if (!newSlugManual) {
      setNewSlug(slugify(value));
    }
  }, [newSlugManual]);

  const handleAddCategory = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!newName.trim()) return;

      setAdding(true);
      setError("");

      try {
        const res = await fetch("/api/admin/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newName,
            slug: newSlug || slugify(newName),
            description: newDescription || undefined,
            sortOrder: newSortOrder,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to create category");
          return;
        }

        setNewName("");
        setNewSlug("");
        setNewSlugManual(false);
        setNewDescription("");
        setNewSortOrder(0);
        await fetchCategories();
      } catch {
        setError("Network error");
      } finally {
        setAdding(false);
      }
    },
    [newName, newSlug, newDescription, newSortOrder, fetchCategories]
  );

  const startEditing = useCallback((cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
    setEditDescription(cat.description ?? "");
    setEditSortOrder(cat.sortOrder);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleUpdateCategory = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingId) return;

      setSaving(true);
      setError("");

      try {
        const res = await fetch(`/api/admin/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: editName,
            slug: editSlug,
            description: editDescription || undefined,
            sortOrder: editSortOrder,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to update category");
          return;
        }

        setEditingId(null);
        await fetchCategories();
      } catch {
        setError("Network error");
      } finally {
        setSaving(false);
      }
    },
    [editingId, editName, editSlug, editDescription, editSortOrder, fetchCategories]
  );

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      if (!confirm("Delete this category?")) return;

      setError("");

      try {
        const res = await fetch(`/api/admin/categories/${id}`, {
          method: "DELETE",
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Failed to delete category");
          return;
        }

        await fetchCategories();
      } catch {
        setError("Network error");
      }
    },
    [fetchCategories]
  );

  const labelClass =
    "block text-[11px] tracking-[0.1em] uppercase font-semibold mb-2";
  const inputClass =
    "w-full border border-[var(--color-border)] px-3 py-2 text-[13px] bg-transparent focus:outline-none focus:border-2";

  if (loading) {
    return (
      <div>
        <h1 className="text-editorial text-lg tracking-[0.15em] mb-8">
          Categories
        </h1>
        <p className="text-[13px] text-[var(--color-secondary)]">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-editorial text-lg tracking-[0.15em] mb-8">
        Categories
      </h1>

      {error && (
        <div className="mb-6 p-3 border border-[var(--color-error)] text-[var(--color-error)] text-[12px]">
          {error}
        </div>
      )}

      {/* Add Category Form */}
      <form
        onSubmit={handleAddCategory}
        className="mb-8 p-5 border border-[var(--color-surface-dim)]"
      >
        <h2 className="text-editorial-sm text-[11px] tracking-[0.1em] mb-4">
          Add Category
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="newName" className={labelClass}>
              Name
            </label>
            <input
              id="newName"
              type="text"
              value={newName}
              onChange={(e) => handleNewNameChange(e.target.value)}
              required
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="newSlug" className={labelClass}>
              Slug
            </label>
            <input
              id="newSlug"
              type="text"
              value={newSlug}
              onChange={(e) => {
                setNewSlug(e.target.value);
                setNewSlugManual(true);
              }}
              className={`${inputClass} text-[var(--color-secondary)]`}
            />
          </div>
          <div>
            <label htmlFor="newDescription" className={labelClass}>
              Description
            </label>
            <input
              id="newDescription"
              type="text"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="newSortOrder" className={labelClass}>
              Sort Order
            </label>
            <input
              id="newSortOrder"
              type="number"
              value={newSortOrder}
              onChange={(e) => setNewSortOrder(parseInt(e.target.value) || 0)}
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={adding}
          className="mt-4 border border-[var(--color-border)] px-4 py-2 text-editorial-sm text-[11px] bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-transparent hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add Category"}
        </button>
      </form>

      {/* Category List */}
      {categories.length === 0 ? (
        <p className="text-[13px] text-[var(--color-secondary)]">
          No categories yet.
        </p>
      ) : (
        <div className="space-y-0">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="border-b border-[var(--color-surface-dim)] py-4"
            >
              {editingId === cat.id ? (
                <form onSubmit={handleUpdateCategory} className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Slug</label>
                    <input
                      type="text"
                      value={editSlug}
                      onChange={(e) => setEditSlug(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Description</label>
                    <input
                      type="text"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Sort Order</label>
                    <input
                      type="number"
                      value={editSortOrder}
                      onChange={(e) =>
                        setEditSortOrder(parseInt(e.target.value) || 0)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div className="col-span-2 flex gap-3 mt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="border border-[var(--color-border)] px-4 py-2 text-editorial-sm text-[11px] bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-transparent hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="border border-[var(--color-surface-dim)] px-4 py-2 text-[12px]"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <span className="text-[13px] font-medium">{cat.name}</span>
                    <span className="text-[12px] text-[var(--color-secondary)]">
                      {cat.slug}
                    </span>
                    {cat.description && (
                      <span className="text-[12px] text-[var(--color-secondary)] hidden md:inline">
                        {cat.description}
                      </span>
                    )}
                    <span className="text-[12px] text-[var(--color-secondary)]">
                      Order: {cat.sortOrder}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => startEditing(cat)}
                      className="text-[11px] tracking-[0.05em] uppercase font-semibold hover:underline"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-[11px] tracking-[0.05em] uppercase font-semibold text-[var(--color-error)] hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
