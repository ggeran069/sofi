"use client";

import { useState } from "react";

export default function ContactForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (form.name.length < 2) errs.name = "Name is required (min 2 chars)";
    if (!form.email.includes("@")) errs.email = "Valid email required";
    if (form.subject.length < 3) errs.subject = "Subject is required (min 3 chars)";
    if (form.message.length < 10) errs.message = "Message is required (min 10 chars)";
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("sending");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl space-y-6">
      {/* Honeypot */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <div>
        <label
          htmlFor="contact-name"
          className="block text-[11px] tracking-[0.1em] uppercase font-semibold mb-2"
        >
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full border border-[var(--color-border)] px-3 py-2 text-[13px] bg-transparent focus:border-2 focus:outline-none min-h-[44px]"
        />
        {errors.name && (
          <p className="text-[var(--color-error)] text-[11px] mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-email"
          className="block text-[11px] tracking-[0.1em] uppercase font-semibold mb-2"
        >
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full border border-[var(--color-border)] px-3 py-2 text-[13px] bg-transparent focus:border-2 focus:outline-none min-h-[44px]"
        />
        {errors.email && (
          <p className="text-[var(--color-error)] text-[11px] mt-1">{errors.email}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-subject"
          className="block text-[11px] tracking-[0.1em] uppercase font-semibold mb-2"
        >
          Subject
        </label>
        <input
          id="contact-subject"
          type="text"
          value={form.subject}
          onChange={(e) => setForm({ ...form, subject: e.target.value })}
          className="w-full border border-[var(--color-border)] px-3 py-2 text-[13px] bg-transparent focus:border-2 focus:outline-none min-h-[44px]"
        />
        {errors.subject && (
          <p className="text-[var(--color-error)] text-[11px] mt-1">{errors.subject}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="contact-message"
          className="block text-[11px] tracking-[0.1em] uppercase font-semibold mb-2"
        >
          Message
        </label>
        <textarea
          id="contact-message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={6}
          className="w-full border border-[var(--color-border)] px-3 py-2 text-[13px] bg-transparent focus:border-2 focus:outline-none resize-vertical"
        />
        {errors.message && (
          <p className="text-[var(--color-error)] text-[11px] mt-1">{errors.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={status === "sending"}
        className="border border-[var(--color-border)] px-8 py-3 text-editorial-sm text-[12px] tracking-[0.15em] bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-transparent hover:text-[var(--color-primary)] transition-colors min-h-[44px]"
      >
        {status === "sending" ? "Sending..." : "Send Message"}
      </button>

      {status === "success" && (
        <p className="text-[var(--color-success)] text-[13px]">Message sent successfully.</p>
      )}
      {status === "error" && (
        <p className="text-[var(--color-error)] text-[13px]">Something went wrong. Please try again.</p>
      )}
    </form>
  );
}
