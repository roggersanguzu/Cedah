"use client";

import { useState } from "react";

export default function UnsubscribeForm({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState("");
  async function unsubscribe() {
    setState("saving");
    try {
      const response = await fetch("/api/registrations", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to unsubscribe. Please try again.");
      setState("done");
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "Please check your connection and try again.");
      setState("error");
    }
  }
  if (!/^[a-f0-9]{64}$/.test(token)) return <p role="alert">Use the unsubscribe link you saved when signing up, or contact CEDAH to remove your subscription.</p>;
  if (state === "done") return <p role="status">You have been unsubscribed from CEDAH updates.</p>;
  return <div>
    <p>Confirm below to stop receiving CEDAH newsletter updates.</p>
    <button className="button teal" onClick={() => void unsubscribe()} disabled={state === "saving"}>{state === "saving" ? "Updating…" : "Unsubscribe"}</button>
    {state === "error" && <p className="form-error" role="alert">{error}</p>}
  </div>;
}
