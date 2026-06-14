import { NextRequest, NextResponse } from 'next/server'

const TMDB_API_KEY = process.env.TMDB_API_KEY

// Map TMDb genre IDs to our genre names
const GENRE_MAP: Record<number, string> = {
  18: 'drama',
  35: 'comedia',
  27: 'terror',
  878: 'Sci-Fi',
  14: 'fantasía',
  53: 'thriller',
  37: 'western',
  10402: 'musical',
  99: 'documental',
}

function mapTMDbGenre(id: number): string {
  return GENRE_MAP[id] || 'drama'
}

export async function GET(request: NextRequest) {
  try {
    if (!TMDB_API_KEY) {
      return NextResponse.json({
        error: 'TMDb API key not configured. Add TMDB_API_KEY to your .env.local file.',
        results: [],
      })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    const movieId = searchParams.get('id')

    const baseUrl = 'https://api.themoviedb.org/3'

    if (movieId) {
      // Fetch movie details + credits
      const [movieRes, creditsRes] = await Promise.all([
        fetch(`${baseUrl}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=es-ES`),
        fetch(`${baseUrl}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=es-ES`),
      ])

      if (!movieRes.ok || !creditsRes.ok) {
        return NextResponse.json({ error: 'Failed to fetch from TMDb' }, { status: 500 })
      }

      const movie = await movieRes.json()
      const credits = await creditsRes.json()

      const directors = credits.crew
        .filter((c: { job: string; department: string }) => c.job === 'Director')
        .map((c: { name: string }) => c.name)
        .join(', ')

      const writers = credits.crew
        .filter((c: { job: string; department: string }) => c.job === 'Writer' || c.job === 'Screenplay')
        .map((c: { name: string }) => c.name)
        .join(', ') || null

      const editors = credits.crew
        .filter((c: { job: string }) => c.job === 'Editor')
        .map((c: { name: string }) => c.name)
        .join(', ') || null

      const cinematographers = credits.crew
        .filter((c: { job: string }) => c.job === 'Director of Photography' || c.job === 'Cinematography')
        .map((c: { name: string }) => c.name)
        .join(', ') || null

      const sound = credits.crew
        .filter((c: { job: string; department: string }) => c.department === 'Sound')
        .slice(0, 3)
        .map((c: { name: string }) => c.name)
        .join(', ') || null

      const countries = movie.production_countries
        ?.map((c: { name: string }) => c.name)
        .join(', ') || ''

      const genre = movie.genres?.[0]?.id ? mapTMDbGenre(movie.genres[0].id) : 'drama'

      return NextResponse.json({
        title: movie.title,
        year: movie.release_date ? parseInt(movie.release_date.split('-')[0]) : null,
        directors,
        writers,
        editors,
        cinematographers,
        sound,
        countries,
        duration: movie.runtime,
        genre,
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        overview: movie.overview,
      })
    }

    if (query) {
      const res = await fetch(`${baseUrl}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=es-ES&page=1`)
      
      if (!res.ok) {
        return NextResponse.json({ results: [] })
      }

      const data = await res.json()

      const results = (data.results || []).slice(0, 8).map((m: {
        id: number
        title: string
        release_date: string
        poster_path: string | null
        genre_ids: number[]
        overview: string
      }) => ({
        id: m.id,
        title: m.title,
        year: m.release_date ? parseInt(m.release_date.split('-')[0]) : null,
        posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w92${m.poster_path}` : null,
        genre: m.genre_ids?.[0] ? mapTMDbGenre(m.genre_ids[0]) : null,
        overview: m.overview,
      }))

      return NextResponse.json({ results })
    }

    return NextResponse.json({ error: 'Missing query parameter' }, { status: 400 })
  } catch (error) {
    console.error('TMDb search error:', error)
    return NextResponse.json({ results: [], error: 'Search failed' })
  }
}
