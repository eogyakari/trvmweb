import type { Metadata } from "next"
import "./globals.css"
import LayoutWrapper from "./components/layoutWrapper"

export const metadata: Metadata = {
  title: "The Righteous Vine Missions",
  description: "Spreading the Gospel to the ends of the earth through missions, care & philanthropy, and discipleship.",
  openGraph: {
    title: "The Righteous Vine Missions",
    description: "Spreading the Gospel to the ends of the earth through missions, care & philanthropy, and discipleship.",
    url: "https://trvmissions.com",
    siteName: "The Righteous Vine Missions",
    images: [{ url: "https://trvmissions.com/logo.png", width: 500, height: 500, alt: "TRVM Logo" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Righteous Vine Missions",
    description: "Spreading the Gospel to the ends of the earth.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}
