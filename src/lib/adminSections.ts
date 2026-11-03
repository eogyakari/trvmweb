export type AdminSection = { key: string; label: string; icon: string; href: string; group: string }

export const ADMIN_SECTION_LIST: AdminSection[] = [
  // Content
  { key: 'devotions',    label: 'Devotions',     icon: '📖', href: '/admin/devotions',    group: 'Content' },
  { key: 'news',         label: 'News & Press',  icon: '📰', href: '/admin/news',         group: 'Content' },
  { key: 'quotes',       label: 'Quotes',        icon: '❝',  href: '/admin/quotes',       group: 'Content' },
  { key: 'gallery',      label: 'Gallery',       icon: '🖼️', href: '/admin/gallery',      group: 'Content' },
  { key: 'videos',       label: 'Videos',        icon: '🎥', href: '/admin/videos',       group: 'Content' },
  { key: 'newsletters',  label: 'Newsletters',   icon: '✉️', href: '/admin/newsletters',  group: 'Content' },
  // Events
  { key: 'events',       label: 'Conferences',   icon: '📅', href: '/admin/events',       group: 'Events' },
  // Publications
  { key: 'books',        label: 'Books',         icon: '📚', href: '/admin/books',        group: 'Publications' },
  { key: 'magazines',    label: 'Magazines',     icon: '🗞️', href: '/admin/magazines',    group: 'Publications' },
  // Community
  { key: 'memberships',  label: 'Memberships',   icon: '👥', href: '/admin/memberships',  group: 'Community' },
  { key: 'discipleship', label: 'Discipleship',  icon: '🎓', href: '/admin/discipleship', group: 'Community' },
  { key: 'subscribers',  label: 'Subscribers',   icon: '📧', href: '/admin/subscribers',  group: 'Community' },
  { key: 'messages',     label: 'Messages',      icon: '💬', href: '/admin/messages',     group: 'Community' },
  // Site
  { key: 'about',        label: 'About Page',    icon: '📝', href: '/admin/about',        group: 'Site' },
  { key: 'programs',     label: 'Programs',      icon: '🌍', href: '/admin/programs',     group: 'Site' },
  { key: 'slideshow',    label: 'Slideshow',     icon: '🎞️', href: '/admin/slideshow',    group: 'Site' },
  { key: 'settings',     label: 'Site Settings', icon: '⚙️', href: '/admin/settings',     group: 'Site' },
]

export const ADMIN_GROUP_ORDER = ['Content', 'Events', 'Publications', 'Community', 'Site']

// Default sections a NEW editor can manage (the "safe" content set).
export const DEFAULT_EDITOR_PERMISSIONS = [
  'devotions', 'news', 'quotes', 'gallery', 'videos', 'discipleship', 'messages',
]

export function canAccess(role: string, permissions: string[], sectionKey: string): boolean {
  if (role === 'owner') return true
  return permissions.includes(sectionKey)
}