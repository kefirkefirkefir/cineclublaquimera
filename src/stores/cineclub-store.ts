import { create } from 'zustand'
import type { Movie } from '@/lib/types'

interface FilterState {
  search: string
  genre: string
  subgenre: string
  decade: string
  country: string
}

interface CineclubState {
  // Movies
  movies: Movie[]
  totalMovies: number
  isLoading: boolean
  
  // Filters
  filters: FilterState
  setFilters: (filters: Partial<FilterState>) => void
  resetFilters: () => void
  
  // Selected movie (for panel)
  selectedSlug: string | null
  setSelectedSlug: (slug: string | null) => void
  
  // Related movies for detail panel
  relatedMovies: Movie[]
  
  // Filter options from API
  availableCountries: string[]
  availableGenres: string[]
  availableSubgenres: string[]
  
  // Admin
  isAdmin: boolean
  setIsAdmin: (isAdmin: boolean) => void
  adminPanelOpen: boolean
  setAdminPanelOpen: (open: boolean) => void
  movieFormOpen: boolean
  setMovieFormOpen: (open: boolean) => void
  editingMovie: Movie | null
  setEditingMovie: (movie: Movie | null) => void
  
  // Actions
  setMovies: (movies: Movie[], total: number) => void
  setRelatedMovies: (movies: Movie[]) => void
  setFilterOptions: (options: { countries: string[]; genres: string[]; subgenres: string[] }) => void
  setLoading: (loading: boolean) => void
}

const defaultFilters: FilterState = {
  search: '',
  genre: '',
  subgenre: '',
  decade: '',
  country: '',
}

export const useCineclubStore = create<CineclubState>((set) => ({
  movies: [],
  totalMovies: 0,
  isLoading: true,
  filters: defaultFilters,
  selectedSlug: null,
  relatedMovies: [],
  availableCountries: [],
  availableGenres: [],
  availableSubgenres: [],
  isAdmin: false,
  adminPanelOpen: false,
  movieFormOpen: false,
  editingMovie: null,
  
  setFilters: (filters) =>
    set((state) => ({ filters: { ...state.filters, ...filters } })),
  resetFilters: () => set({ filters: defaultFilters }),
  setSelectedSlug: (slug) => set({ selectedSlug: slug }),
  
  setMovies: (movies, total) => set({ movies, totalMovies: total }),
  setRelatedMovies: (movies) => set({ relatedMovies: movies }),
  setFilterOptions: (options) =>
    set({
      availableCountries: options.countries,
      availableGenres: options.genres,
      availableSubgenres: options.subgenres,
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  setIsAdmin: (isAdmin) => set({ isAdmin }),
  setAdminPanelOpen: (open) => set({ adminPanelOpen: open }),
  setMovieFormOpen: (open) => set({ movieFormOpen: open }),
  setEditingMovie: (movie) => set({ editingMovie: movie }),
}))
