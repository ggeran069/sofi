"use client";

import { useState, useCallback } from "react";

interface SettingRow {
  key: string;
  value: string;
}

interface SettingsFormProps {
  settings: SettingRow[];
}

const GROUPS: Record<string, string[]> = {
  "Site Identity": [
    "site_name",
    "tagline",
    "bio",
    "profile_image_url",
  ],
  Contact: ["email", "phone", "location"],
  Social: ["instagram", "tiktok"],
};

function formatLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/url$/i, "URL")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function isTextarea(key: string): boolean {
  return key === "bio" || key === "tagline";
}

export default function SettingsForm({ settings }: SettingsFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const s of settings) {
      map[s.key] = s.value;
    }
    return map;
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleChange = useCallback((key: string, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleSave = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSaving(true);
      setMessage(null);

      const updates = Object.entries(values).map(([key, value]) => ({
        key,
        value,
      }));

      try {
        const res = await fetch("/api/admin/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ settings: updates }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setMessage({ type: "error", text: data.error || "Failed to save settings" });
          return;
        }

        setMessage({ type: "success", text: "Settings saved" });
      } catch {
        setMessage({ type: "error", text: "Network error. Please try again." });
      } finally {
        setSaving(false);
      }
    },
    [values]
  );

  const labelClass =
    "block text-[11px] tracking-[0.1em] uppercase font-semibold mb-2";
  const inputClass =
    "w-full border border-[var(--color-border)] px-3 py-2 text-[13px] bg-transparent focus:outline-none focus:border-2";

  return (
    <form onSubmit={handleSave} className="max-w-2xl">
      {message && (
        <div
          className={`mb-6 p-3 border text-[12px] ${
            message.type === "success"
              ? "border-[var(--color-success)] text-[var(--color-success)]"
              : "border-[var(--color-error)] text-[var(--color-error)]"
          }`}
        >
          {message.text}
        </div>
      )}

      {Object.entries(GROUPS).map(([groupName, keys]) => (
        <div key={groupName} className="mb-8">
          <h2 className="text-editorial-sm text-[11px] tracking-[0.1em] mb-4 pb-2 border-b border-[var(--color-surface-dim)]">
            {groupName}
          </h2>
          <div className="space-y-4">
            {keys.map((key) => (
              <div key={key}>
                <label htmlFor={key} className={labelClass}>
                  {formatLabel(key)}
                </label>
                {isTextarea(key) ? (
                  <textarea
                    id={key}
                    value={values[key] ?? ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    rows={3}
                    className={inputClass}
                  />
                ) : (
                  <input
                    id={key}
                    type="text"
                    value={values[key] ?? ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className={inputClass}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="submit"
        disabled={saving}
        className="border border-[var(--color-border)] px-6 py-3 text-editorial-sm text-[12px] tracking-[0.15em] bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-transparent hover:text-[var(--color-primary)] transition-colors disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save Settings"}
      </button>
    </form>
  );
}
