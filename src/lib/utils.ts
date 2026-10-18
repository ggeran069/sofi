// Greek → Latin transliteration so Greek titles still produce a URL-safe slug
// (the content schema only allows [a-z0-9-])
const GREEK_TO_LATIN: Record<string, string> = {
  α: "a", β: "v", γ: "g", δ: "d", ε: "e", ζ: "z", η: "i", θ: "th",
  ι: "i", κ: "k", λ: "l", μ: "m", ν: "n", ξ: "x", ο: "o", π: "p",
  ρ: "r", σ: "s", ς: "s", τ: "t", υ: "y", φ: "f", χ: "ch", ψ: "ps",
  ω: "o",
  ά: "a", έ: "e", ή: "i", ί: "i", ό: "o", ύ: "y", ώ: "o",
  ϊ: "i", ϋ: "y", ΐ: "i", ΰ: "y",
};

export function slugify(text: string): string {
  const transliterated = text
    .toLowerCase()
    .replace(/[α-ωάέήίόύώΐΰς]/g, (ch) => GREEK_TO_LATIN[ch] ?? ch);
  const slug = transliterated
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip remaining accents (é → e)
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  // Never return empty — an empty slug fails validation and blocks saving
  return slug || `item-${Date.now()}`;
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function formatDate(date: Date | string, locale = "en-US"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
