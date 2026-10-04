"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";

const groups = [
  {
    label: "About",
    href: "/#about",
    items: [
      ["Who we are", "/#about"],
      ["Vision & mission", "/#about"],
      ["Why CEDAH", "/#investment"],
    ],
  },
  {
    label: "Enterprises",
    href: "/#enterprises",
    items: [
      ["Crop enterprise", "/#crop-enterprise"],
      ["Beef enterprise", "/#beef-enterprise"],
      ["Value addition", "/#what-we-do"],
      ["Growth roadmap", "/#roadmap"],
    ],
  },
  {
    label: "How we work",
    href: "/#how-we-work",
    items: [
      ["Integrated model", "/#how-we-work"],
      ["Sustainability", "/#sustainability"],
      ["Market linkage", "/#what-we-do"],
    ],
  },
  {
    label: "Impact",
    href: "/#impact",
    items: [
      ["Shared prosperity", "/#impact"],
      ["Investment case", "/#investment"],
      ["Get involved", "/#get-involved"],
    ],
  },
  {
    label: "Updates",
    href: "/#news",
    items: [
      ["Latest news", "/#news"],
      ["Partner brief", "/#investment"],
      ["Contact media team", "/#contact"],
    ],
  },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 30);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.classList.remove("menu-open");
      removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setActiveGroup(null);
  };

  return (
    <>
      <div
        className="scroll-progress"
        style={{ transform: "scaleX(var(--scroll-progress, 0))" }}
      />
      <div className="topbar">
        <div className="shell topbar-inner">
          <span>Building value. Growing communities.</span>
          <div>
            <span>Kampala, Uganda</span>
            <a href="mailto:info@cedah.com">info@cedah.com</a>
          </div>
        </div>
      </div>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <div className="shell nav-wrap">
          <Link href="/#home" className="brand" onClick={close}>
            <Image
              src="/images/cedah-logo.png"
              alt="CEDAH, Capital Economic Development Alliance Holdings Ltd"
              width={430}
              height={144}
              priority
            />
          </Link>
          <nav
            className={open ? "nav open" : "nav"}
            aria-label="Main navigation"
            id="primary-navigation"
          >
            <div className="mobile-menu-intro">
              <span>Explore CEDAH</span>
              <p>Enterprise, investment and shared prosperity.</p>
            </div>
            {groups.map((group) => (
              <div
                className={`nav-group ${activeGroup === group.label ? "mobile-active" : ""}`}
                key={group.label}
              >
                <div className="nav-group-row">
                  <Link href={group.href} onClick={close}>
                    {group.label}
                    <span className="nav-chevron">⌄</span>
                  </Link>
                  <button
                    className="mobile-submenu-toggle"
                    type="button"
                    aria-expanded={activeGroup === group.label}
                    aria-label={`Toggle ${group.label} links`}
                    onClick={() =>
                      setActiveGroup(
                        activeGroup === group.label ? null : group.label,
                      )
                    }
                  >
                    <span>+</span>
                  </button>
                </div>
                <div className="subnav">
                  <span>{group.label}</span>
                  {group.items.map(([label, href]) => (
                    <Link href={href} onClick={close} key={label}>
                      {label}
                      <b>↗</b>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <div className="mobile-menu-footer">
              <Link href="/#contact" className="mobile-partner" onClick={close}>
                <span>
                  <small>Partnership desk</small>
                  Start a conversation
                </span>
                <b>↗</b>
              </Link>
              <Link
                href="/admin/login"
                className="mobile-login"
                onClick={close}
              >
                Administrator login <span>→</span>
              </Link>
              <div className="mobile-theme-control">
                <span>Appearance</span>
                <ThemeToggle />
              </div>
              <a href="mailto:info@cedah.com">info@cedah.com</a>
            </div>
          </nav>
          <div className="nav-actions">
            <ThemeToggle compact />
            <Link
              href="/admin/login"
              className="login-link"
              title="Administrator login"
            >
              <span className="login-icon">◉</span> Login
            </Link>
            <Link href="/#contact" className="nav-cta">
              Partner <span>↗</span>
            </Link>
          </div>
          <button
            className={`menu ${open ? "active" : ""}`}
            onClick={() => setOpen(!open)}
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="primary-navigation"
          >
            <span className="menu-label">{open ? "Close" : "Menu"}</span>
            <span className="menu-bars" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>
      <button
        className={`menu-backdrop ${open ? "visible" : ""}`}
        aria-label="Close navigation"
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
    </>
  );
}
