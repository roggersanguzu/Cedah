export default function WhatsAppLink({ number = "+256769758805" }: { number?: string }) {
  const digits = number.replace(/\D/g, "");
  const contact = /^\d{8,15}$/.test(digits) ? digits : "256769758805";
  return (
    <a
      className="whatsapp-link"
      href={`https://wa.me/${contact}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Chat with CEDAH on WhatsApp at +${contact} (opens a new tab)`}
      title="Chat with CEDAH on WhatsApp"
    >
      <svg viewBox="0 0 32 32" aria-hidden="true" fill="currentColor">
        <path d="M16.04 3a12.8 12.8 0 0 0-11.1 19.16L3 29l7.04-1.85A12.8 12.8 0 1 0 16.04 3Zm0 23.35a10.5 10.5 0 0 1-5.35-1.47l-.38-.23-4.18 1.1 1.12-4.07-.25-.4a10.55 10.55 0 1 1 9.04 5.07Zm5.81-7.89c-.32-.16-1.89-.93-2.18-1.04-.3-.11-.51-.16-.72.16-.22.32-.83 1.04-1.01 1.25-.19.21-.38.24-.7.08-.32-.16-1.35-.5-2.57-1.6-.95-.85-1.59-1.89-1.78-2.21-.18-.32-.02-.49.14-.65.15-.14.32-.37.48-.56.16-.18.21-.32.32-.53.11-.21.05-.4-.03-.56-.08-.16-.72-1.73-.99-2.37-.26-.63-.52-.55-.72-.56h-.61c-.22 0-.56.08-.85.4-.3.32-1.12 1.09-1.12 2.66 0 1.57 1.15 3.08 1.31 3.29.16.21 2.26 3.45 5.48 4.84.77.33 1.37.52 1.84.67.77.25 1.47.22 2.02.13.62-.09 1.89-.77 2.16-1.51.27-.75.27-1.39.19-1.52-.08-.13-.29-.21-.61-.37Z" />
      </svg>
      <span className="whatsapp-tooltip" aria-hidden="true">Let’s talk on WhatsApp</span>
    </a>
  );
}
