import '../styles/globals.css'
import { Providers } from '../components/providers'
import { Toaster } from "@/components/ui/sonner"
import Navbar from "@/containers/NavBar"
import Footer from "@/containers/Footer"

function MyApp({ Component, pageProps }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-gray-950">
      <Providers>
        <Navbar />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <Footer />
        <Toaster position="bottom-right" />
      </Providers>
    </div>
  )
}

export default MyApp
