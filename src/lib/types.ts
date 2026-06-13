export type Devotion = {
  id: string
  title: string
  slug: string
  content: string
  author: string
  date: string
  cover_image: string | null
  created_at: string
}

export type Book = {
  id: string
  title: string
  author: string
  description: string | null
  pdf_url: string | null
  cover_image: string | null
  published_date: string | null
  is_free: boolean
  price: number
  currency: string
  created_at: string
}

export type Magazine = {
  id: string
  title: string
  edition: string
  description: string | null
  pdf_url: string | null
  cover_image: string | null
  published_date: string | null
  is_free: boolean
  price: number
  currency: string
  created_at: string
}

export type Newsletter = {
  id: string
  title: string
  issue_number: string | null
  pdf_url: string | null
  date: string | null
  created_at: string
}

export type Video = {
  id: string
  title: string
  description: string | null
  url: string
  thumbnail: string | null
  category: string | null
  date: string | null
  created_at: string
}
