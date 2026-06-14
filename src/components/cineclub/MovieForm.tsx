'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useCineclubStore } from '@/stores/cineclub-store'
import type { Movie, ExternalLink } from '@/lib/types'
import { GENRES, SUBGENRES } from '@/lib/constants'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Search,
  Upload,
  X,
  Loader2,
  ImageOff,
  FileText,
  Plus,
  Trash2,
  Check,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

interface TMDbSearchResult {
  id: number
  title: string
  year: number | null
  posterUrl: string | null
  genre: string | null
  overview: string
}

export function MovieForm() {
  const {
    movieFormOpen,
    setMovieFormOpen,
    editingMovie,
    setEditingMovie,
  } = useCineclubStore()

  const [form, setForm] = useState({
    title: '',
    year: '',
    directors: '',
    writers: '',
    editors: '',
    cinematographers: '',
    sound: '',
    programmers: '',
    countries: '',
    duration: '',
    analysis: '',
    projectionDate1: '',
    projectionDate2: '',
    genre: 'drama',
    subgenres: '' as string,
    cycle: '',
    posterPath: '',
    criticPdfPath: '',
    externalLinks: [] as ExternalLink[],
  })

  const [tmdbQuery, setTmdbQuery] = useState('')
  const [tmdbResults, setTmdbResults] = useState<TMDbSearchResult[]>([])
  const [tmdbLoading, setTmdbLoading] = useState(false)
  const [tmdbOpen, setTmdbOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [uploadingPoster, setUploadingPoster] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tmdbRef = useRef<HTMLDivElement>(null)

  // Populate form when editing
  useEffect(() => {
    if (editingMovie) {
      let extLinks: ExternalLink[] = []
      if (editingMovie.externalLinks) {
        try { extLinks = JSON.parse(editingMovie.externalLinks) } catch { extLinks = [] }
      }
      setForm({
        title: editingMovie.title,
        year: editingMovie.year?.toString() || '',
        directors: editingMovie.directors,
        writers: editingMovie.writers || '',
        editors: editingMovie.editors || '',
        cinematographers: editingMovie.cinematographers || '',
        sound: editingMovie.sound || '',
        programmers: editingMovie.programmers || '',
        countries: editingMovie.countries,
        duration: editingMovie.duration?.toString() || '',
        analysis: editingMovie.analysis || '',
        projectionDate1: editingMovie.projectionDate1 ? editingMovie.projectionDate1.split('T')[0] : '',
        projectionDate2: editingMovie.projectionDate2 ? editingMovie.projectionDate2.split('T')[0] : '',
        genre: editingMovie.genre,
        subgenres: editingMovie.subgenres || '',
        cycle: editingMovie.cycle || '',
        posterPath: editingMovie.posterPath || '',
        criticPdfPath: editingMovie.criticPdfPath || '',
        externalLinks: extLinks,
      })
    } else {
      setForm({
        title: '', year: '', directors: '', writers: '', editors: '',
        cinematographers: '', sound: '', programmers: '', countries: '', duration: '',
        analysis: '', projectionDate1: '', projectionDate2: '',
        genre: 'drama', subgenres: '', cycle: '', posterPath: '',
        criticPdfPath: '', externalLinks: [],
      })
    }
  }, [editingMovie, movieFormOpen])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (tmdbRef.current && !tmdbRef.current.contains(e.target as Node)) {
        setTmdbOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // TMDb search with debounce
  const searchTMDb = useCallback(async (query: string) => {
    if (!query.trim()) {
      setTmdbResults([])
      setTmdbOpen(false)
      return
    }
    setTmdbLoading(true)
    try {
      const res = await fetch(`/api/tmdb/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      if (data.error) {
        toast.error(data.error)
        setTmdbResults([])
        setTmdbOpen(false)
      } else {
        setTmdbResults(data.results || [])
        setTmdbOpen(data.results?.length > 0)
      }
    } catch {
      setTmdbResults([])
    } finally {
      setTmdbLoading(false)
    }
  }, [])

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => searchTMDb(tmdbQuery), 400)
    return () => { if (searchTimeout.current) clearTimeout(searchTimeout.current) }
  }, [tmdbQuery, searchTMDb])

  // Fetch TMDb details and autofill
  const selectTMDbResult = async (result: TMDbSearchResult) => {
    setTmdbOpen(false)
    setTmdbLoading(true)
    try {
      const res = await fetch(`/api/tmdb/search?id=${result.id}`)
      const data = await res.json()
      if (data.title) {
        setForm((prev) => ({
          ...prev,
          title: data.title || prev.title,
          year: data.year?.toString() || prev.year,
          directors: data.directors || prev.directors,
          writers: data.writers || prev.writers,
          editors: data.editors || prev.editors,
          cinematographers: data.cinematographers || prev.cinematographers,
          sound: data.sound || prev.sound,
          programmers: data.programmers || prev.programmers,
          countries: data.countries || prev.countries,
          duration: data.duration?.toString() || prev.duration,
          genre: data.genre || prev.genre,
        }))
        toast.success('Datos auto-rellenados desde TMDb')
      }
    } catch {
      toast.error('Error al obtener detalles de TMDb')
    } finally {
      setTmdbLoading(false)
    }
  }

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleSubgenre = (sg: string) => {
    setForm((prev) => {
      const current = prev.subgenres ? prev.subgenres.split(',').map(s => s.trim()).filter(Boolean) : []
      const idx = current.indexOf(sg)
      if (idx >= 0) {
        current.splice(idx, 1)
      } else {
        current.push(sg)
      }
      return { ...prev, subgenres: current.join(', ') }
    })
  }

  const addExternalLink = () => {
    setForm((prev) => ({
      ...prev,
      externalLinks: [...prev.externalLinks, { title: '', url: '' }],
    }))
  }

  const updateExternalLink = (index: number, field: keyof ExternalLink, value: string) => {
    setForm((prev) => {
      const links = [...prev.externalLinks]
      links[index] = { ...links[index], [field]: value }
      return { ...prev, externalLinks: links }
    })
  }

  const removeExternalLink = (index: number) => {
    setForm((prev) => ({
      ...prev,
      externalLinks: prev.externalLinks.filter((_, i) => i !== index),
    }))
  }

  const uploadFile = async (file: File, type: 'poster' | 'pdf') => {
    const setUploading = type === 'poster' ? setUploadingPoster : setUploadingPdf
    const field = type === 'poster' ? 'posterPath' : 'criticPdfPath'
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      formData.append('movieSlug', form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'))

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (res.ok) {
        setForm((prev) => ({ ...prev, [field]: data.path }))
        toast.success(`${type === 'poster' ? 'Cartel' : 'PDF'} subido correctamente`)
      } else {
        toast.error('Error al subir archivo')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('El título es obligatorio')
      return
    }
    setSubmitting(true)
    try {
      const body = {
        ...form,
        year: form.year ? parseInt(form.year) : null,
        duration: form.duration ? parseInt(form.duration) : null,
        externalLinks: form.externalLinks.length > 0 ? JSON.stringify(form.externalLinks) : null,
      }

      if (editingMovie) {
        const res = await fetch(`/api/movies/${editingMovie.slug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          toast.success('Película actualizada')
          handleClose()
        } else {
          toast.error('Error al actualizar')
        }
      } else {
        const res = await fetch('/api/movies', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })
        if (res.ok) {
          toast.success('Película creada')
          handleClose()
        } else {
          toast.error('Error al crear')
        }
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setMovieFormOpen(false)
    setEditingMovie(null)
    setTmdbQuery('')
    setTmdbResults([])
    setTmdbOpen(false)
  }

  return (
    <Sheet open={movieFormOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl bg-background border-border/50 p-0 flex flex-col max-h-[100dvh] overflow-y-auto overscroll-y-contain"
        style={{ touchAction: 'pan-y' }}
      >
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50 shrink-0 sticky top-0 z-10 bg-background">
          <SheetTitle className="text-lg">
            {editingMovie ? 'Editar película' : 'Nueva película'}
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6 flex-1">
            {/* TMDb Search */}
            <div ref={tmdbRef}>
              <Label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                Buscar en TMDb
              </Label>
              <div className="relative mt-1.5">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar película para auto-rellenar datos..."
                  value={tmdbQuery}
                  onChange={(e) => setTmdbQuery(e.target.value)}
                  className="pl-9"
                />
                {tmdbLoading && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                )}
              </div>

              {/* TMDb dropdown */}
              {tmdbOpen && tmdbResults.length > 0 && (
                <div className="absolute z-50 mt-1 w-[calc(100%-3rem)] max-h-64 overflow-y-auto rounded-lg border border-border bg-popover shadow-lg">
                  {tmdbResults.map((result) => (
                    <button
                      key={result.id}
                      type="button"
                      onClick={() => selectTMDbResult(result)}
                      className="flex w-full items-center gap-3 px-3 py-2 hover:bg-accent transition-colors text-left"
                    >
                      <div className="relative h-12 w-8 shrink-0 rounded overflow-hidden bg-secondary">
                        {result.posterUrl ? (
                          <Image src={result.posterUrl} alt={result.title} fill className="object-cover" sizes="32px" unoptimized />
                        ) : (
                          <ImageOff className="h-full w-full p-1 text-muted-foreground/30" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{result.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {result.year || 'Sin año'}
                          {result.genre && ` · ${result.genre}`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Main info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="title">Título *</Label>
                <Input id="title" value={form.title} onChange={(e) => updateField('title', e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="year">Año</Label>
                <Input id="year" type="number" value={form.year} onChange={(e) => updateField('year', e.target.value)} placeholder="2024" />
              </div>
              <div>
                <Label htmlFor="genre">Género principal *</Label>
                <Select value={form.genre} onValueChange={(v) => updateField('genre', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {GENRES.map((g) => (
                      <SelectItem key={g} value={g} className="capitalize">{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Crew */}
            <div className="space-y-3">
              <Label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Equipo técnico</Label>
              <div>
                <Label htmlFor="directors" className="text-xs">Dirección</Label>
                <Input id="directors" value={form.directors} onChange={(e) => updateField('directors', e.target.value)} placeholder="Nombre, Nombre (separar con comas)" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="writers" className="text-xs">Guion</Label>
                  <Input id="writers" value={form.writers} onChange={(e) => updateField('writers', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="editors" className="text-xs">Edición</Label>
                  <Input id="editors" value={form.editors} onChange={(e) => updateField('editors', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="cinematographers" className="text-xs">Fotografía</Label>
                  <Input id="cinematographers" value={form.cinematographers} onChange={(e) => updateField('cinematographers', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="sound" className="text-xs">Sonido</Label>
                  <Input id="sound" value={form.sound} onChange={(e) => updateField('sound', e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="programmers" className="text-xs">Programadore</Label>
                  <Input id="programmers" value={form.programmers} onChange={(e) => updateField('programmers', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Country, duration, cycle */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <Label htmlFor="countries" className="text-xs">País</Label>
                <Input id="countries" value={form.countries} onChange={(e) => updateField('countries', e.target.value)} placeholder="España, Francia" />
              </div>
              <div>
                <Label htmlFor="duration" className="text-xs">Duración (min)</Label>
                <Input id="duration" type="number" value={form.duration} onChange={(e) => updateField('duration', e.target.value)} placeholder="120" />
              </div>
              <div>
                <Label htmlFor="cycle" className="text-xs">Ciclo</Label>
                <Input id="cycle" value={form.cycle} onChange={(e) => updateField('cycle', e.target.value)} placeholder="Ciclo de Akira Kurosawa" />
              </div>
            </div>

            {/* Projection dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="proj1" className="text-xs">Fecha proyección 1</Label>
                <Input id="proj1" type="date" value={form.projectionDate1} onChange={(e) => updateField('projectionDate1', e.target.value)} />
              </div>
              <div>
                <Label htmlFor="proj2" className="text-xs">Fecha proyección 2</Label>
                <Input id="proj2" type="date" value={form.projectionDate2} onChange={(e) => updateField('projectionDate2', e.target.value)} />
              </div>
            </div>

            {/* Subgenres */}
            <div>
              <Label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">Subgéneros</Label>
              <div className="flex flex-wrap gap-1.5">
                {SUBGENRES.map((sg) => {
                  const isActive = form.subgenres.split(',').map(s => s.trim()).includes(sg)
                  return (
                    <button
                      key={sg}
                      type="button"
                      onClick={() => toggleSubgenre(sg)}
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {isActive && <Check className="h-2.5 w-2.5" />}
                      {sg}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Analysis */}
            <div>
              <Label htmlFor="analysis" className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">Análisis</Label>
              <Textarea
                id="analysis"
                value={form.analysis}
                onChange={(e) => updateField('analysis', e.target.value)}
                placeholder="Análisis escrito por el equipo del cineclub..."
                rows={4}
                className="mt-1.5"
              />
            </div>

            <Separator />

            {/* Poster upload */}
            <div>
              <Label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Cartel
              </Label>
              {form.posterPath ? (
                <div className="relative aspect-[2/3] max-w-[200px] rounded-lg overflow-hidden bg-secondary group">
                  <Image src={form.posterPath} alt="Preview" fill className="object-cover" sizes="200px" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button variant="destructive" size="sm" onClick={() => updateField('posterPath', '')}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-40 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 cursor-pointer transition-colors">
                  {uploadingPoster ? (
                    <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground/50 mb-2" />
                      <p className="text-xs text-muted-foreground">Arrastra o haz clic para subir cartel</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadFile(file, 'poster')
                    }}
                  />
                </label>
              )}
            </div>

            {/* PDF upload */}
            <div>
              <Label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                Crítica / Fanzine (PDF)
              </Label>
              {form.criticPdfPath ? (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary">
                  <FileText className="h-5 w-5 text-primary" />
                  <span className="text-sm flex-1 truncate">{form.criticPdfPath.split('/').pop()}</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateField('criticPdfPath', '')}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center h-24 rounded-lg border-2 border-dashed border-border/50 hover:border-primary/50 cursor-pointer transition-colors">
                  {uploadingPdf ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary mb-1" />
                  ) : (
                    <>
                      <FileText className="h-6 w-6 text-muted-foreground/50 mb-1" />
                      <p className="text-xs text-muted-foreground">Arrastra o haz clic para subir PDF</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) uploadFile(file, 'pdf')
                    }}
                  />
                </label>
              )}
            </div>

            {/* External links */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label className="text-[13px] font-medium text-muted-foreground uppercase tracking-wider">
                  Material adicional (enlaces)
                </Label>
                <Button type="button" variant="ghost" size="sm" onClick={addExternalLink} className="gap-1 h-6 text-xs">
                  <Plus className="h-3 w-3" />
                  Añadir enlace
                </Button>
              </div>
              <div className="space-y-2">
                {form.externalLinks.map((link, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      placeholder="Título"
                      value={link.title}
                      onChange={(e) => updateExternalLink(i, 'title', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => updateExternalLink(i, 'url', e.target.value)}
                      className="flex-1"
                    />
                    <Button type="button" variant="ghost" size="icon" className="shrink-0 h-9 w-9" onClick={() => removeExternalLink(i)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Submit */}
            <div className="flex items-center gap-3 pb-6">
              <Button type="submit" className="flex-1" disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editingMovie ? 'Guardar cambios' : 'Crear película'}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
            </div>
          </form>
      </SheetContent>
    </Sheet>
  )
}
