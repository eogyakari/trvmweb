"use client"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getDict, localize, localeFromPathname } from "@/i18n/client"
import LanguageSwitcher from "./LanguageSwitcher"

export default function Navbar() {
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const d = getDict(locale)
  const L = (href: string) => localize(href, locale)

  // Is this the homepage? (locale root, e.g. /en, /id, /sw, or /)
  const isHome = pathname === "/" || /^\/[a-z]{2}$/.test(pathname || "")
  // Transparent only on the homepage AND when not scrolled.
  const transparent = isHome && !scrolled

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const dropdownStyle: React.CSSProperties = {
    position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
    background: "#1A0A2E", borderRadius: 8, padding: "8px 0",
    minWidth: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
    border: "1px solid rgba(123,47,190,0.3)", marginTop: 8, zIndex: 200
  }
  const dropItemStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px 20px", color: "#e0e0f0", fontSize: 13,
    fontWeight: 600, textDecoration: "none", transition: "all 0.15s"
  }
  const linkStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: 1,
    textTransform: "uppercase", transition: "color 0.2s", textDecoration: "none",
    display: "flex", alignItems: "center", gap: 4,
  }

  return (
    <nav style={{
      background: transparent ? "transparent" : "linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)",
      borderBottom: transparent ? "1px solid transparent" : "1px solid rgba(123, 47, 190, 0.3)",
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      transition: "background 0.3s, border-color 0.3s",
    }}>
      <div style={{
        maxWidth: 1280, margin: "0 auto", padding: "0 clamp(20px, 4vw, 40px)",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 72,
      }}>
        {/* Brand */}
        <Link href={L("/")} style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <Image src="/logo.png" alt="TRVM Logo" width={44} height={44} style={{ objectFit: "contain" }} />
          <span style={{ color: "#fff", fontWeight: 800, fontSize: 18, letterSpacing: 1, fontFamily: "Georgia, serif" }}>
            TRV MISSIONS
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", gap: 26, alignItems: "center" }} className="desktop-nav">
          {[
            { label: d.nav.missions || "Missions", href: "/programs/missions" },
            { label: d.nav.devotions, href: "/devotions" },
            { label: d.nav.news || "News", href: "/news" },
          ].map(link => (
            <Link key={link.href} href={L(link.href)} style={linkStyle}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#fff")}
            >{link.label}</Link>
          ))}

          {/* Media dropdown */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setMediaOpen(true)} onMouseLeave={() => setMediaOpen(false)}>
            <span style={{ ...linkStyle, cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#fff")}
            >{d.nav.media || "Media"} <span style={{ fontSize: 10 }}>▾</span></span>
            {mediaOpen && (
              <div style={dropdownStyle}>
                {[
                  { label: d.nav.gallery, href: "/gallery", icon: "🖼️" },
                  { label: d.nav.videos, href: "/videos", icon: "🎬" },
                  { label: d.nav.publications, href: "/publications", icon: "📚" },
                ].map(item => (
                  <Link key={item.href} href={L(item.href)} style={dropItemStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = "#F5A623"; e.currentTarget.style.background = "rgba(245,166,35,0.08)" }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#e0e0f0"; e.currentTarget.style.background = "transparent" }}
                  ><span>{item.icon}</span> {item.label}</Link>
                ))}
              </div>
            )}
          </div>

          {/* About dropdown */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setAboutOpen(true)} onMouseLeave={() => setAboutOpen(false)}>
            <span style={{ ...linkStyle, cursor: "pointer" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#fff")}
            >{d.nav.about} <span style={{ fontSize: 10 }}>▾</span></span>
            {aboutOpen && (
              <div style={dropdownStyle}>
                {[
                  { label: d.nav.about, href: "/about", icon: "✝" },
                  { label: d.nav.programs, href: "/programs", icon: "📋" },
                  { label: d.nav.contact, href: "/contact", icon: "✉️" },
                ].map(item => (
                  <Link key={item.href} href={L(item.href)} style={dropItemStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = "#F5A623"; e.currentTarget.style.background = "rgba(245,166,35,0.08)" }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#e0e0f0"; e.currentTarget.style.background = "transparent" }}
                  ><span>{item.icon}</span> {item.label}</Link>
                ))}
              </div>
            )}
          </div>

          <Link href={L("/donate")} style={{ background: "linear-gradient(135deg, #F5A623, #E8860A)", color: "#0D0D1A", padding: "9px 22px", borderRadius: 25, fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>
            {d.nav.give || d.nav.donate}
          </Link>

          <LanguageSwitcher current={locale} />
        </div>

        {/* Mobile menu button */}
        <button onClick={() => setMenuOpen(!menuOpen)}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#F5A623", fontSize: 24 }}
          className="mobile-menu-btn">
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{ background: "#1A0A2E", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 2 }}>
          {[
            { label: d.nav.missions || "Missions", href: "/programs/missions", sub: false },
            { label: d.nav.devotions, href: "/devotions", sub: false },
            { label: d.nav.news || "News", href: "/news", sub: false },
            { label: d.nav.media || "Media", href: "/gallery", sub: false },
            { label: "→ " + d.nav.gallery, href: "/gallery", sub: true },
            { label: "→ " + d.nav.videos, href: "/videos", sub: true },
            { label: "→ " + d.nav.publications, href: "/publications", sub: true },
            { label: d.nav.about, href: "/about", sub: false },
            { label: "→ " + d.nav.programs, href: "/programs", sub: true },
            { label: "→ " + d.nav.contact, href: "/contact", sub: true },
            { label: d.nav.give || d.nav.donate, href: "/donate", sub: false },
          ].map(link => (
            <Link key={link.href + link.label} href={L(link.href)}
              onClick={() => setMenuOpen(false)}
              style={{
                color: link.sub ? "rgba(224,224,240,0.6)" : "#e0e0f0",
                fontSize: link.sub ? 13 : 15, fontWeight: 600,
                padding: "10px 0", paddingLeft: link.sub ? 16 : 0,
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                textDecoration: "none"
              }}
            >{link.label}</Link>
          ))}
          <div style={{ marginTop: 14 }}>
            <LanguageSwitcher current={locale} />
          </div>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .mobile-menu-btn { display: none !important; } }
        @media (max-width: 767px) { .desktop-nav { display: none !important; } }
      `}</style>
    </nav>
  )
}