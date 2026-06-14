'use client'

import { useState, useEffect, useCallback } from 'react'
import { useCineclubStore } from '@/stores/cineclub-store'
import type { Movie } from '@/lib/types'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  LogIn,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  ImageOff,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export function AdminPanel() {
  const {
    adminPanelOpen,
    setAdminPanelOpen,
    isAdmin,
    setIsAdmin,
    movieFormOpen,
    setMovieFormOpen,
    setEditingMovie,
  } = useCineclubStore()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Movie | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Check localStorage on mount
  useEffect(() => {
    const auth = localStorage.getItem('cineclub-auth')
    if (auth === 'true') {
      setIsAdmin(true)
    }
  }, [setIsAdmin])

  // Fetch movies when admin panel opens
  const fetchMovies = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/movies?limit=100')
      const data = await res.json()
      setMovies(data.movies || [])
    } catch (error) {
      console.error('Failed to fetch movies:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (adminPanelOpen && isAdmin) {
      fetchMovies()
    }
  }, [adminPanelOpen, isAdmin, fetchMovies])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setIsAdmin(true)
        localStorage.setItem('cineclub-auth', 'true')
        toast.success('Sesión iniciada')
      } else {
        toast.error('Credenciales incorrectas')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleLogout = () => {
    setIsAdmin(false)
    localStorage.removeItem('cineclub-auth')
    toast.success('Sesión cerrada')
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/movies/${deleteTarget.slug}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Película eliminada')
        setDeleteTarget(null)
        fetchMovies()
      } else {
        toast.error('Error al eliminar')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setDeleting(false)
    }
  }

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie)
    setMovieFormOpen(true)
  }

  const handleNew = () => {
    setEditingMovie(null)
    setMovieFormOpen(true)
  }

  return (
    <>
      <Sheet open={adminPanelOpen} onOpenChange={setAdminPanelOpen}>
        <SheetContent className="w-full sm:max-w-xl bg-background border-border/50 p-0 flex flex-col">
          <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-lg font-display font-semibold uppercase tracking-wider">Administración</SheetTitle>
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-muted-foreground">
                  <LogOut className="h-3.5 w-3.5" />
                  Salir
                </Button>
              )}
            </div>
          </SheetHeader>

          {!isAdmin ? (
            // Login form
            <div className="flex-1 flex items-center justify-center p-6">
              <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
                <div className="flex flex-col items-center gap-2 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary">
                    <LogIn className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold">Acceso admin</h3>
                  <p className="text-xs text-muted-foreground text-center">
                    Introduce tus credenciales para gestionar el catálogo
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@cineclub.es"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loginLoading}>
                  {loginLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                  Iniciar sesión
                </Button>
              </form>
            </div>
          ) : (
            // Movie management
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* New movie button */}
              <div className="px-6 py-3 border-b border-border/50">
                <Button onClick={handleNew} size="sm" className="gap-1.5">
                  <Plus className="h-3.5 w-3.5" />
                  Nueva película
                </Button>
              </div>

              {/* Movie list */}
              <ScrollArea className="flex-1">
                <div className="px-6 py-3 space-y-2">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-2">
                        <Skeleton className="h-12 w-8 rounded" />
                        <div className="flex-1 space-y-1">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))
                  ) : movies.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <ImageOff className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">No hay películas</p>
                      <p className="text-xs text-muted-foreground mt-1">Crea la primera película</p>
                    </div>
                  ) : (
                    movies.map((movie) => (
                      <div
                        key={movie.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors group"
                      >
                        {/* Poster thumbnail */}
                        <div className="relative h-14 w-10 shrink-0 rounded overflow-hidden bg-secondary">
                          {movie.posterPath ? (
                            <Image
                              src={movie.posterPath}
                              alt={movie.title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageOff className="h-4 w-4 text-muted-foreground/40" />
                            </div>
                          )}
                        </div>
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{movie.title}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {movie.year && <span>{movie.year}</span>}
                            {movie.year && movie.genre && <span>·</span>}
                            {movie.genre && (
                              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                {movie.genre}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(movie)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(movie)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar película</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar &quot;{deleteTarget?.title}&quot;? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
