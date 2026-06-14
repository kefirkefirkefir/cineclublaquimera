'use client'

import Link from 'next/link'
import { Search, Settings, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCineclubStore } from '@/stores/cineclub-store'

export function Header() {
  const { filters, setFilters, isAdmin, setAdminPanelOpen, selectedSlug, setSelectedSlug } = useCineclubStore()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/90 backdrop-blur-xl pt-2 sm:pt-0">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 sm:gap-4 px-5 sm:px-6 lg:px-8">
        {/* Logo — purely typographic */}
        <Link href="/" className="flex items-center gap-3 shrink-0" onClick={() => setSelectedSlug(null)}>
          <div className="hidden sm:block">
            <h1 className="text-xl font-display font-semibold uppercase tracking-[0.15em] leading-none text-foreground">
              Cineclub
            </h1>
            <p className="mt-0.5 text-[14px] font-serif italic leading-none text-muted-foreground tracking-[0.38em]">
              La Quimera
            </p>
          </div>
          {/* Mobile: stacked logo */}
          <div className="sm:hidden flex flex-col">
            <h1 className="text-lg font-display font-semibold uppercase tracking-[0.12em] leading-none text-foreground">
              Cineclub
            </h1>
            <p className="mt-0.5 text-[12px] font-serif italic leading-none text-muted-foreground tracking-[0.38em]">
              La Quimera
            </p>
          </div>
        </Link>

        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Buscar título, director…"
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="pl-9 h-9 bg-card/60 border-border/60 focus-visible:ring-primary/20 text-sm"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Admin */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAdminPanelOpen(true)}
          className="shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary/60"
        >
          <Settings className="h-3.5 w-3.5" />
          <span className="hidden sm:inline ml-1.5 text-xs uppercase tracking-[0.15em]">Admin</span>
        </Button>
      </div>
    </header>
  )
}
