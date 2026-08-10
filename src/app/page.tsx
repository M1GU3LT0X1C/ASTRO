import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h- grid place-items-center">
        <h1 className="text-4xl font-bold text-[#1E1B4B]">Protótipo</h1>
      </main>
      <Footer />
    </>
  )
}