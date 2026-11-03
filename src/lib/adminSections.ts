// Single source of truth for admin sections + their permission keys.
// The `key` must match the path segment after /admin/ (e.g. /admin/events -> 'events').
export type AdminSection = { key: string; label: string; icon: string; href: string }

export const ADMIN_SECTION_LIST: AdminSection[] = [
  { key: 'devotions',    label: 'Devotions',     icon: '📖', href: '/admin/devotions' },
  { key: 'news',         label: 'News & Press',  icon: '📰', href: '/admin/news' },
  { key: 'quotes',       label: 'Quotes',        icon: '💬', href: '/admin/quotes' },
  { key: 'gallery',      label: 'Gallery',       icon: '🖼️', href: '/admin/gallery' },
  { key: 'videos',       label: 'Videos',        icon: '🎥', href: '/admin/videos' },
  { key: 'newsletters',  label: 'Newsletters',   icon: '✉️', href: '/admin/newsletters' },
  { key: 'discipleship', label: 'Discipleship',  icon: '📖', href: '/admin/discipleship' },
  { key: 'messages',     label: 'Messages',      icon: '💬', href: '/admin/messages' },
  { key: 'about',        label: 'About Page',    icon: '📝', href: '/admin/about' },
  { key: 'events',       label: 'Conferences',   icon: '📅', href: '/admin/events' },
  { key: 'memberships',  label: 'Memberships',   icon: '👥', href: '/admin/memberships' },
  { key: 'subscribers',  label: 'Subscribers',   icon: '📧', href: '/admin/subscribers' },
  { key: 'slideshow',    label: 'Slideshow',     icon: '🎞️', href: '/admin/slideshow' },
  { key: 'books',        label: 'Books',         icon: '📚', href: '/admin/books' },
  { key: 'magazines',    label: 'Magazines',     icon: '📰', href: '/admin/magazines' },
  { key: 'programs',     label: 'Programs',      icon: '🌍', href: '/admin/programs' },
  { key: 'settings',     label: 'Site Settings', icon: '⚙️', href: '/admin/settings' },
]

// Default sections a NEW editor can manage (the "safe" content set).
// Sensitive ones (events, memberships, subscribers, slideshow, books,
// magazines, programs, settings) are OFF by default — grant per editor.
export const DEFAULT_EDITOR_PERMISSIONS = [
  'devotions', 'news', 'quotes', 'gallery', 'videos', 'discipleship', 'messages',
]

// Can this user open this section? Owners can open anything.
export function canAccess(role: string, permissions: string[], sectionKey: string): boolean {
  if (role === 'owner') return true
  return permissions.includes(sectionKey)
}