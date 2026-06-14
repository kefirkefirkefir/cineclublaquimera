import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const UPLOAD_DIR_POSTERS = path.join(process.cwd(), 'public', 'uploads', 'posters')
const UPLOAD_DIR_PDFS = path.join(process.cwd(), 'public', 'uploads', 'pdfs')

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const type = formData.get('type') as string | null
    const movieSlug = formData.get('movieSlug') as string | null

    if (!file || !type) {
      return NextResponse.json({ error: 'File and type are required' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop() || 'bin'
    const prefix = movieSlug || `${Date.now()}`
    const filename = `${prefix}-${Date.now()}.${ext}`

    const uploadDir = type === 'poster' ? UPLOAD_DIR_POSTERS : UPLOAD_DIR_PDFS
    const publicPath = type === 'poster'
      ? `/uploads/posters/${filename}`
      : `/uploads/pdfs/${filename}`

    await mkdir(uploadDir, { recursive: true })
    await writeFile(path.join(uploadDir, filename), buffer)

    return NextResponse.json({ path: publicPath, filename })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
