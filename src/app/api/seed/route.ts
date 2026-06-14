import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// POST /api/seed - Seed database with a single sample movie and admin user
export async function POST() {
  try {
    // Create admin user
    const existingAdmin = await db.user.findUnique({ where: { email: 'admin@cineclub.es' } })
    if (!existingAdmin) {
      await db.user.create({
        data: {
          email: 'admin@cineclub.es',
          password: 'admin123',
          name: 'Admin Cineclub',
          role: 'admin',
        },
      })
    }

    // Check if movies already exist
    const existingMovies = await db.movie.count()
    if (existingMovies > 0) {
      return NextResponse.json({ message: 'Database already seeded', movieCount: existingMovies })
    }

    await db.movie.create({
      data: {
        slug: 'el-aparato',
        title: 'El Aparato',
        year: 2006,
        directors: 'Jafar Panahi',
        writers: 'Jafar Panahi, Shadmehr Rastin',
        editors: 'Jafar Panahi',
        cinematographers: 'Mahmoud Kalari',
        sound: null,
        programmers: null,
        countries: 'Irán, Francia',
        duration: 95,
        analysis: 'El sexto largometraje de Jafar Panahi es un filme-contenedor, un mecanismo perfectamente engranado que, a través de un solo día en la vida de una joven que se gradúa como profesora, dibuja un mapa emocional y político de todo un país.',
        projectionDate1: new Date('2025-01-15'),
        projectionDate2: new Date('2025-01-16'),
        posterPath: null,
        criticPdfPath: null,
        genre: 'drama',
        subgenres: 'noir, psicológico',
        externalLinks: null,
        cycle: 'Cine iraní contemporáneo',
      },
    })

    return NextResponse.json({
      message: 'Database seeded successfully',
      movieCount: 1,
      adminEmail: 'admin@cineclub.es',
      adminPassword: 'admin123',
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 })
  }
}
