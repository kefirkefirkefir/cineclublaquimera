// Main genres (Level 1) - single required value
export const GENRES = [
  'drama',
  'comedia',
  'terror',
  'Sci-Fi',
  'fantasía',
  'thriller',
  'western',
  'musical',
  'documental',
] as const

export type Genre = (typeof GENRES)[number]

// Subgenres (Level 2) - multiple optional
export const SUBGENRES = [
  'noir',
  'coming of age',
  'histórico',
  'biográfico',
  'psicológico',
  'bélico',
  'romance',
  'road movie',
  'cine de época',
  'queer',
  'animación',
  'found footage',
  'archivo',
] as const

export type Subgenre = (typeof SUBGENRES)[number]

// Decades for filtering
export const DECADES = [
  { value: '1920', label: '1920s' },
  { value: '1930', label: '1930s' },
  { value: '1940', label: '1940s' },
  { value: '1950', label: '1950s' },
  { value: '1960', label: '1960s' },
  { value: '1970', label: '1970s' },
  { value: '1980', label: '1980s' },
  { value: '1990', label: '1990s' },
  { value: '2000', label: '2000s' },
  { value: '2010', label: '2010s' },
  { value: '2020', label: '2020s' },
] as const
