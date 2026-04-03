import { SiteHeader } from './site-header'
import { SiteFooter } from './site-footer'
import { StickyCTA } from './sticky-cta'

export function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <StickyCTA />
    </div>
  )
}
