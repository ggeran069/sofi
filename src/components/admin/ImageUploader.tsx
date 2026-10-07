"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploaderProps {
  onUpload: (url: string) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Accepted formats: JPEG, PNG, WebP, GIF";
    }
    if (file.size > MAX_SIZE) {
      return "File size must be under 10MB";
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }

      setError("");
      setUploading(true);

      // Show local preview immediately
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || "Upload failed");
          setPreview(null);
          return;
        }

        const data = await res.json();
        onUpload(data.url);
        setPreview(null);
      } catch {
        setError("Network error during upload");
        setPreview(null);
      } finally {
        setUploading(false);
        if (inputRef.current) {
          inputRef.current.value = "";
        }
      }
    },
    [onUpload, validateFile]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) uploadFile(file);
    },
    [uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed p-8 text-center cursor-pointer transition-colors ${
          dragOver
            ? "border-[var(--color-primary)] bg-[var(--color-surface)]"
            : "border-[var(--color-surface-dim)]"
        }`}
      >
        {uploading ? (
          <div>
            <p className="text-editorial-sm text-[12px] tracking-[0.1em] mb-2">
              Uploading...
            </p>
            {preview && (
              <img
                src={preview}
                alt="Uploading preview"
                className="w-20 h-20 object-cover mx-auto opacity-50"
              />
            )}
          </div>
        ) : (
          <div>
            <p className="text-[12px] text-[var(--color-secondary)] mb-1">
              Drag and drop an image here, or click to browse
            </p>
            <p className="text-[11px] text-[var(--color-surface-dim)]">
              JPEG, PNG, WebP, GIF -- Max 10MB
            </p>
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {error && (
        <p className="text-[var(--color-error)] text-[12px] mt-2">{error}</p>
      )}
    </div>
  );
}
