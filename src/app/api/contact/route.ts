import { contactSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const body = await request.json();

  const result = contactSchema.safeParse(body);

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

  // Log the contact submission
  console.log("Contact submission:", {
    name: result.data.name,
    email: result.data.email,
    subject: result.data.subject,
    message: result.data.message,
    timestamp: new Date().toISOString(),
  });

  // TODO: Send email via Resend or another provider
  // await sendContactEmail(result.data);

  return Response.json({ success: true });
}
