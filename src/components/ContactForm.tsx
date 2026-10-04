"use client";
import { FormEvent, useState } from "react";
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
      <div className="success">
        <span className="success-icon">✓</span>
        <b>Thank you for reaching out.</b>
        <span>
          Your enquiry has been received. The CEDAH team will respond shortly.
        </span>
        <button onClick={() => setState("idle")}>Send another enquiry</button>
      </div>
    );
  return (
    <form onSubmit={submit}>
      <div className="form-row">
        <label>
          Your name
          <input name="name" required placeholder="Full name" />
        </label>
        <label>
          Email address
          <input
            name="email"
            required
            type="email"
            placeholder="you@company.com"
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Phone number
          <input name="phone" placeholder="+256 ..." />
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
          placeholder="Tell us briefly about your interest..."
        />
      </label>
      <input
        name="website"
        className="honey"
        tabIndex={-1}
        autoComplete="off"
      />
      <button
        className="button teal"
        type="submit"
        disabled={state === "loading"}
      >
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
