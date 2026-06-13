import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { Devotion } from "@/lib/types"
import Slideshow from "./components/Slideshow"

export const revalidate = 60

async function getLatestDevotions(): Promise<Devotion[]> {
  const { data } = await supabase
    .from("devotions")
    .select("*")
    .order("date", { ascending: false })
    .limit(3)
  return data || []
}

async function getSlides() {
  const { data } = await supabase
    .from("slideshow")
    .select("*")
    .order("sort_order", { ascending: true })
  return data || []
}

export default async function HomePage() {
  const [devotions, slides] = await Promise.all([
    getLatestDevotions(),
    getSlides(),
  ])

  return (
    <div>
      {/* Hero */}
      <section style={{
        background: "linear-gradient(135deg, #0D0D1A 0%, #1A0A2E 50%, #0D1A2E 100%)",
        minHeight: "90vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "80px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute",
          width: 600, height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(123,47,190,0.15) 0%, transparent 70%)",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }} />
        <div style={{ position: "relative", maxWidth: 800 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#F5A623", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16 }}>
            ✝ The Righteous Vine Missions
          </div>
          <h1 style={{
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 800, lineHeight: 1.1, marginBottom: 24,
            background: "linear-gradient(135deg, #F5A623, #9B59B6)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Spreading the Gospel to the Ends of the Earth
          </h1>
          <p style={{ fontSize: 18, color: "#a0a0b0", lineHeight: 1.8, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            Reaching the unreached, feeding the hungry, discipling the nations — one mission at a time.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/about" style={{
              background: "linear-gradient(135deg, #7B2FBE, #9B59B6)",
              color: "#fff", padding: "14px 32px", borderRadius: 30,
              fontSize: 14, fontWeight: 700, letterSpacing: 1,
            }}>OUR MISSION</Link>
            <Link href="/donate" style={{
              background: "linear-gradient(135deg, #F5A623, #E8860A)",
              color: "#0D0D1A", padding: "14px 32px", borderRadius: 30,
              fontSize: 14, fontWeight: 700, letterSpacing: 1,
            }}>SUPPORT US</Link>
          </div>
        </div>
      </section>

      {/* Photo Slideshow */}
      {slides.length > 0 && <Slideshow slides={slides} />}

      {/* Programs */}
      <section style={{ padding: "80px 24px", background: "#0D0D1A" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 8, color: "#fff" }}>Our Programs</h2>
          <p style={{ textAlign: "center", color: "#a0a0b0", marginBottom: 48 }}>How we serve communities around the world</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {[
              { icon: "✝", title: "Missions", desc: "Evangelism and gospel outreach to unreached communities across islands and nations.", href: "/programs" },
              { icon: "🍞", title: "Feeding Program", desc: "Providing nutritious meals to the hungry and vulnerable in underserved communities.", href: "/programs" },
              { icon: "🤝", title: "Philanthropy", desc: "Supporting communities through education, healthcare, and social development.", href: "/programs" },
              { icon: "📖", title: "Discipleship", desc: "Training and equipping believers to grow in faith and share the gospel.", href: "/programs" },
            ].map(prog => (
              <Link key={prog.title} href={prog.href} style={{
                background: "linear-gradient(135deg, #1A0A2E, #16213E)",
                border: "1px solid rgba(123, 47, 190, 0.3)",
                borderRadius: 16, padding: 32, display: "block", textDecoration: "none",
              }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{prog.icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#F5A623", marginBottom: 12 }}>{prog.title}</h3>
                <p style={{ color: "#a0a0b0", fontSize: 14, lineHeight: 1.8 }}>{prog.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Devotions */}
      {devotions.length > 0 && (
        <section style={{ padding: "80px 24px", background: "#1A0A2E" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>Latest Devotions</h2>
                <p style={{ color: "#a0a0b0", marginTop: 8 }}>Daily words of encouragement</p>
              </div>
              <Link href="/devotions" style={{ color: "#F5A623", fontSize: 14, fontWeight: 600 }}>View All →</Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 24 }}>
              {devotions.map(d => (
                <Link key={d.id} href={`/devotions/${d.slug}`} style={{
                  background: "linear-gradient(135deg, #0D0D1A, #1A0A2E)",
                  border: "1px solid rgba(123, 47, 190, 0.3)",
                  borderRadius: 16, padding: 24, display: "block", textDecoration: "none",
                }}>
                  <div style={{ fontSize: 11, color: "#9B59B6", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                    {new Date(d.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{d.title}</h3>
                  <p style={{ color: "#a0a0b0", fontSize: 13, lineHeight: 1.8 }}>
                    {d.content.substring(0, 100)}...
                  </p>
                  <div style={{ marginTop: 16, color: "#F5A623", fontSize: 13, fontWeight: 600 }}>Read More →</div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{
        background: "linear-gradient(135deg, #7B2FBE 0%, #F5A623 100%)",
        padding: "80px 24px", textAlign: "center",
      }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Support Our Mission</h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
          Your donation helps us reach more souls, feed more families, and spread the gospel further.
        </p>
        <Link href="/donate" style={{
          background: "#fff", color: "#7B2FBE",
          padding: "16px 40px", borderRadius: 30,
          fontSize: 16, fontWeight: 800, letterSpacing: 1, display: "inline-block",
        }}>DONATE NOW</Link>
      </section>
    </div>
  )
}
