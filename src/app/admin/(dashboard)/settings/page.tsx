import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import SettingsForm from "@/components/admin/SettingsForm";

export const dynamic = "force-dynamic";

async function getAllSettings() {
  return db.select().from(settings);
}

export default async function SettingsPage() {
  const allSettings = await getAllSettings();

  return (
    <div>
      <h1 className="text-editorial text-lg tracking-[0.15em] mb-8">
        Settings
      </h1>
      <SettingsForm settings={allSettings} />
    </div>
  );
}
