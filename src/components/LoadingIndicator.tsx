import "@/app/loading-indicator.css";

/** A growing grain stem inside a moving value-chain ring. No artificial delay. */
export function LoadingMark({ small = false }: { small?: boolean }) {
  return <span className={`cedah-loading-mark${small ? " is-small" : ""}`} aria-hidden="true">
    <svg viewBox="0 0 120 120" fill="none">
      <circle className="loader-halo" cx="60" cy="60" r="51" />
      <g className="loader-orbit">
        <circle className="loader-ring" cx="60" cy="60" r="44" pathLength="100" />
        <circle className="loader-seed" cx="60" cy="16" r="4" />
        <circle className="loader-seed loader-seed-secondary" cx="60" cy="104" r="3" />
      </g>
      <path className="loader-field" d="M35 84c14-7 36-7 50 0M40 91c11-5 29-5 40 0" />
      <g className="loader-sprout">
        <path className="loader-stem" d="M60 79V42" />
        <path className="loader-leaf leaf-left" d="M60 63C45 64 38 54 39 43c13 0 21 7 21 20Z" />
        <path className="loader-leaf leaf-right" d="M60 52c0-15 9-24 22-24 1 13-7 24-22 24Z" />
        <path className="loader-vein" d="m60 62-12-10m12 0 13-13" />
      </g>
    </svg>
  </span>;
}

export default function LoadingIndicator({ label = "Preparing your next step", compact = false, page = false }: { label?: string; compact?: boolean; page?: boolean }) {
  return <div className={`cedah-loading${compact ? " is-compact" : ""}${page ? " is-page" : ""}`} role="status" aria-live="polite" aria-busy="true">
    <LoadingMark />
    <div className="cedah-loading-copy">
      {!compact && <><span className="cedah-loading-brand" aria-hidden="true">CEDAH</span><span className="cedah-loading-purpose" aria-hidden="true">Rooted in purpose. Growing together.</span></>}
      <span className="cedah-loading-label">{label}<span className="loader-dots" aria-hidden="true"><i /><i /><i /></span></span>
    </div>
  </div>;
}
