import type { Metadata } from "next"
import "./globals.css"
import LayoutWrapper from "./components/layoutWrapper"

export const metadata: Metadata = {
  title: "The Righteous Vine Missions",
  description: "Evangelical missionary organization spreading the gospel",
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