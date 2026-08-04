"use client"
import { useState } from "react"
import { usePathname } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { getDict, localize, localeFromPathname } from "@/i18n/client"
import LanguageSwitcher from "./LanguageSwitcher"

// Goes at: src/app/components/Navbar.tsx
export default function Navbar() {
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const [menuOpen, setMenuOpen] = useState(false)
  const [programsOpen, setProgramsOpen] = useState(false)
  const [pubOpen, setPubOpen] = useState(false)

  const d = getDict(locale)
  const L = (href: string) => localize(href, locale)

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

  return (
    <nav style={{
      background: "linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)",
      borderBottom: "1px solid rgba(123, 47, 190, 0.3)",
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: "0 auto", padding: "0 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", height: 70,
      }}>
        {/* Logo */}
        <Link href={L("/")} style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/logo.png" alt="TRVM Logo" width={50} height={50} style={{ objectFit: "contain" }} />
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="desktop-nav">
          {[{ label: d.nav.home, href: "/" }, { label: d.nav.about, href: "/about" }].map(link => (
            <Link key={link.href} href={L(link.href)} style={{ fontSize: 13, fontWeight: 600, color: "#e0e0f0", letterSpacing: 1, textTransform: "uppercase", transition: "color 0.2s", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#e0e0f0")}
            >{link.label}</Link>
          ))}

          {/* Programs dropdown */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setProgramsOpen(true)}
            onMouseLeave={() => setProgramsOpen(false)}>
            <Link href={L("/programs")} style={{ fontSize: 13, fontWeight: 600, color: "#e0e0f0", letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#e0e0f0")}
            >{d.nav.programs} <span style={{ fontSize: 10 }}>▾</span></Link>
            {programsOpen && (
              <div style={dropdownStyle}>
                {[
                  { label: d.programs.missions, href: "/programs/missions", icon: "✝" },
                  { label: d.programs.carePhilanthropy, href: "/programs/care-philanthropy", icon: "🤝" },
                  { label: d.programs.discipleship, href: "/programs/discipleship", icon: "📖" },
                ].map(item => (
                  <Link key={item.href} href={L(item.href)} style={dropItemStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = "#F5A623"; e.currentTarget.style.background = "rgba(245,166,35,0.08)" }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#e0e0f0"; e.currentTarget.style.background = "transparent" }}
                  ><span>{item.icon}</span> {item.label}</Link>
                ))}
              </div>
            )}
          </div>

          {/* Publications dropdown */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setPubOpen(true)}
            onMouseLeave={() => setPubOpen(false)}>
            <Link href={L("/publications")} style={{ fontSize: 13, fontWeight: 600, color: "#e0e0f0", letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#e0e0f0")}
            >{d.nav.publications} <span style={{ fontSize: 10 }}>▾</span></Link>
            {pubOpen && (
              <div style={dropdownStyle}>
                {[
                  { label: d.pub.books, href: "/publications#books", icon: "📚" },
                  { label: d.pub.magazines, href: "/publications#magazines", icon: "📰" },
                  { label: d.pub.newsletters, href: "/publications#newsletters", icon: "✉️" },
                ].map(item => (
                  <Link key={item.href} href={L(item.href)} style={dropItemStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = "#F5A623"; e.currentTarget.style.background = "rgba(245,166,35,0.08)" }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#e0e0f0"; e.currentTarget.style.background = "transparent" }}
                  ><span>{item.icon}</span> {item.label}</Link>
                ))}
              </div>
            )}
          </div>

          {[
            { label: d.nav.devotions, href: "/devotions" },
            { label: d.nav.gallery, href: "/gallery" },
            { label: d.nav.videos, href: "/videos" },
            { label: d.nav.contact, href: "/contact" },
          ].map(link => (
            <Link key={link.href} href={L(link.href)} style={{ fontSize: 13, fontWeight: 600, color: "#e0e0f0", letterSpacing: 1, textTransform: "uppercase", transition: "color 0.2s", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#e0e0f0")}
            >{link.label}</Link>
          ))}

          <Link href={L("/donate")} style={{ background: "linear-gradient(135deg, #F5A623, #E8860A)", color: "#0D0D1A", padding: "8px 20px", borderRadius: 25, fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", textDecoration: "none" }}>
            {d.nav.donate}
          </Link>

          {/* Language switcher */}
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
            { label: d.nav.home, href: "/", sub: false },
            { label: d.nav.about, href: "/about", sub: false },
            { label: d.nav.programs, href: "/programs", sub: false },
            { label: "→ " + d.programs.missions, href: "/programs/missions", sub: true },
            { label: "→ " + d.programs.carePhilanthropy, href: "/programs/care-philanthropy", sub: true },
            { label: "→ " + d.programs.discipleship, href: "/programs/discipleship", sub: true },
            { label: d.nav.publications, href: "/publications", sub: false },
            { label: "→ " + d.pub.books, href: "/publications#books", sub: true },
            { label: "→ " + d.pub.magazines, href: "/publications#magazines", sub: true },
            { label: "→ " + d.pub.newsletters, href: "/publications#newsletters", sub: true },
            { label: d.nav.devotions, href: "/devotions", sub: false },
            { label: d.nav.gallery, href: "/gallery", sub: false },
            { label: d.nav.videos, href: "/videos", sub: false },
            { label: d.nav.contact, href: "/contact", sub: false },
            { label: d.nav.donate, href: "/donate", sub: false },
          ].map(link => (
            <Link key={link.href} href={L(link.href)}
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

          {/* Language switcher (mobile) */}
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