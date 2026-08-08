import type { Metadata, Viewport } from "next"
import "./globals.css"
import LayoutWrapper from "./components/layoutWrapper"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import PwaRegister from "./components/PwaRegister"
import InstallPrompt from "./components/InstallPrompt"
import IosSplashLinks from "./components/IosSplashLinks"

export const metadata: Metadata = {
  title: "The Righteous Vine Missions",
  description: "Spreading the Gospel to the ends of the earth through missions, care & philanthropy, and discipleship.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TRVM",
  },
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

export const viewport: Viewport = {
  themeColor: "#1A0A2E",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <IosSplashLinks />
      </head>
      <body>
        <LayoutWrapper>{children}</LayoutWrapper>
        <PwaRegister />
        <InstallPrompt />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}