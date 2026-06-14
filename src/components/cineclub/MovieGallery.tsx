'use client'

import { useCineclubStore } from '@/stores/cineclub-store'
import { MovieCard } from './MovieCard'
import { Skeleton } from '@/components/ui/skeleton'
import { Archive } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useRef, useCallback } from 'react'

export function MovieGallery() {
  const { movies, isLoading, filters, setSelectedSlug, setMovies, setFilterOptions, setLoading, totalMovies } = useCineclubStore()
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchMovies = useCallback(async (searchValue: string) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchValue) params.set('search', searchValue)
      if (filters.genre) params.set('genre', filters.genre)
      if (filters.subgenre) params.set('subgenre', filters.subgenre)
      if (filters.decade) params.set('decade', filters.decade)
      if (filters.country) params.set('country', filters.country)

      const res = await fetch(`/api/movies?${params}`)
      const data = await res.json()

      setMovies(data.movies, data.total)
      setFilterOptions(data.filters)
    } catch (error) {
      console.error('Failed to fetch movies:', error)
    } finally {
      setLoading(false)
    }
  }, [filters.genre, filters.subgenre, filters.decade, filters.country, setMovies, setFilterOptions, setLoading])

  // Fetch on non-search filter changes (immediate)
  useEffect(() => {
    fetchMovies(filters.search)
  }, [filters.genre, filters.subgenre, filters.decade, filters.country, fetchMovies])

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    searchTimeoutRef.current = setTimeout(() => {
      fetchMovies(filters.search)
    }, 300)
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [filters.search, fetchMovies])

  // Loading skeleton
  if (isLoading && movies.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="aspect-[2/3] w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Empty state
  if (!isLoading && movies.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/60">
            <Archive className="h-7 w-7 text-muted-foreground/60" />
          </div>
          <div>
            <h3 className="text-lg font-display font-semibold uppercase tracking-wider">Sin resultados</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Prueba con otros filtros o términos de búsqueda
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-6 sm:px-6 sm:py-6 lg:px-8">
      <motion.div
        layout
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5"
      >
        <AnimatePresence mode="popLayout">
          {movies.map((movie, index) => (
            <motion.div
              key={movie.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.3) }}
            >
              <MovieCard
                movie={movie}
                onClick={() => setSelectedSlug(movie.slug)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
