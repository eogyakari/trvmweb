'use client'
import { useState } from 'react'

const PREVIEW_CHARS = 160

export default function TeamBio({
  bio, readMoreLabel, readLessLabel,
}: {
  bio: string
  readMoreLabel: string
  readLessLabel: string
}) {
  const [expanded, setExpanded] = useState(false)
  const full = (bio || '').trim()
  const isLong = full.length > PREVIEW_CHARS
  const shown = expanded || !isLong ? full : full.slice(0, PREVIEW_CHARS).trimEnd() + '…'

  return (
    <>
      <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 10, lineHeight: 1.7 }}>
        {shown}
      </p>
      {isLong && (
        <button onClick={() => setExpanded(v => !v)} style={{
          marginTop: 8, background: 'none', border: 'none', color: '#F5A623',
          fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'Georgia, serif', padding: 0,
        }}>
          {expanded ? readLessLabel : readMoreLabel}
        </button>
      )}
    </>
  )
}