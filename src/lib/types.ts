export interface Movie {
  id: string
  slug: string
  title: string
  year: number | null
  directors: string
  writers: string | null
  editors: string | null
  cinematographers: string | null
  sound: string | null
  programmers: string | null
  countries: string
  duration: number | null
  analysis: string | null
  projectionDate1: string | null
  projectionDate2: string | null
  posterPath: string | null
  criticPdfPath: string | null
  genre: string
  subgenres: string
  externalLinks: string | null
  cycle: string | null
  createdAt: string
  updatedAt: string
}

export interface ExternalLink {
  title: string
  url: string
}

export interface TMDbMovie {
  id: number
  title: string
  original_title: string
  release_date: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  genre_ids: number[]
  popularity: number
  vote_average: number
  vote_count: number
  adult: boolean
  original_language: string
}

export interface TMDbMovieDetail extends TMDbMovie {
  runtime: number
  budget: number
  revenue: number
  genres: { id: number; name: string }[]
  production_companies: { id: number; name: string; logo_path: string | null }[]
  production_countries: { iso_3166_1: string; name: string }[]
  credits: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[]
    crew: {
      id: number
      name: string
      job: string
      department: string
      profile_path: string | null
    }[]
  }
}

export interface MoviesFilter {
  search?: string
  genre?: string
  subgenre?: string
  decade?: string
  country?: string
  page?: number
  limit?: number
}
