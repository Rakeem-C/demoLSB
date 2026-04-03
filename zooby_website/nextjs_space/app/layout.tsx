import { Jost, Manrope } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/theme-provider'

export const dynamic = 'force-dynamic'

const jost = Jost({ subsets: ['latin'], variable: '--font-display', weight: ['400', '500', '600', '700', '800'] })
const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500', '600', '700'] })

export const metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  title: {
    default: 'Professional Roofing & Painting | HomeGuard Pro',
    template: '%s | HomeGuard Pro Services',
  },
  description: 'Professional roofing and painting for local homeowners. Inspections, repairs, replacements, and painting done right the first time.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'Professional Roofing & Painting | HomeGuard Pro',
    description: 'Professional roofing and painting for local homeowners.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className={`${jost.variable} ${manrope.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
