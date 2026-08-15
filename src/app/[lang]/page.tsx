import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { Devotion } from "@/lib/types"
import Slideshow from "@/app/components/Slideshow"
import SubscribeForm from "@/app/components/SubscribeForm"
import { getDictionary } from "@/i18n/getDictionary"
import { isLocale, type Locale } from "@/i18n/config"
import { getQuoteOfDay } from "@/lib/getQuoteOfDay"


export const revalidate = 60

type TrRow = { locale: string; title: string | null; body: string | null }
type DevotionRow = Devotion & { devotion_translations?: TrRow[] | null }

function pick(d: DevotionRow, lang: string) {
  const list = d.devotion_translations || []
  const match = list.find((t) => t.locale === lang) || list.find((t) => t.locale === 'en')
  return { title: match?.title || d.title, content: match?.body || d.content }
}

// Plain-text preview from HTML content.
function stripHtml(html: string): string {
  return (html || '')
    .replace(/<\/(p|div|h[1-6]|li|blockquote)>/gi, ' ')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ').trim()
}

const dateLocales: Record<Locale, string> = { en: 'en-GB', id: 'id-ID', sw: 'sw-TZ' }

async function getLatestDevotions(): Promise<DevotionRow[]> {
  const { data } = await supabase
    .from("devotions")
    .select("*, devotion_translations(locale, title, body)")
    .order("date", { ascending: false })
    .limit(4)
  return (data || []) as unknown as DevotionRow[]
}


