import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProvidersWrapper } from "@/components/providers-wrapper"
import { metadata } from "./metadata"

const inter = Inter({ subsets: ["latin"] })

export { metadata }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ProvidersWrapper>
          <Header />
          {children}
          <Footer />
        </ProvidersWrapper>
      </body>
    </html>
  )
}
