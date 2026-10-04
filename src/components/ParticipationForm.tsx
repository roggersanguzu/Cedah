"use client";

import { FormEvent, useEffect, useState } from "react";
import { LoadingMark } from "@/components/LoadingIndicator";

const translations = {
  en: { language: "Form language", farmer: "Supply grain", training: "Training & jobs", buyer: "Buy products", name: "Full name", email: "Email address", phone: "Phone number", location: "District / location", crop: "Grain / product", quantity: "Estimated quantity and unit", interests: "Skills / area of interest", message: "Tell us more", consent: "I agree that CEDAH may contact me about this request.", submit: "Register interest", sending: "Sending…", success: "Your interest has been registered. The CEDAH team will contact you using the details provided.", again: "Submit another request", contact: "Provide an email address or phone number.", note: "Registering interest does not guarantee a purchase, training place or job. The team will confirm availability and next steps." },
  sw: { language: "Lugha ya fomu", farmer: "Uza nafaka", training: "Mafunzo na kazi", buyer: "Nunua bidhaa", name: "Jina kamili", email: "Barua pepe", phone: "Nambari ya simu", location: "Wilaya / eneo", crop: "Nafaka / bidhaa", quantity: "Kiasi kinachokadiriwa na kipimo", interests: "Ujuzi / eneo unalopenda", message: "Tuambie zaidi", consent: "Nakubali CEDAH iwasiliane nami kuhusu ombi hili.", submit: "Sajili nia yako", sending: "Inatuma…", success: "Nia yako imesajiliwa. Timu ya CEDAH itawasiliana nawe kupitia maelezo uliyotoa.", again: "Tuma ombi lingine", contact: "Weka barua pepe au nambari ya simu.", note: "Usajili hauhakikishi ununuzi, nafasi ya mafunzo au kazi. Timu itathibitisha upatikanaji na hatua zinazofuata." },
  lg: { language: "Olulimi lw'olupapula", farmer: "Tunda emmere ey'empeke", training: "Okutendekebwa n'emirimu", buyer: "Gula ebintu", name: "Amannya go gonna", email: "Emeyiro", phone: "Ennamba y'essimu", location: "Disitulikiti / ekifo", crop: "Emmere ey'empeke / ekintu", quantity: "Obungi n'ekipimo", interests: "Obukugu / ky'oyagala okukola", message: "Tubuulire ebisingawo", consent: "Nzikiriza CEDAH okuntuukirira ku nsonga eno.", submit: "Weewandiise", sending: "Kiweerezebwa…", success: "Okwewandiisa kwo kufuniddwa. Ttiimu ya CEDAH ejja kukutuukirira ng'ekozesa ebikukwatako by'owadde.", again: "Weereza ekirala", contact: "Teekamu emeyiro oba ennamba y'essimu.", note: "Okwewandiisa tekukakasa kugulibwa, kutendekebwa oba mulimu. Ttiimu ejja kukutegeeza ekiddako." },
};
type Language = keyof typeof translations;
type Kind = "farmer" | "training" | "buyer";

export function ParticipationLink({ kind = "buyer", product = "", children, className = "platform-link" }: { kind?: Kind; product?: string; children: React.ReactNode; className?: string }) {
  return <a href="#participate" className={className} onClick={() => window.dispatchEvent(new CustomEvent("cedah-participation", { detail: { kind, product } }))}>{children}</a>;
}

