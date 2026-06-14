import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

// GET /api/movies/[slug] - Get single movie by slug
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const movie = await db.movie.findUnique({
      where: { slug },
    })

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, { status: 404 })
    }

    // Find related movies
    const relatedMovies = await db.movie.findMany({
      where: {
        AND: [
          { id: { not: movie.id } },
          {
            OR: [
              ...(movie.cycle ? [{ cycle: movie.cycle }] : []),
              { genre: movie.genre },
            ],
          },
        ],
      },
      take: 6,
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ movie, relatedMovies })
  } catch (error) {
    console.error('Error fetching movie:', error)
    return NextResponse.json({ error: 'Failed to fetch movie' }, { status: 500 })
  }
}

// PUT /api/movies/[slug] - Update movie
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const body = await request.json()

    let newSlug = slug
    if (body.title || body.year) {
      const existing = await db.movie.findUnique({ where: { slug } })
      if (existing) {
        const titleChanged = body.title && body.title !== existing.title
        const yearChanged = body.year !== undefined && body.year !== existing.year
        if (titleChanged || yearChanged) {
          newSlug = slugify(`${body.title || existing.title} ${body.year || existing.year || ''}`)
        }
      }
    }

    const movie = await db.movie.update({
      where: { slug },
      data: {
        ...(newSlug !== slug && { slug: newSlug }),
        title: body.title,
        year: body.year ? parseInt(body.year) : null,
        directors: body.directors,
        writers: body.writers,
        editors: body.editors,
        cinematographers: body.cinematographers,
        sound: body.sound,
        programmers: body.programmers,
        countries: body.countries,
        duration: body.duration ? parseInt(body.duration) : null,
        analysis: body.analysis,
        projectionDate1: body.projectionDate1 ? new Date(body.projectionDate1) : null,
        projectionDate2: body.projectionDate2 ? new Date(body.projectionDate2) : null,
        posterPath: body.posterPath,
        criticPdfPath: body.criticPdfPath,
        genre: body.genre,
        subgenres: body.subgenres,
        externalLinks: body.externalLinks,
        cycle: body.cycle,
      },
    })

    return NextResponse.json(movie)
  } catch (error) {
    console.error('Error updating movie:', error)
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 })
  }
}

// DELETE /api/movies/[slug] - Delete movie
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    await db.movie.delete({ where: { slug } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting movie:', error)
    return NextResponse.json({ error: 'Failed to delete movie' }, { status: 500 })
  }
}
