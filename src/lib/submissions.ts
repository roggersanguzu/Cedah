import "server-only";
import { getDatabase } from "@/lib/mongodb";

type SubmissionData = Record<string, string | boolean | Date>;

/** Storage is the source of truth; email is an optional notification only. */
export async function storeSubmission(data: SubmissionData) {
  const database = await getDatabase();
  const collection = database.collection("contact_submissions");
  const notificationConfigured = Boolean(process.env.RESEND_API_KEY);
  const now = new Date();
  const result = await collection.insertOne({ ...data, status: "new", notes: "", notification_status: notificationConfigured ? "pending" : "not-configured", created_at: now, updated_at: now });
  let notification = notificationConfigured ? "failed" : "not-configured";
  if (notificationConfigured) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "CEDAH Website <website@cedah.com>",
          to: [process.env.CONTACT_NOTIFICATION_EMAIL || "tonen@cedah.com"],
          subject: `New CEDAH ${data.kind || "contact"} enquiry`,
          text: Object.entries(data).filter(([key]) => !key.includes("token") && key !== "consent_at").map(([key, value]) => `${key}: ${String(value)}`).join("\n"),
        }),
        signal: AbortSignal.timeout(8000),
      });
      notification = response.ok ? "sent" : "failed";
    } catch { notification = "failed"; }
    // A notification failure must never turn an already stored enquiry into a failed submission.
    await collection.updateOne({ _id: result.insertedId }, { $set: { notification_status: notification } }).catch(() => undefined);
  }
  return { stored: true, notification };
}
