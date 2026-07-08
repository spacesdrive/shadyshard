import { HelmetProvider } from "react-helmet-async"
import { RouterProvider } from "react-router/dom"
import { ThemeProvider } from "@/hooks/use-theme"
import { router } from "@/routes/router"

export default function App() {
  return (
    <HelmetProvider>
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
    </HelmetProvider>
  )
}
