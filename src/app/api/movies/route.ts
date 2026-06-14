import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import type { MoviesFilter } from '@/lib/types'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// GET /api/movies - List movies with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const genre = searchParams.get('genre') || ''
    const subgenre = searchParams.get('subgenre') || ''
    const decade = searchParams.get('decade') || ''
    const country = searchParams.get('country') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { directors: { contains: search } },
        { cycle: { contains: search } },
        { genre: { contains: search } },
        { subgenres: { contains: search } },
      ]
    }

    if (genre) {
      where.genre = genre
    }

    if (subgenre) {
      where.subgenres = { contains: subgenre }
    }

    if (decade) {
      const decadeStart = parseInt(decade)
      const decadeEnd = decadeStart + 9
      where.AND = [
        { year: { gte: decadeStart } },
        { year: { lte: decadeEnd } },
      ]
    }

    if (country) {
      where.countries = { contains: country }
    }

    const skip = (page - 1) * limit

    const [movies, total] = await Promise.all([
      db.movie.findMany({
        where,
        orderBy: [{ projectionDate1: 'desc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      db.movie.count({ where }),
    ])

    // Get unique countries for filter options
    const allMovies = await db.movie.findMany({
      select: { countries: true, genre: true, subgenres: true, year: true },
    })

    const countriesSet = new Set<string>()
    const genresSet = new Set<string>()
    const subgenresSet = new Set<string>()

    allMovies.forEach((m) => {
      if (m.countries) {
        m.countries.split(',').forEach((c) => countriesSet.add(c.trim()))
      }
      if (m.genre) genresSet.add(m.genre)
      if (m.subgenres) {
        m.subgenres.split(',').forEach((s) => {
          const trimmed = s.trim()
          if (trimmed) subgenresSet.add(trimmed)
        })
      }
    })

    return NextResponse.json({
      movies,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      filters: {
        countries: Array.from(countriesSet).sort(),
        genres: Array.from(genresSet).sort(),
        subgenres: Array.from(subgenresSet).sort(),
      },
    })
  } catch (error) {
    console.error('Error fetching movies:', error)
    return NextResponse.json({ error: 'Failed to fetch movies' }, { status: 500 })
  }
}

// POST /api/movies - Create a new movie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const slug = body.slug || slugify(`${body.title} ${body.year || ''}`)

    const movie = await db.movie.create({
      data: {
        slug,
        title: body.title,
        year: body.year || null,
        directors: body.directors || '',
        writers: body.writers || null,
        editors: body.editors || null,
        cinematographers: body.cinematographers || null,
        sound: body.sound || null,
        programmers: body.programmers || null,
        countries: body.countries || '',
        duration: body.duration || null,
        analysis: body.analysis || null,
        projectionDate1: body.projectionDate1 ? new Date(body.projectionDate1) : null,
        projectionDate2: body.projectionDate2 ? new Date(body.projectionDate2) : null,
        posterPath: body.posterPath || null,
        criticPdfPath: body.criticPdfPath || null,
        genre: body.genre || 'drama',
        subgenres: body.subgenres || '',
        externalLinks: body.externalLinks || null,
        cycle: body.cycle || null,
      },
    })

    return NextResponse.json(movie, { status: 201 })
  } catch (error) {
    console.error('Error creating movie:', error)
    return NextResponse.json({ error: 'Failed to create movie' }, { status: 500 })
  }
}
