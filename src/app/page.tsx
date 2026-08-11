import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { HomeContent } from "@/components/home/HomeContent"

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <HomeContent />
      </main>
      <Footer />
    </>
  )
}