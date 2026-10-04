"use client";
import { FormEvent, useState } from "react";
import { LoadingMark } from "@/components/LoadingIndicator";
export default function ContactForm() {
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const element = e.currentTarget;
    setState("loading");
    setError("");
    const form = new FormData(element);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form)),
      });
      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      if (!response.ok) {
        setError(
          result.error ||
            "We could not send your message. Please try again or email info@cedah.com.",
        );
        setState("error");
        return;
      }
      element.reset();
      setState("success");
    } catch {
      setError(
        "We could not send your message. Please check your connection and try again.",
      );
      setState("error");
    }
  }
  if (state === "success")
    return (
      <div className="success" role="status">
        <span className="success-icon">✓</span>
        <b>Thank you for reaching out.</b>
        <span>
          Your enquiry has been saved for the CEDAH team to review.
        </span>
        <button onClick={() => setState("idle")}>Send another enquiry</button>
      </div>
    );
  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <label>
          Your name
          <input name="name" autoComplete="name" maxLength={120} required placeholder="Full name" />
        </label>
        <label>
          Email address
          <input
            name="email"
            required
            type="email"
            autoComplete="email"
            maxLength={180}
            placeholder="you@company.com"
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Phone number
          <input name="phone" type="tel" autoComplete="tel" maxLength={60} placeholder="+256 ..." />
        </label>
        <label>
          I’m interested in
          <select name="interest" required defaultValue="">
            <option value="" disabled>
              Select partnership area
            </option>
            <option>Crop enterprise</option>
            <option>Beef enterprise</option>
            <option>Investment & funding</option>
            <option>Become a supplier</option>
            <option>Buy our products</option>
            <option>Training & employment</option>
            <option>Media enquiry</option>
          </select>
        </label>
      </div>
      <label>
        How can we work together?
        <textarea
          name="message"
          required
          maxLength={4000}
          placeholder="Tell us briefly about your interest..."
        />
      </label>
      <input
        name="website"
        className="honey"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        aria-label="Leave blank"
      />
      <p className="contact-privacy">Your details are used to respond to this enquiry. <a href="/privacy">Read our privacy policy.</a></p>
      <button
        className="button teal"
        type="submit"
        disabled={state === "loading"}
      >
        {state === "loading" && <LoadingMark small />}
        {state === "loading" ? "Sending…" : "Start a conversation"}{" "}
        <span>↗</span>
      </button>
      {state === "error" && (
        <p className="form-error" role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </form>
  );
}
