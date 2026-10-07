import ContactForm from "@/components/public/ContactForm";

export const dynamic = "force-dynamic";

export default function ContactPage() {
  return (
    <div className="p-[var(--spacing-margin-mobile)] md:p-[var(--spacing-margin-desktop)]">
      <h1 className="text-editorial text-xl tracking-[0.15em] font-bold mb-8">
        Contact
      </h1>
      <ContactForm />
    </div>
  );
}
