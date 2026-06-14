"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [programsOpen, setProgramsOpen] = useState(false)
  const [pubOpen, setPubOpen] = useState(false)

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
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Image src="/logo.png" alt="TRVM Logo" width={50} height={50} style={{ objectFit: "contain" }} />
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="desktop-nav">
          {[{ label: "Home", href: "/" }, { label: "About", href: "/about" }].map(link => (
            <Link key={link.href} href={link.href} style={{ fontSize: 13, fontWeight: 600, color: "#e0e0f0", letterSpacing: 1, textTransform: "uppercase", transition: "color 0.2s", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#e0e0f0")}
            >{link.label}</Link>
          ))}

          {/* Programs dropdown */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setProgramsOpen(true)}
            onMouseLeave={() => setProgramsOpen(false)}>
            <Link href="/programs" style={{ fontSize: 13, fontWeight: 600, color: "#e0e0f0", letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#e0e0f0")}
            >Programs <span style={{ fontSize: 10 }}>▾</span></Link>
            {programsOpen && (
              <div style={dropdownStyle}>
                {[
                  { label: "Missions", href: "/programs/missions", icon: "✝" },
                  { label: "Care & Philanthropy", href: "/programs/care-philanthropy", icon: "🤝" },
                  { label: "Discipleship", href: "/programs/discipleship", icon: "📖" },
                ].map(item => (
                  <Link key={item.href} href={item.href} style={dropItemStyle}
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
            <Link href="/publications" style={{ fontSize: 13, fontWeight: 600, color: "#e0e0f0", letterSpacing: 1, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4, textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#e0e0f0")}
            >Publications <span style={{ fontSize: 10 }}>▾</span></Link>
            {pubOpen && (
              <div style={dropdownStyle}>
                {[
                  { label: "Books", href: "/publications#books", icon: "📚" },
                  { label: "Magazines", href: "/publications#magazines", icon: "📰" },
                  { label: "Newsletters", href: "/publications#newsletters", icon: "✉️" },
                ].map(item => (
                  <Link key={item.href} href={item.href} style={dropItemStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = "#F5A623"; e.currentTarget.style.background = "rgba(245,166,35,0.08)" }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#e0e0f0"; e.currentTarget.style.background = "transparent" }}
                  ><span>{item.icon}</span> {item.label}</Link>
                ))}
              </div>
            )}
          </div>

          {[
            { label: "Devotions", href: "/devotions" },
            { label: "Gallery", href: "/gallery" },
            { label: "Videos", href: "/videos" },
            { label: "Contact", href: "/contact" },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{ fontSize: 13, fontWeight: 600, color: "#e0e0f0", letterSpacing: 1, textTransform: "uppercase", transition: "color 0.2s", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#e0e0f0")}
            >{link.label}</Link>
          ))}

          <Link href="/donate" style={{ background: "linear-gradient(135deg, #F5A623, #E8860A)", color: "#0D0D1A", padding: "8px 20px", borderRadius: 25, fontSize: 13, fontWeight: 800, letterSpacing: 1, textDecoration: "none" }}>
            DONATE
          </Link>
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
            { label: "Home", href: "/", sub: false },
            { label: "About", href: "/about", sub: false },
            { label: "Programs", href: "/programs", sub: false },
            { label: "→ Missions", href: "/programs/missions", sub: true },
            { label: "→ Care & Philanthropy", href: "/programs/care-philanthropy", sub: true },
            { label: "→ Discipleship", href: "/programs/discipleship", sub: true },
            { label: "Publications", href: "/publications", sub: false },
            { label: "→ Books", href: "/publications#books", sub: true },
            { label: "→ Magazines", href: "/publications#magazines", sub: true },
            { label: "→ Newsletters", href: "/publications#newsletters", sub: true },
            { label: "Devotions", href: "/devotions", sub: false },
            { label: "Gallery", href: "/gallery", sub: false },
             { label: "Videos", href: "/videos" },
            { label: "Contact", href: "/contact", sub: false },
            { label: "Donate", href: "/donate", sub: false },
          ].map(link => (
            <Link key={link.href} href={link.href}
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
        </div>
      )}

      <style>{`
        @media (min-width: 768px) { .mobile-menu-btn { display: none !important; } }
        @media (max-width: 767px) { .desktop-nav { display: none !important; } }
      `}</style>
    </nav>
  )
}