async function getSlides() {
  const { data } = await supabase
    .from("slideshow")
    .select("*")
    .order("sort_order", { ascending: true })
  return data || []
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang: Locale = isLocale(rawLang) ? rawLang : 'en'
  const dict = await getDictionary(lang)
  const quote = await getQuoteOfDay(lang)
  const h = dict.home
  const dl = dateLocales[lang]
  const L = (p: string) => `/${lang}${p === '/' ? '' : p}`

  const [devotions, slides] = await Promise.all([
    getLatestDevotions(),
    getSlides(),
  ])

   const { data: newsRows } = await supabase
    .from('news').select('id, title, slug, body, excerpt, cover_image, published_date')
    .eq('is_published', true)
    .order('published_date', { ascending: false })
    .limit(3)
 
  let newsTr: any[] = []
  if (lang !== 'en' && newsRows && newsRows.length) {
    const { data } = await supabase
      .from('news_translations')
      .select('news_id, locale, title, excerpt')
      .in('news_id', newsRows.map((r:any) => r.id))
      .eq('locale', lang)
    newsTr = data || []
  }
  const pickNews = (row:any) => {
    if (lang === 'en') return { title: row.title, excerpt: row.excerpt }
    const t = newsTr.find((x:any) => x.news_id === row.id)
    return { title: t?.title || row.title, excerpt: t?.excerpt || row.excerpt }
  }

  // Icons + destination stay in code; titles/descriptions come from the dict.
  const progMeta = [
    { icon: "✝", href: "/programs" },
    { icon: "🍞", href: "/programs" },
    { icon: "🤝", href: "/programs" },
    { icon: "📖", href: "/programs" },
  ]

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
            {h.heroTitle}
          </h1>
          <p style={{ fontSize: 18, color: "#a0a0b0", lineHeight: 1.8, marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
            {h.heroSubtitle}
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href={L("/about")} style={{
              background: "linear-gradient(135deg, #7B2FBE, #9B59B6)",
              color: "#fff", padding: "14px 32px", borderRadius: 30,
              fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
            }}>{h.ourMission}</Link>
            <Link href={L("/donate")} style={{
              background: "linear-gradient(135deg, #F5A623, #E8860A)",
              color: "#0D0D1A", padding: "14px 32px", borderRadius: 30,
              fontSize: 14, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
            }}>{h.supportUs}</Link>
          </div>
        </div>
      </section>

      {/* Photo Slideshow */}
      {slides.length > 0 && <Slideshow slides={slides} />}

      {/* Programs */}
      <section style={{ padding: "80px 24px", background: "#0D0D1A" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, textAlign: "center", marginBottom: 8, color: "#fff" }}>{h.ourPrograms}</h2>
          <p style={{ textAlign: "center", color: "#a0a0b0", marginBottom: 48 }}>{h.programsSubtitle}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 24 }}>
            {h.programs.map((prog, i) => (
              <Link key={i} href={L(progMeta[i].href)} style={{
                background: "linear-gradient(135deg, #1A0A2E, #16213E)",
                border: "1px solid rgba(123, 47, 190, 0.3)",
                borderRadius: 16, padding: 32, display: "block", textDecoration: "none",
              }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{progMeta[i].icon}</div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: "#F5A623", marginBottom: 12 }}>{prog.title}</h3>
                <p style={{ color: "#a0a0b0", fontSize: 14, lineHeight: 1.8 }}>{prog.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

       {/* Quote of the Day */}
      {quote && (
        <section style={{
          background: 'linear-gradient(135deg, #2A1043 0%, #1A0A2E 100%)',
          padding: '72px 24px', textAlign: 'center',
        }}>
          <div style={{ maxWidth: 820, margin: '0 auto', position: 'relative' }}>
            <p style={{
              color: '#F5A623', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 24,
            }}>
              {h.quoteOfDay}
            </p>
            <div style={{
              fontFamily: 'Georgia, serif', color: '#F5A623',
              fontSize: 64, lineHeight: 1, marginBottom: 8, opacity: 0.5,
            }}>&ldquo;</div>
            <blockquote style={{
              color: 'white', fontSize: 'clamp(20px, 3vw, 30px)',
              fontStyle: 'italic', fontFamily: 'Georgia, serif',
              lineHeight: 1.6, margin: '0 0 24px',
            }}>
              {quote.text}
            </blockquote>
            {quote.author && (
              <p style={{
                color: 'rgba(255,255,255,0.7)', fontSize: 15, fontWeight: 600,
                letterSpacing: '0.05em',
              }}>
                &mdash; {quote.author}
              </p>
            )}
            <div style={{ width: 50, height: 3, background: '#F5A623', margin: '28px auto 0' }} />
          </div>
        </section>
      )}

      {/* Latest Devotions */}
      {devotions.length > 0 && (
        <section style={{ padding: "80px 24px", background: "#1A0A2E" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>{h.latestDevotions}</h2>
                <p style={{ color: "#a0a0b0", marginTop: 8 }}>{h.devotionsSubtitle}</p>
              </div>
              <Link href={L("/devotions")} style={{ color: "#F5A623", fontSize: 14, fontWeight: 600 }}>{dict.common.viewAll} →</Link>
            </div>
            <div className="home-devotions-grid" style={{ display: "grid", gap: 24 }}>
              {devotions.map(d => {
                const dt = pick(d, lang)
                return (
                  <Link key={d.id} href={L(`/devotions/${d.slug}`)} style={{
                    background: "linear-gradient(135deg, #0D0D1A, #1A0A2E)",
                    border: "1px solid rgba(123, 47, 190, 0.3)",
                    borderRadius: 16, padding: 24, display: "block", textDecoration: "none",
                  }}>
                    <div style={{ fontSize: 11, color: "#9B59B6", letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
                      {new Date(d.date).toLocaleDateString(dl, { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>{dt.title}</h3>
                    <p style={{ color: "#a0a0b0", fontSize: 13, lineHeight: 1.8 }}>
                      {stripHtml(dt.content).substring(0, 100)}...
                    </p>
                    <div style={{ marginTop: 16, color: "#F5A623", fontSize: 13, fontWeight: 600 }}>{dict.common.readMore} →</div>
                  </Link>
                )
              })}
            </div>
          </div>
          <style>{`
            .home-devotions-grid { grid-template-columns: repeat(4, 1fr); }
            @media (max-width: 900px) { .home-devotions-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 560px) { .home-devotions-grid { grid-template-columns: 1fr; } }
          `}</style>
        </section>
      )}

      {/* Latest News */}
      {newsRows && newsRows.length > 0 && (
        <section style={{ padding: '80px 24px', background: '#0D0D1A' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48, flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 36, fontWeight: 800, color: '#fff' }}>{dict.newsPage.latestNews}</h2>
                <p style={{ color: '#a0a0b0', marginTop: 8 }}>{dict.newsPage.subtitle}</p>
              </div>
              <Link href={L('/news')} style={{ color: '#F5A623', fontSize: 14, fontWeight: 600 }}>{dict.newsPage.viewAll} →</Link>
            </div>
            <div className="home-news-grid" style={{ display: 'grid', gap: 24 }}>
              {newsRows.map((row:any) => {
                const c = pickNews(row)
                return (
                  <Link key={row.id} href={L(`/news/${row.slug}`)} style={{
                    background: 'linear-gradient(135deg, #1A0A2E, #16213E)',
                    border: '1px solid rgba(123,47,190,0.3)', borderRadius: 16,
                    overflow: 'hidden', textDecoration: 'none', display: 'block',
                  }}>
                    {row.cover_image && (
                      <div style={{ height: 170, overflow: 'hidden' }}>
                        <img src={row.cover_image} alt={c.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                    <div style={{ padding: 22 }}>
                      <div style={{ fontSize: 11, color: '#9B59B6', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
                        {new Date(row.published_date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <h3 style={{ fontSize: 17, fontWeight: 700, color: '#fff', marginBottom: 10, lineHeight: 1.35 }}>{c.title}</h3>
                      <p style={{ color: '#a0a0b0', fontSize: 13, lineHeight: 1.7 }}>
                        {(c.excerpt || stripHtml(row.body)).substring(0, 100)}...
                      </p>
                      <div style={{ marginTop: 14, color: '#F5A623', fontSize: 13, fontWeight: 600 }}>{dict.newsPage.readMore} →</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
          <style>{`
            .home-news-grid { grid-template-columns: repeat(3, 1fr); }
            @media (max-width: 900px) { .home-news-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 560px) { .home-news-grid { grid-template-columns: 1fr; } }
          `}</style>
        </section>
      )}

      {/* Get Involved */}
<section style={{ background: 'linear-gradient(135deg, #7B2FBE 0%, #F5A623 100%)', padding: '72px 24px', textAlign: 'center' }}>
  <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>
    {dict.membershipPage.eyebrow}
  </p>
  <h2 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 800, color: 'white', marginBottom: 16 }}>
    {dict.membershipPage.title}
  </h2>
  <p style={{ color: 'rgba(255,255,255,0.9)', maxWidth: 560, margin: '0 auto 32px', lineHeight: 1.8 }}>
    {dict.membershipPage.subtitle}
  </p>
  <Link href={L('/membership')} style={{
    background: 'white', color: '#7B2FBE', padding: '15px 40px', borderRadius: 30,
    fontSize: 15, fontWeight: 800, letterSpacing: 1, display: 'inline-block',
    textDecoration: 'none', textTransform: 'uppercase',
  }}>
    {dict.membershipPage.submit}
  </Link>
</section>

      {/* Subscribe */}
      <section style={{ background: '#1A0A2E', padding: '72px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p style={{ color: '#F5A623', fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 12 }}>{h.stayConnected}</p>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 800, color: 'white', marginBottom: 12 }}>
            {h.getUpdates}
          </h2>
          <div style={{ width: 50, height: 3, background: '#F5A623', margin: '0 auto 20px' }} />
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '1rem', marginBottom: 32, lineHeight: 1.8 }}>
            {h.subscribeText}
          </p>
          <SubscribeForm />
        </div>
      </section>

      {/* CTA */}
      <section style={{
        background: "linear-gradient(135deg, #7B2FBE 0%, #F5A623 100%)",
        padding: "80px 24px", textAlign: "center",
      }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, color: "#fff", marginBottom: 16 }}>{h.supportMission}</h2>
        <p style={{ fontSize: 18, color: "rgba(255,255,255,0.85)", marginBottom: 40, maxWidth: 600, margin: "0 auto 40px" }}>
          {h.supportText}
        </p>
        <Link href={L("/donate")} style={{
          background: "#fff", color: "#7B2FBE",
          padding: "16px 40px", borderRadius: 30,
          fontSize: 16, fontWeight: 800, letterSpacing: 1, display: "inline-block", textTransform: "uppercase",
        }}>{h.donateNow}</Link>
      </section>
    </div>
  )
}