export default function ParticipationForm() {
  const [language, setLanguage] = useState<Language>("en");
  const [kind, setKind] = useState<Kind>("farmer");
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const [product, setProduct] = useState("");
  const t = translations[language];

  useEffect(() => {
    function choose(event: Event) {
      const detail = (event as CustomEvent<{ kind: Kind; product: string }>).detail;
      setKind(detail.kind); setProduct(detail.product); setState("idle"); setError("");
    }
    window.addEventListener("cedah-participation", choose);
    return () => window.removeEventListener("cedah-participation", choose);
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    if (!String(values.email || "").trim() && !String(values.phone || "").trim()) {
      setError(t.contact);
      return;
    }
    setState("loading");
    setError("");
    try {
      const response = await fetch("/api/registrations", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, kind, language, ...(kind === "buyer" ? { interests: values.crop } : {}), consent: values.consent === "on" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Unable to submit. Please try again.");
      form.reset();
      setState("success");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Please check your connection and try again.");
      setState("idle");
    }
  }

  return <div className="participation-panel" lang={language}>
    <div className="participation-toolbar">
      <div className="participation-tabs" role="group" aria-label="Registration type">
        {(["farmer", "training", "buyer"] as Kind[]).map((value) => <button key={value} type="button" aria-pressed={kind === value} disabled={state === "loading"} onClick={() => { setKind(value); setState("idle"); setError(""); }}>{t[value]}</button>)}
      </div>
      <label className="language-control">{t.language}<select value={language} onChange={(e) => setLanguage(e.target.value as Language)}><option value="en">English</option><option value="lg">Luganda</option><option value="sw">Kiswahili</option></select></label>
    </div>
    {state === "success" ? <div className="platform-success" role="status"><h3>{t.success}</h3><button className="platform-button" onClick={() => setState("idle")}>{t.again}</button></div> : <form className="platform-form" onSubmit={submit} key={`${kind}-${product}`}>
      <p className="platform-muted">{t.note}</p>
      <div className="platform-form-grid">
        <label>{t.name}<input name="name" autoComplete="name" required maxLength={120} /></label>
        <label>{t.location}<input name="location" autoComplete="address-level2" required maxLength={160} /></label>
        <label>{t.phone}<input name="phone" type="tel" autoComplete="tel" maxLength={40} /></label>
        <label>{t.email}<input name="email" type="email" autoComplete="email" maxLength={200} /></label>
        {kind !== "training" ? <><label>{t.crop}<input name="crop" defaultValue={product} required placeholder="Maize, beans, millet, sorghum…" maxLength={160} /></label><label>{t.quantity}<input name="quantity" placeholder="e.g. 500 kg" maxLength={100} /></label></> : <label className="full-width">{t.interests}<input name="interests" defaultValue={product} required maxLength={240} /></label>}
      </div>
      <label>{t.message}<textarea name="message" rows={4} maxLength={4000} /></label>
      <input name="website" className="honey" tabIndex={-1} autoComplete="off" aria-hidden="true" aria-label="Leave blank" />
      <label className="platform-consent"><input name="consent" type="checkbox" required /><span>{t.consent} <a href="/privacy">Privacy</a></span></label>
      {error && <p role="alert" className="platform-error">{error}</p>}
      <button className="platform-button" type="submit" disabled={state === "loading"}>{state === "loading" && <LoadingMark small />}{state === "loading" ? t.sending : t.submit} <span aria-hidden="true">↗</span></button>
    </form>}
  </div>;
}

export function NewsletterForm() {
  const [state, setState] = useState("idle");
  const [error, setError] = useState("");
  const [unsubscribeUrl, setUnsubscribeUrl] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    setState("loading"); setError("");
    try {
      const response = await fetch("/api/registrations", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...values, kind: "newsletter", consent: values.consent === "on" }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Subscription could not be saved.");
      setUnsubscribeUrl(typeof data.unsubscribe_url === "string" && data.unsubscribe_url.startsWith("/unsubscribe?") ? data.unsubscribe_url : "");
      form.reset(); setState("success");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Please try again."); setState("idle"); }
  }
  if (state === "success") return <div className="platform-success" role="status"><p>Thank you. You are on the list for CEDAH updates.</p>{unsubscribeUrl && <p>Save your personal <a className="platform-link" href={unsubscribeUrl}>unsubscribe link</a> to manage your subscription.</p>}</div>;
  return <form className="platform-form newsletter-form" onSubmit={submit}>
    <label>Email address<input name="email" type="email" autoComplete="email" required maxLength={200} placeholder="you@example.com" /></label>
    <input name="website" className="honey" tabIndex={-1} autoComplete="off" aria-hidden="true" aria-label="Leave blank" />
    <label className="platform-consent"><input name="consent" type="checkbox" required /><span>I agree to receive CEDAH news and partnership updates. I can request to unsubscribe at any time. <a href="/privacy">Privacy</a></span></label>
    {error && <p className="platform-error" role="alert">{error}</p>}
    <button className="platform-button" type="submit" disabled={state === "loading"}>{state === "loading" && <LoadingMark small />}{state === "loading" ? "Saving…" : "Keep me updated"} <span aria-hidden="true">↗</span></button>
  </form>;
}
