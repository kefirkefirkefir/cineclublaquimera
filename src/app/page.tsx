'use client'

import { useEffect } from 'react'
import { Header } from '@/components/cineclub/Header'
import { Footer } from '@/components/cineclub/Footer'
import { MovieFilters } from '@/components/cineclub/MovieFilters'
import { MovieGallery } from '@/components/cineclub/MovieGallery'
import { MoviePanel } from '@/components/cineclub/MoviePanel'
import { AdminPanel } from '@/components/cineclub/AdminPanel'
import { MovieForm } from '@/components/cineclub/MovieForm'
import { useCineclubStore } from '@/stores/cineclub-store'

export default function HomePage() {
  const { setSelectedSlug } = useCineclubStore()

  // Handle browser back/forward for movie panel
  useEffect(() => {
    function handlePopState() {
      const url = new URL(window.location)
      const pelicula = url.searchParams.get('pelicula')
      setSelectedSlug(pelicula)
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [setSelectedSlug])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <MovieFilters />
      <main className="flex-1">
        <MovieGallery />
      </main>
      <Footer />
      <MoviePanel />
      <AdminPanel />
      <MovieForm />
    </div>
  )
}
