export type GoogleFontCategory = 'sans-serif' | 'serif' | 'monospace' | 'display' | 'handwriting'

export type GoogleFontOption = {
  family: string
  category: GoogleFontCategory
}

const FONT_FALLBACKS: Record<GoogleFontCategory, string> = {
  'sans-serif': 'sans-serif',
  serif: 'serif',
  monospace: 'monospace',
  display: 'sans-serif',
  handwriting: 'cursive',
}

export const GOOGLE_FONT_OPTIONS: GoogleFontOption[] = [
  { family: 'ABeeZee', category: 'sans-serif' },
  { family: 'Abel', category: 'sans-serif' },
  { family: 'Abril Fatface', category: 'display' },
  { family: 'Alegreya', category: 'serif' },
  { family: 'Alegreya Sans', category: 'sans-serif' },
  { family: 'Anton', category: 'display' },
  { family: 'Archivo', category: 'sans-serif' },
  { family: 'Archivo Black', category: 'sans-serif' },
  { family: 'Arimo', category: 'sans-serif' },
  { family: 'Assistant', category: 'sans-serif' },
  { family: 'Barlow', category: 'sans-serif' },
  { family: 'Barlow Condensed', category: 'sans-serif' },
  { family: 'Bebas Neue', category: 'display' },
  { family: 'Bitter', category: 'serif' },
  { family: 'Bodoni Moda', category: 'serif' },
  { family: 'Cabin', category: 'sans-serif' },
  { family: 'Cairo', category: 'sans-serif' },
  { family: 'Cardo', category: 'serif' },
  { family: 'Catamaran', category: 'sans-serif' },
  { family: 'Cinzel', category: 'serif' },
  { family: 'Comfortaa', category: 'display' },
  { family: 'Cormorant Garamond', category: 'serif' },
  { family: 'Crimson Text', category: 'serif' },
  { family: 'Dancing Script', category: 'handwriting' },
  { family: 'DM Sans', category: 'sans-serif' },
  { family: 'DM Serif Display', category: 'serif' },
  { family: 'Domine', category: 'serif' },
  { family: 'Dosis', category: 'sans-serif' },
  { family: 'EB Garamond', category: 'serif' },
  { family: 'Exo 2', category: 'sans-serif' },
  { family: 'Figtree', category: 'sans-serif' },
  { family: 'Fira Code', category: 'monospace' },
  { family: 'Fira Sans', category: 'sans-serif' },
  { family: 'Fjalla One', category: 'sans-serif' },
  { family: 'Fraunces', category: 'serif' },
  { family: 'Great Vibes', category: 'handwriting' },
  { family: 'Heebo', category: 'sans-serif' },
  { family: 'IBM Plex Mono', category: 'monospace' },
  { family: 'IBM Plex Sans', category: 'sans-serif' },
  { family: 'IBM Plex Serif', category: 'serif' },
  { family: 'Inconsolata', category: 'monospace' },
  { family: 'Inter', category: 'sans-serif' },
  { family: 'Josefin Sans', category: 'sans-serif' },
  { family: 'Josefin Slab', category: 'serif' },
  { family: 'Jost', category: 'sans-serif' },
  { family: 'Kanit', category: 'sans-serif' },
  { family: 'Karla', category: 'sans-serif' },
  { family: 'Lato', category: 'sans-serif' },
  { family: 'Libre Baskerville', category: 'serif' },
  { family: 'Libre Franklin', category: 'sans-serif' },
  { family: 'Lora', category: 'serif' },
  { family: 'Manrope', category: 'sans-serif' },
  { family: 'Merriweather', category: 'serif' },
  { family: 'Merriweather Sans', category: 'sans-serif' },
  { family: 'Montserrat', category: 'sans-serif' },
  { family: 'Montserrat Alternates', category: 'sans-serif' },
  { family: 'Mulish', category: 'sans-serif' },
  { family: 'Nanum Gothic', category: 'sans-serif' },
  { family: 'Newsreader', category: 'serif' },
  { family: 'Noto Sans', category: 'sans-serif' },
  { family: 'Noto Serif', category: 'serif' },
  { family: 'Nunito', category: 'sans-serif' },
  { family: 'Nunito Sans', category: 'sans-serif' },
  { family: 'Old Standard TT', category: 'serif' },
  { family: 'Open Sans', category: 'sans-serif' },
  { family: 'Oswald', category: 'sans-serif' },
  { family: 'Outfit', category: 'sans-serif' },
  { family: 'Overpass', category: 'sans-serif' },
  { family: 'Oxygen', category: 'sans-serif' },
  { family: 'Pacifico', category: 'handwriting' },
  { family: 'Passion One', category: 'display' },
  { family: 'Patrick Hand', category: 'handwriting' },
  { family: 'Permanent Marker', category: 'handwriting' },
  { family: 'Playfair Display', category: 'serif' },
  { family: 'Plus Jakarta Sans', category: 'sans-serif' },
  { family: 'Poppins', category: 'sans-serif' },
  { family: 'Prata', category: 'serif' },
  { family: 'PT Sans', category: 'sans-serif' },
  { family: 'PT Serif', category: 'serif' },
  { family: 'Quattrocento', category: 'serif' },
  { family: 'Quicksand', category: 'sans-serif' },
  { family: 'Raleway', category: 'sans-serif' },
  { family: 'Roboto', category: 'sans-serif' },
  { family: 'Roboto Condensed', category: 'sans-serif' },
  { family: 'Roboto Mono', category: 'monospace' },
  { family: 'Roboto Serif', category: 'serif' },
  { family: 'Roboto Slab', category: 'serif' },
  { family: 'Rubik', category: 'sans-serif' },
  { family: 'Satisfy', category: 'handwriting' },
  { family: 'Source Code Pro', category: 'monospace' },
  { family: 'Source Sans 3', category: 'sans-serif' },
  { family: 'Source Serif 4', category: 'serif' },
  { family: 'Space Grotesk', category: 'sans-serif' },
  { family: 'Space Mono', category: 'monospace' },
  { family: 'Spectral', category: 'serif' },
  { family: 'Titillium Web', category: 'sans-serif' },
  { family: 'Ubuntu', category: 'sans-serif' },
  { family: 'Ubuntu Mono', category: 'monospace' },
  { family: 'Work Sans', category: 'sans-serif' },
  { family: 'Yanone Kaffeesatz', category: 'sans-serif' },
  { family: 'Ysabeau', category: 'sans-serif' },
]

export function getFontFamilyName(fontStack: string | null | undefined) {
  if (!fontStack) return 'Inter'
  return fontStack.split(',')[0].trim().replace(/^['"]|['"]$/g, '') || 'Inter'
}

export function buildGoogleFontStack(familyInput: string, fallback?: GoogleFontCategory) {
  const family = getFontFamilyName(familyInput)
  const option = GOOGLE_FONT_OPTIONS.find(font => font.family.toLowerCase() === family.toLowerCase())
  const category = fallback || option?.category || 'sans-serif'
  return `'${family.replace(/'/g, "\\'")}', ${FONT_FALLBACKS[category]}`
}

export function getGoogleFontsStylesheetHref(fontStacks: Array<string | null | undefined>) {
  const families = Array.from(new Set(fontStacks.map(getFontFamilyName).filter(Boolean)))
  if (families.length === 0) return null

  const familyParams = families
    .map(family => `family=${encodeURIComponent(family).replace(/%20/g, '+')}`)
    .join('&')

  return `https://fonts.googleapis.com/css2?${familyParams}&display=swap`
}
