'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { useCineclubStore } from '@/stores/cineclub-store'
import type { Movie, ExternalLink } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Calendar,
  Clock,
  MapPin,
  ImageOff,
  FileText,
  Download,
  ExternalLink,
  Users,
  Pen,
  Camera,
  Scissors,
  Mic,
  BookOpen,
  Play,
  Tag,
  Code2,
} from 'lucide-react'

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

function formatDuration(minutes: number | null): string {
  if (!minutes) return ''
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return `${h}h ${m}min`
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function MoviePanel() {
  const { selectedSlug, setSelectedSlug, setRelatedMovies, relatedMovies, isAdmin, setEditingMovie, setMovieFormOpen, filters, setFilters } = useCineclubStore()
  const [movie, setMovie] = useState<Movie | null>(null)
  const [loading, setLoading] = useState(false)
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([])
  const [showPdf, setShowPdf] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset scroll to top when movie changes
  useEffect(() => {
    if (movie && scrollRef.current) {
      scrollRef.current.scrollTop = 0
      // Focus the scrollable container so keyboard/mouse scroll works inside dialog
      requestAnimationFrame(() => {
        scrollRef.current?.focus({ preventScroll: true })
      })
    }
  }, [movie])

  const isOpen = !!selectedSlug

  // Fetch movie details when slug changes
  useEffect(() => {
    if (!selectedSlug) {
      setMovie(null)
      setRelatedMovies([])
      return
    }

    let cancelled = false
    async function fetchMovie() {
      setLoading(true)
      try {
        const res = await fetch(`/api/movies/${selectedSlug}`)
        if (res.ok) {
          const data = await res.json()
          if (!cancelled) {
            setMovie(data.movie)
            setRelatedMovies(data.relatedMovies || [])
            if (data.movie.externalLinks) {
              try {
                setExternalLinks(JSON.parse(data.movie.externalLinks))
              } catch {
                setExternalLinks([])
              }
            } else {
              setExternalLinks([])
            }
          }
        }
      } catch (error) {
        console.error('Error al obtener película:', error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchMovie()
    return () => { cancelled = true }
  }, [selectedSlug, setRelatedMovies])

  // Sync URL with selected slug
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (selectedSlug) {
      const url = new URL(window.location)
      url.searchParams.set('pelicula', selectedSlug)
      window.history.replaceState({}, '', url.toString())
    } else {
      const url = new URL(window.location)
      url.searchParams.delete('pelicula')
      window.history.replaceState({}, '', url.toString())
    }
  }, [selectedSlug])

  // Check URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') return
    const url = new URL(window.location)
    const pelicula = url.searchParams.get('pelicula')
    if (pelicula) {
      setSelectedSlug(pelicula)
    }
  }, [setSelectedSlug])

  const handleClose = useCallback(() => {
    setSelectedSlug(null)
    setShowPdf(false)
  }, [setSelectedSlug])

  const handleEdit = useCallback(() => {
    if (movie) {
      setEditingMovie(movie)
      setMovieFormOpen(true)
    }
  }, [movie, setEditingMovie, setMovieFormOpen])

  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    const delta = e.deltaY || (e as unknown as React.WheelEvent<HTMLDivElement>).detail?.deltaY || 0
    if (Math.abs(delta) > 0) {
      el.scrollBy({ top: delta, behavior: 'auto' })
      e.preventDefault()
      e.stopPropagation()
    }
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl bg-background border-border p-0 gap-0" style={{ maxHeight: '90vh' }}>
        {/* Always render a DialogTitle for accessibility; visually hidden when not applicable */}
        {!movie && <DialogTitle className="sr-only">Detalle de película</DialogTitle>}
        {loading && !movie ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-pulse space-y-4 w-full px-8">
              <div className="h-4 w-3/4 rounded bg-secondary mx-auto max-w-xs" />
              <div className="h-3 w-1/2 rounded bg-secondary mx-auto max-w-[200px]" />
            </div>
          </div>
        ) : movie ? (
          <div ref={scrollRef} className="px-6 py-6 space-y-5 overflow-y-auto max-h-[80vh]" onWheel={handleWheel} tabIndex={-1}>
            {/* Header: Poster at card size + Title side by side on desktop, stacked on mobile */}
            <div className="flex flex-col sm:flex-row gap-5">
              {/* Poster - card size */}
              {showPdf && movie.criticPdfPath ? (
                <div className="shrink-0 w-32 sm:w-36 aspect-[2/3] rounded-md overflow-hidden bg-secondary">
                  <iframe
                    src={movie.criticPdfPath}
                    className="w-full h-full"
                    title={`Crítica de ${movie.title}`}
                  />
                </div>
              ) : (
                <div className="shrink-0 w-32 sm:w-36 aspect-[2/3] rounded-md overflow-hidden bg-secondary relative">
                  {movie.posterPath ? (
                    <Image
                      src={movie.posterPath}
                      alt={`Cartel de ${movie.title}`}
                      fill
                      className="object-cover"
                      priority
                      sizes="144px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageOff className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              )}

              {/* Title & meta info */}
              <div className="flex-1 min-w-0">
                {/* Genre badge + cycle */}
                <div className="mb-2 flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => {
                      setFilters({ genre: movie.genre === filters.genre ? '' : movie.genre })
                      setSelectedSlug(null)
                    }}
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] font-semibold uppercase tracking-wider transition-opacity hover:opacity-80 ${getGenreClass(movie.genre)}`}
                    aria-label={`Filtrar por ${movie.genre}`}
                  >
                    {movie.genre}
                  </button>
                  {movie.cycle && (
                    <Badge variant="outline" className="text-xs gap-1">
                      <Tag className="h-2.5 w-2.5" />
                      {movie.cycle}
                    </Badge>
                  )}
                </div>

                <DialogHeader className="space-y-2 p-0 text-left">
                  <DialogTitle className="text-xl sm:text-2xl font-display font-semibold uppercase tracking-wider leading-tight">
                    {movie.title}
                  </DialogTitle>
                  <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {movie.year && <span className="font-medium text-foreground">{movie.year}</span>}
                    {movie.countries && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {movie.countries}
                      </span>
                    )}
                    {movie.duration && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(movie.duration)}
                      </span>
                    )}
                  </DialogDescription>
                </DialogHeader>

                {/* Projection dates */}
                {(movie.projectionDate1 || movie.projectionDate2) && (
                  <div className="mt-3">
                    <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground uppercase tracking-wider mb-1.5">
                      <Play className="h-3 w-3" />
                      Proyección
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {movie.projectionDate1 && (
                        <Badge variant="secondary" className="text-xs">
                          {formatDate(movie.projectionDate1)}
                        </Badge>
                      )}
                      {movie.projectionDate2 && (
                        <Badge variant="secondary" className="text-xs">
                          {formatDate(movie.projectionDate2)}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Crew */}
            <div className="space-y-1.5">
              {movie.directors && (
                <CrewRow icon={Users} label="Dirección" value={movie.directors} />
              )}
              {movie.writers && (
                <CrewRow icon={BookOpen} label="Guion" value={movie.writers} />
              )}
              {movie.editors && (
                <CrewRow icon={Scissors} label="Edición" value={movie.editors} />
              )}
              {movie.cinematographers && (
                <CrewRow icon={Camera} label="Fotografía" value={movie.cinematographers} />
              )}
              {movie.sound && (
                <CrewRow icon={Mic} label="Sonido" value={movie.sound} />
              )}
              {movie.programmers && (
                <CrewRow icon={Code2} label="Programadore" value={movie.programmers} />
              )}
            </div>

            {/* Subgenres */}
            {movie.subgenres && (
              <div>
                <p className="text-[13px] font-display font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">Subgénero</p>
                <div className="flex flex-wrap gap-1.5">
                  {movie.subgenres.split(',').map((sg, i) => {
                    const trimmed = sg.trim()
                    if (!trimmed) return null
                    return (
                      <Badge key={i} variant="outline" className="text-xs capitalize">
                        {trimmed}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Analysis */}
            {movie.analysis && (
              <div>
                <p className="text-[13px] font-display font-semibold text-muted-foreground uppercase tracking-widest mb-2">Análisis</p>
                <div className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {movie.analysis}
                </div>
              </div>
            )}

            <Separator />

            {/* PDF */}
            {movie.criticPdfPath && (
              <div>
                <p className="text-[13px] font-display font-semibold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <FileText className="h-3 w-3" />
                  Crítica / Fanzine
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setShowPdf(!showPdf)}
                  >
                    {showPdf ? (
                      <>
                        <ImageOff className="h-3.5 w-3.5" />
                        Ver cartel
                      </>
                    ) : (
                      <>
                        <FileText className="h-3.5 w-3.5" />
                        Leer crítica
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    asChild
                  >
                    <a href={movie.criticPdfPath} download target="_blank">
                      <Download className="h-3.5 w-3.5" />
                      Descargar PDF
                    </a>
                  </Button>
                </div>
              </div>
            )}

            {/* External links */}
            {externalLinks.length > 0 && (
              <div>
                <p className="text-[13px] font-display font-semibold text-muted-foreground uppercase tracking-widest mb-2">Material adicional</p>
                <div className="space-y-1.5">
                  {externalLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="h-3 w-3 shrink-0" />
                      <span className="truncate">{link.title}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Admin edit button */}
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={handleEdit}
              >
                <Pen className="h-3.5 w-3.5" />
                Editar película
              </Button>
            )}

            {/* Related movies */}
            {relatedMovies.length > 0 && (
              <div>
                <Separator className="mb-4" />
                <p className="text-[13px] font-display font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  Películas relacionadas
                </p>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {relatedMovies.slice(0, 6).map((rm) => (
                    <button
                      key={rm.id}
                      onClick={() => setSelectedSlug(rm.slug)}
                      className="shrink-0 w-24 sm:w-28 aspect-[2/3] overflow-hidden rounded-md bg-secondary cursor-pointer hover:ring-2 hover:ring-primary/30 transition-all"
                    >
                      {rm.posterPath ? (
                        <Image
                          src={rm.posterPath}
                          alt={rm.title}
                          width={112}
                          height={168}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center p-1">
                          <p className="text-[11px] text-center text-muted-foreground/80 leading-tight">{rm.title}</p>
                        </div>
                      )}
                      <div className="relative inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5 -mt-6">
                        <p className="text-[12px] text-white font-medium truncate">{rm.title}</p>
                        {rm.year && <p className="text-[11px] text-white/70">{rm.year}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-muted-foreground">Película no encontrada</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function CrewRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-[13px] text-muted-foreground shrink-0 w-28 flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <span className="text-sm text-foreground/90">{value}</span>
    </div>
  )
}
