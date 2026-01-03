import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    default: "Alpha Wings AI Post Booster",
    template: "%s | Alpha Wings AI Post Booster",
  },
  description:
    "Alpha Wings AI Post Booster helps creators generate high-impact social media posts in seconds using advanced AI.",
  metadataBase: new URL("https://alphawingsai.com"),
  openGraph: {
    title: "Alpha Wings AI Post Booster",
    description:
      "Turn simple ideas into viral-ready posts for LinkedIn, Twitter, Facebook, and Instagram in seconds.",
    url: "https://alphawingsai.com",
    siteName: "Alpha Wings AI Post Booster",
    images: [
      {
        url: "/og-alpha-wings-ai.png",
        width: 1200,
        height: 630,
        alt: "Alpha Wings AI Post Booster preview",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Alpha Wings AI Post Booster",
    description:
      "Generate scroll-stopping social posts with AI and track your monthly usage effortlessly.",
    images: ["/og-alpha-wings-ai.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-b from-blue-50 to-white`}
      >
        {children}
      </body>
    </html>
  )
}
