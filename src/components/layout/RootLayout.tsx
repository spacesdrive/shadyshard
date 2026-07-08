import { Outlet } from "react-router"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#main-content"
        className="focus:bg-primary focus:text-primary-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Header />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
