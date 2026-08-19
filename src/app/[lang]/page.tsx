import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { Devotion } from "@/lib/types"
import Slideshow from "@/app/components/Slideshow"
import SubscribeForm from "@/app/components/SubscribeForm"
import { getDictionary } from "@/i18n/getDictionary"
import { isLocale, type Locale } from "@/i18n/config"
import { getQuoteOfDay } from "@/lib/getQuoteOfDay"
import CinematicHero from "../components/CinematicHero"



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
  .from('news').select('id, title, slug, body, excerpt, cover_image, published_date, category')
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

  const { data: featuredEvent } = await supabase
    .from('featured_event').select('*').eq('is_active', true).limit(1).maybeSingle()

  // Icons + destination stay in code; titles/descriptions come from the dict.
  const progMeta = [
    { icon: "✝", href: "/programs" },
    { icon: "🍞", href: "/programs" },
    { icon: "🤝", href: "/programs" },
    { icon: "📖", href: "/programs" },
  ]

  const pathStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 24, padding: '28px 0', textDecoration: 'none',
  }
  const pathTitle: React.CSSProperties = {
    color: 'white', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 700,
    marginBottom: 6, fontFamily: 'Georgia, serif',
  }
  const pathText: React.CSSProperties = {
    color: 'rgba(255,255,255,0.6)', fontSize: 15, lineHeight: 1.6, maxWidth: 440,
  }
  const pathArrow: React.CSSProperties = {
    color: '#F5A623', fontSize: 28, fontWeight: 700, flexShrink: 0,
    transition: 'transform 0.2s',
  }
 

  return (
    <div>
      {featuredEvent && (
        <Link href={L('/event')} className="trvm-event-strip" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14,
          background: 'linear-gradient(90deg, #1A0A2E 0%, #2A1145 50%, #1A0A2E 100%)',
          borderBottom: '1px solid rgba(245,166,35,0.4)',
          color: 'white', textDecoration: 'none',
          padding: '11px 20px', fontSize: 14, position: 'relative', overflow: 'hidden',
        }}>
          {/* Badge */}
          <span style={{
            background: 'linear-gradient(135deg, #F5A623, #E8860A)', color: '#1A0A2E',
            fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: 20, flexShrink: 0, whiteSpace: 'nowrap',
          }}>
            📣 {dict.eventPage.upcoming}
          </span>
 
          {/* Event text */}
          <span style={{ fontWeight: 600, color: 'rgba(255,255,255,0.95)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {featuredEvent.strip_text || featuredEvent.title}
          </span>
 
          {/* Arrow pill */}
          <span className="trvm-strip-cta" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
            color: '#F5A623', fontWeight: 800, fontSize: 13, whiteSpace: 'nowrap',
          }}>
            {dict.eventPage.learnMore} <span className="trvm-strip-arrow" style={{ transition: 'transform 0.2s' }}>→</span>
          </span>
 
          {/* Shimmer sweep */}
          <span className="trvm-strip-shimmer" />
        </Link>
      )}
      <CinematicHero lang={lang} />

      {/* Photo Slideshow */}
       <div style={{ background: '#2A1145', paddingBottom: 40 }}>
         <Slideshow slides={slides} />
         </div>
      {/* Programs */}
      <section style={{ padding: 'clamp(72px, 10vw, 120px) 24px', background: '#0D0D1A' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 'clamp(48px, 7vw, 80px)' }}>
            <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 800, marginBottom: 14, color: '#fff', fontFamily: 'Georgia, serif' }}>
              {h.ourPrograms}
            </h2>
            <p style={{ color: '#a0a0b0', fontSize: 'clamp(15px, 2vw, 18px)', maxWidth: 560, margin: '0 auto', lineHeight: 1.7 }}>
              {h.programsSubtitle}
            </p>
          </div>
 
          <div className="ed-programs" style={{ display: 'grid', gap: 'clamp(32px, 5vw, 64px)' }}>
            {h.programs.map((prog, i) => (
              <Link key={i} href={L(progMeta[i].href)} className="ed-program" style={{
                display: 'block', textDecoration: 'none',
                borderTop: '2px solid rgba(245,166,35,0.4)', paddingTop: 28,
              }}>
                <div style={{ fontSize: 40, marginBottom: 20 }}>{progMeta[i].icon}</div>
                <h3 style={{ fontSize: 'clamp(20px, 2.6vw, 26px)', fontWeight: 700, color: '#fff', marginBottom: 14, fontFamily: 'Georgia, serif' }}>
                  {prog.title}
                </h3>
                <p style={{ color: '#a0a0b0', fontSize: 15, lineHeight: 1.9, marginBottom: 20 }}>
                  {prog.desc}
                </p>
                <span className="ed-program-more" style={{
                  color: '#F5A623', fontSize: 13, fontWeight: 800, letterSpacing: '0.08em',
                  textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 8,
                }}>
                  Learn More <span className="ed-program-arrow" style={{ transition: 'transform 0.2s' }}>→</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
        <style>{`
          .ed-programs { grid-template-columns: repeat(3, 1fr); }
          @media (max-width: 800px) { .ed-programs { grid-template-columns: 1fr; } }
          .ed-program:hover .ed-program-arrow { transform: translateX(5px); }
          .ed-program { transition: border-color 0.2s; }
          .ed-program:hover { border-top-color: #F5A623; }
        `}</style>
      </section>

       {/* Quote of the Day */}
       {quote && (
        <section style={{
          background: '#1A0A2E',
          padding: 'clamp(80px, 12vw, 140px) 24px',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* subtle oversized quotation mark, decorative */}
          <div aria-hidden style={{
            position: 'absolute', top: 'clamp(20px, 4vw, 60px)', left: '50%',
            transform: 'translateX(-50%)', fontFamily: 'Georgia, serif',
            fontSize: 'clamp(120px, 20vw, 280px)', lineHeight: 1,
            color: 'rgba(245,166,35,0.10)', pointerEvents: 'none', userSelect: 'none',
          }}>“</div>
 
          <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            <p style={{
              color: 'rgba(255,255,255,0.95)', fontFamily: 'Georgia, serif',
              fontStyle: 'italic', fontWeight: 400,
              fontSize: 'clamp(24px, 3.5vw, 42px)', lineHeight: 1.5,
              letterSpacing: '0.01em', marginBottom: 32,
            }}>
              {quote.text}
            </p>
            <div style={{ width: 60, height: 2, background: '#F5A623', margin: '0 auto 20px' }} />
            {quote.author && (
              <p style={{
                color: '#F5A623', fontSize: 'clamp(13px, 1.6vw, 16px)', fontWeight: 700,
                letterSpacing: '0.15em', textTransform: 'uppercase',
              }}>
                {quote.author}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Latest Devotions */}
      {devotions.length > 0 && (
        <section style={{ padding: 'clamp(72px, 10vw, 120px) 24px', background: '#1A0A2E' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(40px, 6vw, 64px)', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 800, color: '#fff', fontFamily: 'Georgia, serif' }}>{h.latestDevotions}</h2>
                <p style={{ color: '#a0a0b0', marginTop: 10, fontSize: 'clamp(15px, 2vw, 18px)' }}>{h.devotionsSubtitle}</p>
              </div>
              <Link href={L('/devotions')} style={{ color: '#F5A623', fontSize: 14, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '2px solid #F5A623', paddingBottom: 4 }}>{dict.common.viewAll} →</Link>
            </div>
            <div className="home-devotions-grid" style={{ display: 'grid', gap: 'clamp(32px, 4vw, 48px)' }}>
              {devotions.map(d => {
                const dt = pick(d, lang)
                return (
                  <Link key={d.id} href={L(`/devotions/${d.slug}`)} className="ed-devotion" style={{
                    display: 'block', textDecoration: 'none',
                    borderTop: '2px solid rgba(245,166,35,0.35)', paddingTop: 22,
                  }}>
                    <div style={{ fontSize: 11, color: '#9B59B6', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12 }}>
                      {new Date(d.date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                    <h3 style={{ fontSize: 'clamp(18px, 2.2vw, 22px)', fontWeight: 700, color: '#fff', marginBottom: 14, lineHeight: 1.3, fontFamily: 'Georgia, serif' }}>{dt.title}</h3>
                    <p style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.85, marginBottom: 18 }}>
                      {stripHtml(dt.content).substring(0, 100)}...
                    </p>
                    <span className="ed-dev-more" style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                      {dict.common.readMore} <span className="ed-dev-arrow" style={{ transition: 'transform 0.2s' }}>→</span>
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
          <style>{`
            .home-devotions-grid { grid-template-columns: repeat(4, 1fr); }
            @media (max-width: 900px) { .home-devotions-grid { grid-template-columns: repeat(2, 1fr); } }
            @media (max-width: 560px) { .home-devotions-grid { grid-template-columns: 1fr; } }
            .ed-devotion { transition: border-color 0.2s; }
            .ed-devotion:hover { border-top-color: #F5A623; }
            .ed-devotion:hover .ed-dev-arrow { transform: translateX(5px); }
          `}</style>
        </section>
      )}

      {/* Latest News */}
      {newsRows && newsRows.length > 0 && (
        <section style={{ padding: 'clamp(72px, 10vw, 120px) 24px', background: '#0D0D1A' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(36px, 5vw, 56px)', flexWrap: 'wrap', gap: 16 }}>
              <div>
                <h2 style={{ fontSize: 'clamp(30px, 4.5vw, 48px)', fontWeight: 800, color: '#fff', fontFamily: 'Georgia, serif' }}>{dict.newsPage.latestNews}</h2>
                <p style={{ color: '#a0a0b0', marginTop: 10, fontSize: 'clamp(15px, 2vw, 18px)' }}>{dict.newsPage.subtitle}</p>
              </div>
              <Link href={L('/news')} style={{ color: '#F5A623', fontSize: 14, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '2px solid #F5A623', paddingBottom: 4 }}>{dict.newsPage.viewAll} →</Link>
            </div>
 
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {newsRows.map((row:any, i:number) => {
                const c = pickNews(row)
                const isPress = row.category === 'press'
                return (
                  <Link key={row.id} href={L(`/news/${row.slug}`)} className="ed-newsrow" style={{
                    display: 'flex', alignItems: 'center', gap: 24,
                    padding: '24px 0', textDecoration: 'none',
                    borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  }}>
                    {/* Round thumbnail */}
                    <div style={{
                      width: 88, height: 88, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
                      background: 'linear-gradient(135deg, #1A0A2E, #2A1145)',
                      border: '2px solid rgba(245,166,35,0.4)',
                    }}>
                      {row.cover_image && (
                        <img src={row.cover_image} alt={c.title} className="ed-newsrow-img"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.4s' }} />
                      )}
                    </div>
 
                    {/* Text */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        {isPress && <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: '#1A0A2E', background: '#F5A623', padding: '2px 7px', borderRadius: 4 }}>{dict.newsPage.pressBadge}</span>}
                        <span style={{ fontSize: 11, color: '#9B59B6', letterSpacing: 2, textTransform: 'uppercase' }}>
                          {new Date(row.published_date).toLocaleDateString(dl, { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 'clamp(17px, 2.2vw, 21px)', fontWeight: 700, color: '#fff', marginBottom: 6, lineHeight: 1.3, fontFamily: 'Georgia, serif' }}>{c.title}</h3>
                      <p className="ed-newsrow-excerpt" style={{ color: '#a0a0b0', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                        {(c.excerpt || stripHtml(row.body)).substring(0, 110)}...
                      </p>
                    </div>
 
                    <span className="ed-newsrow-arrow" style={{ color: '#F5A623', fontSize: 22, flexShrink: 0, transition: 'transform 0.2s' }}>→</span>
                  </Link>
                )
              })}
            </div>
          </div>
          <style>{`
            .ed-newsrow:hover .ed-newsrow-img { transform: scale(1.08); }
            .ed-newsrow:hover .ed-newsrow-arrow { transform: translateX(5px); }
            @media (max-width: 560px) {
              .ed-newsrow { gap: 16px !important; }
              .ed-newsrow-excerpt { display: none !important; }
            }
          `}</style>
        </section>
      )}

      {/* Get Involved */}
<section style={{
        background: 'linear-gradient(135deg, #2A1145 0%, #1A0A2E 100%)',
        padding: 'clamp(72px, 10vw, 120px) 24px',
      }}>
        <div className="ed-getinvolved" style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'grid', gap: 'clamp(40px, 6vw, 80px)', alignItems: 'center',
        }}>
          {/* Left: statement */}
          <div>
            <p style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 16 }}>
              {dict.getInvolved.eyebrow}
            </p>
            <h2 style={{ color: 'white', fontSize: 'clamp(32px, 5vw, 52px)', fontWeight: 800, lineHeight: 1.15, fontFamily: 'Georgia, serif' }}>
              {dict.getInvolved.title}
            </h2>
          </div>
 
          {/* Right: the two paths as editorial links, not cards */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Link href={L('/membership')} className="ed-path" style={pathStyle}>
              <div>
                <h3 style={pathTitle}>{dict.getInvolved.membershipTitle}</h3>
                <p style={pathText}>{dict.getInvolved.membershipText}</p>
              </div>
              <span style={pathArrow}>→</span>
            </Link>
            <div style={{ height: 1, background: 'rgba(255,255,255,0.12)' }} />
            <Link href={L('/discipleship')} className="ed-path" style={pathStyle}>
              <div>
                <h3 style={pathTitle}>{dict.getInvolved.discipleshipTitle}</h3>
                <p style={pathText}>{dict.getInvolved.discipleshipText}</p>
              </div>
              <span style={pathArrow}>→</span>
            </Link>
          </div>
        </div>
        <style>{`
          .ed-getinvolved { grid-template-columns: 1fr 1.2fr; }
          @media (max-width: 800px) { .ed-getinvolved { grid-template-columns: 1fr; } }
          .ed-path:hover span { transform: translateX(6px); }
        `}</style>
      </section>

 {featuredEvent && (
        <section style={{ background: '#0D0D1A' }}>
          <div className="ed-event" style={{ display: 'grid', minHeight: 'clamp(360px, 45vw, 520px)' }}>
            {/* Image side — spans to the edge */}
            {featuredEvent.cover_image && (
              <div style={{
                backgroundImage: `url(${featuredEvent.cover_image})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                minHeight: 280,
              }} />
            )}
            {/* Text side — generous padding */}
            <div style={{
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
              padding: 'clamp(40px, 6vw, 90px)',
              background: 'linear-gradient(135deg, #2A1145, #16213E)',
            }}>
              <p style={{ color: '#F5A623', fontSize: 13, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 18 }}>
                {dict.eventPage.upcoming}
              </p>
              <h2 style={{ color: 'white', fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, fontFamily: 'Georgia, serif' }}>
                {featuredEvent.title}
              </h2>
              {featuredEvent.tagline && (
                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 'clamp(15px, 2vw, 19px)', lineHeight: 1.7, marginBottom: 32, maxWidth: 480 }}>
                  {featuredEvent.tagline}
                </p>
              )}
              <Link href={L('/event')} style={{
                alignSelf: 'flex-start',
                display: 'inline-flex', alignItems: 'center', gap: 10,
                color: '#F5A623', fontSize: 15, fontWeight: 800,
                letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none',
                borderBottom: '2px solid #F5A623', paddingBottom: 4,
              }}>
                {dict.eventPage.learnMore} →
              </Link>
            </div>
          </div>
          <style>{`
            .ed-event { grid-template-columns: 1fr 1fr; }
            @media (max-width: 800px) { .ed-event { grid-template-columns: 1fr; } }
          `}</style>
        </section>
      )}

      {/* Subscribe */}
       <section style={{
  background: 'linear-gradient(135deg, #1A0A2E, #2A1145)',
  padding: 'clamp(72px, 10vw, 120px) 24px',
}}>
  <SubscribeForm />
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