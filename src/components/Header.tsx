"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { DEFAULT_SITE_SETTINGS } from "@/lib/platform";

const groups = [
  {
    label: "About",
    href: "/#about",
    items: [
      ["Who we are", "/#about"],
      ["Vision & mission", "/#about"],
      ["Our objectives", "/#objectives"],
      ["Leadership & governance", "/#leadership"],
      ["Why CEDAH", "/#investment"],
    ],
  },
  {
    label: "Enterprises",
    href: "/#enterprises",
    items: [
      ["Crop enterprise", "/#enterprises"],
      ["Beef enterprise", "/#enterprises"],
      ["Value addition", "/#what-we-do"],
      ["Growth roadmap", "/#roadmap"],
      ["Products & buyer enquiries", "/#products"],
      ["Our locations", "/#sites"],
    ],
  },
  {
    label: "How we work",
    href: "/#how-we-work",
    items: [
      ["Integrated model", "/#how-we-work"],
      ["Sustainability", "/#sustainability"],
      ["Market linkage", "/#what-we-do"],
      ["Farmer & training registration", "/#participate"],
      ["Market prices", "/#market-prices"],
    ],
  },
  {
    label: "Impact",
    href: "/#impact",
    items: [
      ["Shared prosperity", "/#impact"],
      ["Reported progress", "/#impact-dashboard"],
      ["Investment case", "/#investment"],
      ["Get involved", "/#get-involved"],
    ],
  },
  {
    label: "Updates",
    href: "/#news",
    items: [
      ["Latest news", "/#news"],
      ["Partner data room", "/#data-room"],
      ["Field work", "/#field-work"],
      ["Newsletter", "/#newsletter"],
      ["Contact media team", "/#contact"],
    ],
  },
];

export default function Header({ settings }: { settings?: Partial<typeof DEFAULT_SITE_SETTINGS> }) {
  const organisation = { ...DEFAULT_SITE_SETTINGS, ...settings };
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(scrollY > 30);
    onScroll();
    addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    if (!open) return;
    const openingFocus = document.activeElement;
    let focusFrame = 0;
    const focusWhenVisible = () => {
      // Visibility transitions can still be at their hidden starting frame
      // when an effect runs. Wait for the link to become focusable.
      if (document.activeElement !== openingFocus) return;
      const link = headerRef.current?.querySelector<HTMLAnchorElement>(".nav a");
      if (!link) return;
      if (getComputedStyle(link).visibility === "visible" && link.getClientRects().length) {
        link.focus({ preventScroll: true });
      } else {
        focusFrame = window.requestAnimationFrame(focusWhenVisible);
      }
    };
    focusFrame = window.requestAnimationFrame(focusWhenVisible);
    const handleKeyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setActiveGroup(null);
        menuRef.current?.focus();
      }
      if (event.key !== "Tab") return;
      const controls = Array.from(
        headerRef.current?.querySelectorAll<HTMLElement>("a[href], button:not(:disabled)") || [],
      ).filter((element) => element.getClientRects().length && getComputedStyle(element).visibility === "visible");
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    addEventListener("keydown", handleKeyboard);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.body.classList.remove("menu-open");
      removeEventListener("keydown", handleKeyboard);
    };
  }, [open]);

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 951px)");
    const closeOnDesktop = () => {
      if (desktop.matches) {
        setOpen(false);
        setActiveGroup(null);
      }
    };
    desktop.addEventListener("change", closeOnDesktop);
    return () => desktop.removeEventListener("change", closeOnDesktop);
  }, []);

  const close = () => {
    setOpen(false);
    setActiveGroup(null);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <div
        className="scroll-progress"
        style={{ transform: "scaleX(var(--scroll-progress, 0))" }}
      />
      <div className="topbar">
        <div className="shell topbar-inner">
          <span>Building value. Growing communities.</span>
          <div>
            <span>{organisation.location}</span>
            <a href={`mailto:${organisation.publicEmail}`}>{organisation.publicEmail}</a>
          </div>
        </div>
      </div>
      <header ref={headerRef} className={`header ${scrolled ? "scrolled" : ""}`}>
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
                    aria-controls={`submenu-${group.label.replaceAll(" ", "-").toLowerCase()}`}
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
                <div className="subnav" id={`submenu-${group.label.replaceAll(" ", "-").toLowerCase()}`}>
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
              <a href={`mailto:${organisation.publicEmail}`}>{organisation.publicEmail}</a>
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
            ref={menuRef}
            type="button"
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
        tabIndex={-1}
        onClick={() => { close(); menuRef.current?.focus(); }}
      />
    </>
  );
}
