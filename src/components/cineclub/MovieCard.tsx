'use client'

import Image from 'next/image'
import type { Movie } from '@/lib/types'
import { Calendar } from 'lucide-react'
import { useCineclubStore } from '@/stores/cineclub-store'

function getGenreClass(genre: string): string {
  const map: Record<string, string> = {
    'drama': 'genre-badge-drama',
    'comedia': 'genre-badge-comedia',
    'terror': 'genre-badge-terror',
    'Sci-Fi': 'genre-badge-Sci-Fi',
    'fantasía': 'genre-badge-fantasía',
    'thriller': 'genre-badge-thriller',
    'western': 'genre-badge-western',
    'musical': 'genre-badge-musical',
    'documental': 'genre-badge-documental',
  }
  return map[genre] || 'genre-badge-drama'
}

interface MovieCardProps {
  movie: Movie
  onClick: () => void
}

export function MovieCard({ movie, onClick }: MovieCardProps) {
  const { setFilters, filters } = useCineclubStore()
  const hasPoster = movie.posterPath

  return (
    <button
      onClick={onClick}
      className="poster-card group relative w-full text-left overflow-hidden rounded bg-card border border-border/50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-secondary/50">
        {hasPoster ? (
          <>
            <Image
              src={movie.posterPath}
              alt={`Cartel de ${movie.title}`}
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
            {/* Gentle gradient overlay for text readability */}
            <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/50 via-black/15 to-transparent" />
          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 p-5 bg-secondary/30">
            <p className="text-base font-display font-semibold uppercase tracking-[0.1em] text-center leading-tight text-muted-foreground/80">
              {movie.title}
            </p>
            {movie.year && (
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground/70">{movie.year}</p>
            )}
          </div>
        )}

        {/* Genre badge — top left, only on posters — clickable to filter */}
        {hasPoster && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setFilters({ genre: movie.genre === filters.genre ? '' : movie.genre })
            }}
            className="absolute top-2.5 left-2.5 cursor-pointer hover:opacity-80 transition-opacity"
            aria-label={`Filtrar por ${movie.genre}`}
          >
            <span className={`inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-display font-semibold uppercase tracking-wider ${getGenreClass(movie.genre)}`}>
              {movie.genre}
            </span>
          </button>
        )}

        {/* Info overlay at bottom — only on posters */}
        {hasPoster ? (
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="text-sm font-normal leading-tight line-clamp-2 mb-0.5 text-white">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-white/70">
              {movie.year && <span>{movie.year}</span>}
              {movie.year && movie.directors && <span>·</span>}
              {movie.directors && (
                <span className="truncate">{movie.directors.split(',')[0]}</span>
              )}
            </div>
            {movie.projectionDate1 && (
              <div className="flex items-center gap-1 mt-1 text-[11px] text-white/60">
                <Calendar className="h-2.5 w-2.5" />
                <span>
                  {new Date(movie.projectionDate1).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  {movie.projectionDate2 && (
                    <> — {new Date(movie.projectionDate2).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</>
                  )}
                </span>
              </div>
            )}
          </div>
        ) : (
          /* Below-poster info for cards without poster */
          <div className="absolute inset-x-0 bottom-0 p-3 pt-2 bg-background/90 backdrop-blur-sm border-t border-border/30">
            <h3 className="text-sm font-normal leading-tight line-clamp-2 mb-0.5 text-foreground">
              {movie.title}
            </h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {movie.year && <span>{movie.year}</span>}
              {movie.year && movie.directors && <span>·</span>}
              {movie.directors && (
                <span className="truncate">{movie.directors.split(',')[0]}</span>
              )}
            </div>
          </div>
        )}
      </div>
    </button>
  )
}
