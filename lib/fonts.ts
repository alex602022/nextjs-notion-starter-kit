import { Noto_Sans, Noto_Serif, Pacifico } from 'next/font/google'

// Google retired the original 'Droid Sans'/'Droid Serif' families and
// replaced them with these near-identical successors (same design lineage).
export const fontScript = Pacifico({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-script'
})

export const fontSerif = Noto_Serif({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-serif'
})

export const fontBody = Noto_Sans({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-body'
})
