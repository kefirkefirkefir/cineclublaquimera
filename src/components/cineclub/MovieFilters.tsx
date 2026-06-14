'use client'

import { GENRES, DECADES } from '@/lib/constants'
import { useCineclubStore } from '@/stores/cineclub-store'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { SlidersHorizontal, X, ChevronRight, CalendarDays, Globe, Tag } from 'lucide-react'
import { useMemo, useState, useRef, useCallback, useEffect } from 'react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

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
  return map[genre] || ''
}

export function MovieFilters() {
  const {
    filters, setFilters, resetFilters,
    availableCountries, availableSubgenres,
    totalMovies, isLoading,
  } = useCineclubStore()

  // Accordion: only one section open at a time
  const [openSection, setOpenSection] = useState<string | null>(null)

  // Mobile sheet state
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false)

  // Desktop pill scroll state — gradient indicators
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollIndicators = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 2)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollIndicators()
    el.addEventListener('scroll', updateScrollIndicators, { passive: true })
    window.addEventListener('resize', updateScrollIndicators)
    return () => {
      el.removeEventListener('scroll', updateScrollIndicators)
      window.removeEventListener('resize', updateScrollIndicators)
    }
  }, [updateScrollIndicators])

  const activeSecondaryCount = useMemo(() => {
    let count = 0
    if (filters.subgenre) count++
    if (filters.decade) count++
    if (filters.country) count++
    return count
  }, [filters.subgenre, filters.decade, filters.country])

  const totalActiveCount = useMemo(() => {
    let count = 0
    if (filters.genre) count++
    if (filters.subgenre) count++
    if (filters.decade) count++
    if (filters.country) count++
    return count
  }, [filters.genre, filters.subgenre, filters.decade, filters.country])

  const hasActiveFilters = filters.genre || filters.subgenre || filters.decade || filters.country

  const getDecadeLabel = (value: string) => {
    const decade = DECADES.find(d => d.value === value)
    return decade ? decade.label : value
  }

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? null : section)
  }

  const handleMobileGenreSelect = (genre: string) => {
    setFilters({ genre: filters.genre === genre ? '' : genre })
    setMobileSheetOpen(false)
  }

  return (
    <div className="w-full border-b border-border/50 bg-background/60 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Mobile: compact filter bar ── */}
        <div className="flex items-center gap-3 py-3 md:hidden">
          <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
            <Button
              variant={totalActiveCount > 0 ? 'secondary' : 'ghost'}
              size="sm"
              className="shrink-0 gap-1.5 text-xs"
              onClick={() => setMobileSheetOpen(true)}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filtrar</span>
              {totalActiveCount > 0 && (
                <Badge className="ml-0.5 h-4 min-w-4 px-1 text-xs">
                  {totalActiveCount}
                </Badge>
              )}
            </Button>
            <SheetContent
              side="bottom"
              className="max-h-[85vh] rounded-t-2xl overflow-y-auto overscroll-y-contain"
              style={{ touchAction: 'pan-y' }}
            >
              {/* Sticky header — stays visible while scrolling */}
              <div className="sticky top-0 z-10 bg-background pb-1">
                <SheetHeader className="pr-8">
                  <SheetTitle className="text-[15px] font-display font-semibold uppercase tracking-wider">
                    Filtros
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Filtrar películas por género, década, subgénero y país
                  </SheetDescription>
                </SheetHeader>
              </div>

              {/* ── All filter content — scrolls with SheetContent ── */}
              <div className="px-5 pb-4">

              {/* Géneros grid */}
              <div>
                <p className="mb-2.5 text-[13px] font-display font-semibold uppercase tracking-wider text-muted-foreground">
                  Géneros
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {GENRES.map((genre) => {
                    const isActive = filters.genre === genre
                    const genreClass = getGenreClass(genre)
                    return (
                      <button
                        key={genre}
                        onClick={() => handleMobileGenreSelect(genre)}
                        className={`rounded-lg px-2 py-2.5 text-[13px] font-display font-semibold uppercase tracking-wider transition-all text-center ${
                          isActive
                            ? `${genreClass} ring-2 ring-foreground/30 ring-offset-2 ring-offset-background`
                            : `${genreClass} opacity-50 hover:opacity-75`
                        }`}
                      >
                        {genre}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Más filtros */}
              <div className="mt-3 border-t border-border/30">
                <p className="pt-3 pb-1 text-[13px] font-display font-semibold uppercase tracking-wider text-muted-foreground">
                  Más filtros
                </p>

                {/* Decades */}
                <Collapsible open={openSection === 'decade'} onOpenChange={() => toggleSection('decade')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 text-[13px] font-display font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/50 rounded-md transition-colors">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-3 w-3 text-muted-foreground" />
                      Década
                      {filters.decade && (
                        <span className="text-muted-foreground font-normal">· {getDecadeLabel(filters.decade)}</span>
                      )}
                    </span>
                    <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${openSection === 'decade' ? 'rotate-90' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-1.5 pb-3">
                      {DECADES.map((d) => (
                        <button
                          key={d.value}
                          onClick={() => setFilters({ decade: filters.decade === d.value ? '' : d.value })}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] transition-colors ${
                            filters.decade === d.value
                              ? 'bg-accent text-accent-foreground ring-1 ring-primary/30'
                              : 'bg-secondary text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="border-t border-border/30" />

                {/* Subgenres */}
                {availableSubgenres.length > 0 && (
                  <>
                    <Collapsible open={openSection === 'subgenre'} onOpenChange={() => toggleSection('subgenre')}>
                      <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 text-[13px] font-display font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/50 rounded-md transition-colors">
                        <span className="flex items-center gap-1.5">
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          Subgénero
                          {filters.subgenre && (
                            <span className="text-muted-foreground font-normal">· {filters.subgenre}</span>
                          )}
                        </span>
                        <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${openSection === 'subgenre' ? 'rotate-90' : ''}`} />
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="flex flex-wrap gap-1.5 pb-3">
                          {availableSubgenres.map((sg) => (
                            <button
                              key={sg}
                              onClick={() => setFilters({ subgenre: filters.subgenre === sg ? '' : sg })}
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] capitalize transition-colors ${
                                filters.subgenre === sg
                                  ? 'bg-accent text-accent-foreground ring-1 ring-primary/30'
                                  : 'bg-secondary text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {sg}
                            </button>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>

                    <div className="border-t border-border/30" />
                  </>
                )}

                {/* Countries */}
                {availableCountries.length > 0 && (
                  <Collapsible open={openSection === 'country'} onOpenChange={() => toggleSection('country')}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full py-2.5 text-[13px] font-display font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/50 rounded-md transition-colors">
                      <span className="flex items-center gap-1.5">
                        <Globe className="h-3 w-3 text-muted-foreground" />
                        País
                        {filters.country && (
                          <span className="text-muted-foreground font-normal">· {filters.country}</span>
                        )}
                      </span>
                      <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${openSection === 'country' ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="flex flex-wrap gap-1.5 pb-3">
                        {availableCountries.map((c) => (
                          <button
                            key={c}
                            onClick={() => setFilters({ country: filters.country === c ? '' : c })}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] transition-colors ${
                              filters.country === c
                                ? 'bg-accent text-accent-foreground ring-1 ring-primary/30'
                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>

              {/* Clear all */}
              {hasActiveFilters && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      resetFilters()
                      setMobileSheetOpen(false)
                    }}
                  >
                    <X className="h-3 w-3 mr-1.5" />
                    Limpiar todos los filtros
                  </Button>
                </div>
              )}

              </div>{/* end px-5 wrapper */}
            </SheetContent>
          </Sheet>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Movie count on mobile */}
          {!isLoading && (
            <p className="text-[13px] text-muted-foreground shrink-0">
              <span className="font-medium text-foreground">{totalMovies}</span> {totalMovies === 1 ? 'película' : 'películas'}
            </p>
          )}
        </div>

        {/* ── Desktop: genre pills + filter popover ── */}
        <div className="hidden md:flex items-center gap-3 py-3">
          {/* Genre pills — single row, horizontal scroll with edge fade indicators */}
          <div className="relative flex-1 min-w-0">
            {/* Left gradient fade */}
            <div
              className={`absolute left-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-r from-background/80 to-transparent pointer-events-none transition-opacity duration-200 ${canScrollLeft ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden="true"
            />
            {/* Right gradient fade */}
            <div
              className={`absolute right-0 top-0 bottom-0 z-10 w-6 bg-gradient-to-l from-background/80 to-transparent pointer-events-none transition-opacity duration-200 ${canScrollRight ? 'opacity-100' : 'opacity-0'}`}
              aria-hidden="true"
            />
            <div ref={scrollRef} className="overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-1.5 min-w-max">
                <button
                  onClick={() => setFilters({ genre: '' })}
                  className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-display font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                    !filters.genre
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card text-muted-foreground border border-border hover:text-foreground hover:border-foreground/30'
                  }`}
                >
                  Todos
                </button>
                {GENRES.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => setFilters({ genre: filters.genre === genre ? '' : genre })}
                    className={`inline-flex items-center rounded-full px-3 py-1 text-[13px] font-display font-semibold uppercase tracking-wider transition-colors shrink-0 ${
                      filters.genre === genre
                        ? `${getGenreClass(genre)}`
                        : 'bg-card text-muted-foreground border border-border hover:text-foreground hover:border-foreground/30'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Vertical divider on desktop */}
          <div className="hidden md:block h-6 w-px bg-border/50 shrink-0" />

          {/* Secondary filters button (desktop popover) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={activeSecondaryCount > 0 ? 'secondary' : 'ghost'}
                size="sm"
                className="shrink-0 gap-1.5 text-xs"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span className="hidden md:inline">Filtros</span>
                {activeSecondaryCount > 0 && (
                  <Badge className="ml-0.5 h-4 min-w-4 px-1 text-xs">
                    {activeSecondaryCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 p-0"
              align="end"
              sideOffset={8}
            >
              {/* Decades */}
              <Collapsible open={openSection === 'decade'} onOpenChange={() => toggleSection('decade')}>
                <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 text-[13px] font-display font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/50 transition-colors">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3 w-3 text-muted-foreground" />
                    Década
                    {filters.decade && (
                      <span className="text-muted-foreground font-normal">· {getDecadeLabel(filters.decade)}</span>
                    )}
                  </span>
                  <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${openSection === 'decade' ? 'rotate-90' : ''}`} />
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="flex flex-wrap gap-1.5 px-4 pb-3 max-h-36 overflow-y-auto">
                    {DECADES.map((d) => (
                      <button
                        key={d.value}
                        onClick={() => setFilters({ decade: filters.decade === d.value ? '' : d.value })}
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] transition-colors ${
                          filters.decade === d.value
                            ? 'bg-accent text-accent-foreground ring-1 ring-primary/30'
                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </CollapsibleContent>
              </Collapsible>

              <div className="mx-4 border-t border-border/30" />

              {/* Subgenres */}
              {availableSubgenres.length > 0 && (
                <>
                  <Collapsible open={openSection === 'subgenre'} onOpenChange={() => toggleSection('subgenre')}>
                    <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 text-[13px] font-display font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/50 transition-colors">
                      <span className="flex items-center gap-1.5">
                        <Tag className="h-3 w-3 text-muted-foreground" />
                        Subgénero
                        {filters.subgenre && (
                          <span className="text-muted-foreground font-normal">· {filters.subgenre}</span>
                        )}
                      </span>
                      <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${openSection === 'subgenre' ? 'rotate-90' : ''}`} />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="flex flex-wrap gap-1.5 px-4 pb-3 max-h-36 overflow-y-auto">
                        {availableSubgenres.map((sg) => (
                          <button
                            key={sg}
                            onClick={() => setFilters({ subgenre: filters.subgenre === sg ? '' : sg })}
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] capitalize transition-colors ${
                              filters.subgenre === sg
                                ? 'bg-accent text-accent-foreground ring-1 ring-primary/30'
                                : 'bg-secondary text-muted-foreground hover:text-foreground'
                            }`}
                          >
                            {sg}
                          </button>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>

                  <div className="mx-4 border-t border-border/30" />
                </>
              )}

              {/* Countries */}
              {availableCountries.length > 0 && (
                <Collapsible open={openSection === 'country'} onOpenChange={() => toggleSection('country')}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full px-4 py-2.5 text-[13px] font-display font-semibold uppercase tracking-wider text-foreground hover:bg-secondary/50 transition-colors">
                    <span className="flex items-center gap-1.5">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      País
                      {filters.country && (
                        <span className="text-muted-foreground font-normal">· {filters.country}</span>
                      )}
                    </span>
                    <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${openSection === 'country' ? 'rotate-90' : ''}`} />
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="flex flex-wrap gap-1.5 px-4 pb-3 max-h-36 overflow-y-auto">
                      {availableCountries.map((c) => (
                        <button
                          key={c}
                          onClick={() => setFilters({ country: filters.country === c ? '' : c })}
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[13px] transition-colors ${
                            filters.country === c
                              ? 'bg-accent text-accent-foreground ring-1 ring-primary/30'
                              : 'bg-secondary text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Clear all — pinned at bottom */}
              {hasActiveFilters && (
                <div className="border-t border-border/50 px-4 py-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs text-muted-foreground hover:text-foreground"
                    onClick={resetFilters}
                  >
                    <X className="h-3 w-3 mr-1.5" />
                    Limpiar todos los filtros
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* ── Active filter chips + movie count (shared) ── */}
        <div className={`flex items-center gap-2 md:pb-3 ${hasActiveFilters ? 'animate-in slide-in-from-top-1 duration-200' : ''}`}>
          <div className="flex items-center gap-1.5 flex-wrap flex-1 min-w-0">
            {filters.genre && (
              <FilterChip label={filters.genre} onRemove={() => setFilters({ genre: '' })} />
            )}
            {filters.subgenre && (
              <FilterChip label={filters.subgenre} onRemove={() => setFilters({ subgenre: '' })} />
            )}
            {filters.decade && (
              <FilterChip label={getDecadeLabel(filters.decade)} onRemove={() => setFilters({ decade: '' })} />
            )}
            {filters.country && (
              <FilterChip label={filters.country} onRemove={() => setFilters({ country: '' })} />
            )}
          </div>
          {!isLoading && (
            <p className="text-[13px] text-muted-foreground shrink-0 hidden md:block">
              <span className="font-medium text-foreground">{totalMovies}</span> {totalMovies === 1 ? 'película' : 'películas'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <Badge
      variant="secondary"
      className="gap-1 text-xs cursor-pointer hover:bg-secondary/80 transition-colors pr-1.5"
      onClick={onRemove}
    >
      {label}
      <span className="inline-flex items-center justify-center h-3.5 w-3.5 rounded-full bg-secondary/80 hover:bg-foreground/20 transition-colors">
        <X className="h-2 w-2" />
      </span>
    </Badge>
  )
}