"use client";

import { useState, useRef, useCallback } from "react";

interface ImageUploaderProps {
  onUpload: (url: string) => void;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Client-side resize targets. 2048px on the longest side is sharp enough for
// full-bleed desktop layouts on retina screens while keeping files a few
// hundred KB — comfortably inside Cloudflare's 100MB Worker request limit.
const MAX_DIMENSION = 2048;
const WEBP_QUALITY = 0.85;

/**
 * Downscale + re-encode to WebP before upload. The longest side is capped at
 * MAX_DIMENSION and the aspect ratio is preserved, so landscape, portrait and
 * square images all come out correctly. EXIF orientation is baked in
 * (`imageOrientation: "from-image"`) so phone photos display upright on every
 * device. Returns the original file untouched when resizing is unnecessary or
 * unsupported.
 */
async function resizeImage(file: File): Promise<File | Blob> {
  // Canvas flattens GIF animation, so animated images pass through as-is
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return file; // Undecodable in this browser — let the server validate it
  }

  // Already small enough and already WebP — no work to do
  const longestSide = Math.max(bitmap.width, bitmap.height);
  if (longestSide <= MAX_DIMENSION && file.type === "image/webp") {
    bitmap.close();
    return file;
  }

  const scale = Math.min(1, MAX_DIMENSION / longestSide);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", WEBP_QUALITY)
  );

  // Transparency (PNG logos etc.) survives the WebP encode. Only use the
  // re-encoded blob when it is actually smaller than the source.
  if (blob && blob.size < file.size) {
    const baseName = file.name.replace(/\.[^.]+$/, "");
    return new File([blob], `${baseName}.webp`, { type: "image/webp" });
  }
  return file;
}

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
        // Resize/compress in the browser before it hits the network
        const uploadBlob = await resizeImage(file);

        const formData = new FormData();
        formData.append("file", uploadBlob);

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
            <p className="text-[11px] text-[var(--color-surface-dim)] mt-1">
              Tip: for the sharpest results, use an image at least 1600px on
              its longest side. Images are automatically resized to 2048px and
              compressed, so any size or orientation works.
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
