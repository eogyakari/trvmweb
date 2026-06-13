"use client"
import { useState } from "react"
import Image from "next/image"
import Link from "next/link"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [programsOpen, setProgramsOpen] = useState(false)

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
          <div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#F5A623", letterSpacing: 2 }}>THE RIGHTEOUS VINE</div>
            <div style={{ fontSize: 11, color: "#9B59B6", letterSpacing: 3 }}>MISSIONS</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", gap: 28, alignItems: "center" }} className="desktop-nav">
          {[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{
              fontSize: 13, fontWeight: 600, color: "#e0e0f0",
              letterSpacing: 1, textTransform: "uppercase", transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#e0e0f0")}
            >{link.label}</Link>
          ))}

          {/* Programs dropdown */}
          <div style={{ position: "relative" }}
            onMouseEnter={() => setProgramsOpen(true)}
            onMouseLeave={() => setProgramsOpen(false)}>
            <Link href="/programs" style={{
              fontSize: 13, fontWeight: 600, color: "#e0e0f0",
              letterSpacing: 1, textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: 4,
              textDecoration: "none"
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#e0e0f0")}
            >
              Programs <span style={{ fontSize: 10 }}>▾</span>
            </Link>
            {programsOpen && (
              <div style={{
                position: "absolute", top: "100%", left: "50%", transform: "translateX(-50%)",
                background: "#1A0A2E", borderRadius: 8, padding: "8px 0",
                minWidth: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
                border: "1px solid rgba(123,47,190,0.3)",
                marginTop: 8, zIndex: 200
              }}>
                {[
                  { label: "Missions", href: "/programs/missions", icon: "✝" },
                  
                  { label: "Care & Philanthropy", href: "/programs/care-philanthropy", icon: "🤝" },
                  { label: "Discipleship", href: "/programs/discipleship", icon: "📖" },
                ].map(item => (
                  <Link key={item.href} href={item.href}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 20px", color: "#e0e0f0", fontSize: 13,
                      fontWeight: 600, textDecoration: "none", transition: "all 0.15s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = "#F5A623"; e.currentTarget.style.background = "rgba(245,166,35,0.08)" }}
                    onMouseLeave={e => { e.currentTarget.style.color = "#e0e0f0"; e.currentTarget.style.background = "transparent" }}
                  >
                    <span>{item.icon}</span> {item.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {[
            { label: "Publications", href: "/publications" },
            { label: "Devotions", href: "/devotions" },
            { label: "Gallery", href: "/gallery" },
            { label: "Contact", href: "/contact" },
          ].map(link => (
            <Link key={link.href} href={link.href} style={{
              fontSize: 13, fontWeight: 600, color: "#e0e0f0",
              letterSpacing: 1, textTransform: "uppercase", transition: "color 0.2s",
            }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
              onMouseLeave={e => (e.currentTarget.style.color = "#e0e0f0")}
            >{link.label}</Link>
          ))}

          <Link href="/donate" style={{
            background: "linear-gradient(135deg, #F5A623, #E8860A)",
            color: "#0D0D1A", padding: "8px 20px", borderRadius: 25,
            fontSize: 13, fontWeight: 800, letterSpacing: 1, textDecoration: "none"
          }}>DONATE</Link>
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
        <div style={{ background: "#1A0A2E", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { label: "Home", href: "/" },
            { label: "About", href: "/about" },
            { label: "Programs", href: "/programs" },
            { label: "→ Missions", href: "/programs/missions" },
            
            { label: "→ Care & Philanthropy", href: "/programs/care-philanthropy" },
            { label: "→ Discipleship", href: "/programs/discipleship" },
            { label: "Publications", href: "/publications" },
            { label: "Devotions", href: "/devotions" },
            { label: "Gallery", href: "/gallery" },
            { label: "Contact", href: "/contact" },
            { label: "Donate", href: "/donate" },
          ].map(link => (
            <Link key={link.href} href={link.href}
              onClick={() => setMenuOpen(false)}
              style={{
                color: link.href.includes('/programs/') ? "rgba(224,224,240,0.6)" : "#e0e0f0",
                fontSize: link.href.includes('/programs/') ? 13 : 15,
                fontWeight: 600, padding: "10px 0",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
                textDecoration: "none",
                paddingLeft: link.href.includes('/programs/') ? 16 : 0
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
