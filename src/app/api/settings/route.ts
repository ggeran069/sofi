import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";

export async function GET() {
  const allSettings = await db.select().from(settings);

  const result: Record<string, string> = {};
  for (const setting of allSettings) {
    result[setting.key] = setting.value;
  }

  return Response.json(result);
}
