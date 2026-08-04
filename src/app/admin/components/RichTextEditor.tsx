'use client'
import { useRef, useEffect, useState } from 'react'

type Props = {
  value: string
  onChange: (html: string) => void
}

export default function RichTextEditor({ value, onChange }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState<Record<string, boolean>>({})

  // Load the incoming value into the editor once (and when switching records).
  // We compare against the live DOM so we don't clobber the caret while typing.
  useEffect(() => {
    if (ref.current && ref.current.innerHTML !== value) {
      ref.current.innerHTML = value || ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  function exec(command: string, arg?: string) {
    document.execCommand(command, false, arg)
    ref.current?.focus()
    emit()
    refreshActive()
  }

  function emit() {
    if (ref.current) onChange(ref.current.innerHTML)
  }

  function refreshActive() {
    setActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      underline: document.queryCommandState('underline'),
    })
  }

  const btn = (label: React.ReactNode, command: string, arg?: string, key?: string): React.ReactElement => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault() /* keep selection */ }}
      onClick={() => exec(command, arg)}
      style={{
        minWidth: 34, height: 32, padding: '0 8px',
        border: '1px solid #ddd', borderRadius: 5,
        background: key && active[key] ? '#c9a84c' : '#fff',
        color: key && active[key] ? '#0f2419' : '#333',
        cursor: 'pointer', fontSize: 14, fontFamily: 'Georgia, serif',
        fontWeight: 700,
      }}
    >
      {label}
    </button>
  )

  return (
    <div style={{ marginTop: 6 }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex', gap: 6, flexWrap: 'wrap',
        padding: 8, border: '1px solid #ddd', borderBottom: 'none',
        borderTopLeftRadius: 6, borderTopRightRadius: 6, background: '#faf8f2'
      }}>
        {btn(<b>B</b>, 'bold', undefined, 'bold')}
        {btn(<i>I</i>, 'italic', undefined, 'italic')}
        {btn(<u>U</u>, 'underline', undefined, 'underline')}
        <span style={{ width: 1, background: '#ddd', margin: '0 2px' }} />
        {btn('H2', 'formatBlock', 'h2')}
        {btn('H3', 'formatBlock', 'h3')}
        {btn('¶', 'formatBlock', 'p')}
        <span style={{ width: 1, background: '#ddd', margin: '0 2px' }} />
        {btn('• List', 'insertUnorderedList')}
        {btn('1. List', 'insertOrderedList')}
        <span style={{ width: 1, background: '#ddd', margin: '0 2px' }} />
        {btn('❝', 'formatBlock', 'blockquote')}
        {btn('⤫', 'removeFormat')}
      </div>

      {/* Editable area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onKeyUp={refreshActive}
        onMouseUp={refreshActive}
        style={{
          minHeight: 220, maxHeight: 420, overflowY: 'auto',
          padding: '14px 16px', border: '1px solid #ddd',
          borderBottomLeftRadius: 6, borderBottomRightRadius: 6,
          fontSize: 15, fontFamily: 'Georgia, serif', lineHeight: 1.7,
          color: '#000', background: '#fff', outline: 'none',
        }}
      />
      <p style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
        Select text, then use the toolbar. Formatting is preserved when translated.
      </p>
    </div>
  )
}