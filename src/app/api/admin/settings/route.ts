import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { settings } from "@/lib/db/schema";
import { settingUpdateSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allSettings = await db.select().from(settings);

  const result: Record<string, string> = {};
  for (const setting of allSettings) {
    result[setting.key] = setting.value;
  }

  return Response.json(result);
}

export async function PUT(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  // Accept both { settings: [...] } and [...] formats
  const updates = Array.isArray(body) ? body : body.settings;
  if (!Array.isArray(updates)) {
    return Response.json(
      { error: "Expected an array of { key, value }" },
      { status: 400 }
    );
  }

  for (const item of updates) {
    const result = settingUpdateSchema.safeParse(item);

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      for (const issue of result.error.issues) {
        const key = issue.path.join(".");
        if (!fieldErrors[key]) {
          fieldErrors[key] = [];
        }
        fieldErrors[key].push(issue.message);
      }
      return Response.json({ errors: fieldErrors }, { status: 400 });
    }

    // Upsert: insert on conflict (duplicate key) do update
    await db
      .insert(settings)
      .values({ key: result.data.key, value: result.data.value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value: result.data.value },
      });
  }

  return Response.json({ success: true });
}
