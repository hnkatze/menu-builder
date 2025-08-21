import type React from "react"
import type { Metadata } from "next"
import { Montserrat } from "next/font/google"
import { Open_Sans } from "next/font/google"
import "./globals.css"
import { MenuBuilderProvider } from "../components/menu-builder/menu-builder-context"
import { Toaster } from "../components/ui/toaster"

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  variable: "--font-montserrat",
  display: "swap",
})

const openSans = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-open-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Constructor de Menús - Crea Menús Interactivos para Restaurantes",
  description:
    "Construye hermosos menús interactivos para restaurantes con funcionalidad de arrastrar y soltar, guía paso a paso y exportación JSON.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} ${openSans.variable}`}>
      <body className="font-sans antialiased">
        <MenuBuilderProvider>
          {children}
          <Toaster />
        </MenuBuilderProvider>
      </body>
    </html>
  )
}
