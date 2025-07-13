import type { Metadata } from "next"
import { Inter, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { ThemeProvider } from "@/components/theme-provider"
import { SidebarLayout } from "@/components/SidebarLayout"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "LearnThaiAI - AI-Powered Thai Language Learning",
  description: "Learn Thai with AI-generated vocabulary and spaced repetition",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (typeof window !== 'undefined') {
                  const theme = localStorage.getItem('learnthai-theme') || 'dark';
                  document.documentElement.classList.toggle('dark', theme === 'dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        <ThemeProvider>
          <AuthProvider>
            <SidebarLayout>{children}</SidebarLayout>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
