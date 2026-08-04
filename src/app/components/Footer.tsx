"use client"

import Link from "next/link"
import SubscribeForm from "./SubscribeForm"
import { usePathname } from "next/navigation"
import { getDict, localize, localeFromPathname } from "@/i18n/client"

// Goes at: src/app/components/Footer.tsx
export default function Footer() {
  const pathname = usePathname()
  const locale = localeFromPathname(pathname)
  const dict = getDict(locale)
  const L = (p: string) => localize(p, locale)

  const quickLinks = [
    { label: dict.nav.about, href: "/about" },
    { label: dict.nav.programs, href: "/programs" },
    { label: dict.nav.publications, href: "/publications" },
    { label: dict.nav.devotions, href: "/devotions" },
    { label: dict.nav.gallery, href: "/gallery" },
    { label: dict.nav.contact, href: "/contact" },
  ]

  return (
    <footer style={{
      background: "linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 100%)",
      borderTop: "1px solid rgba(123, 47, 190, 0.3)",
      padding: "48px 24px 24px",
      marginTop: 80,
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, marginBottom: 40 }}>

          {/* About */}
          <div>
            <h3 style={{ color: "#F5A623", fontSize: 14, fontWeight: 800, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>
              The Righteous Vine Missions
            </h3>
            <p style={{ color: "#a0a0b0", fontSize: 13, lineHeight: 1.8 }}>
              {dict.footer.aboutBlurb}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ color: "#F5A623", fontSize: 14, fontWeight: 800, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>{dict.footer.quickLinks}</h3>
            {quickLinks.map(link => (
              <div key={link.href} style={{ marginBottom: 8 }}>
                <Link href={L(link.href)} style={{ color: "#a0a0b0", fontSize: 13, transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#F5A623")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#a0a0b0")}
                >{link.label}</Link>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h3 style={{ color: "#F5A623", fontSize: 14, fontWeight: 800, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>{dict.nav.contact}</h3>
            <p style={{ color: "#a0a0b0", fontSize: 13, marginBottom: 8 }}>📧 info@trvmissions.com</p>
            <p style={{ color: "#a0a0b0", fontSize: 13, marginBottom: 8 }}>📞 +233 244 185 357</p>
            <p style={{ color: "#a0a0b0", fontSize: 13 }}>📞 +233 538 854 067</p>
          </div>

          {/* Social */}
          <div>
            <h3 style={{ color: "#F5A623", fontSize: 14, fontWeight: 800, letterSpacing: 2, marginBottom: 16, textTransform: "uppercase" }}>{dict.footer.followUs}</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <a href="https://whatsapp.com/channel/0029Va8tSmMJ93wYZHZvZk1C" target="_blank" rel="noreferrer" style={{ color: "#a0a0b0", fontSize: 13 }}>WhatsApp Channel</a>
            </div>
          </div>
        </div>

        {/* Subscribe strip */}
        <div style={{
          borderTop: "1px solid rgba(123,47,190,0.2)",
          borderBottom: "1px solid rgba(123,47,190,0.2)",
          padding: "28px 0", marginBottom: 24
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: "0 0 auto" }}>
              <p style={{ color: "#F5A623", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>{dict.footer.newsletter}</p>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{dict.footer.inboxUpdates}</p>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <SubscribeForm compact />
            </div>
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "#606070", fontSize: 12 }}>
            © {new Date().getFullYear()} The Righteous Vine Missions. {dict.footer.rights}.
          </p>
        </div>
      </div>
    </footer>
  )
}