import React from 'react'
// Hand-inked realm marks: short strokes, one per imagined desert.
const GLYPHS = [
  `<path d="M3 16.5 C 7 11.5, 11 11.3, 14 14.2 C 16.4 16.5, 19 17.2, 21 15.6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M6 19.5 C 9.5 17.8, 14.5 17.8, 18 19.3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  `<path d="M5.5 18.5 L 9.2 7 L 13 13 L 15.6 8.6 L 19 18.4 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9.2 7 L 10.6 12.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  `<path d="M7.5 15 A 4.6 4.6 0 0 1 16.6 15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 15.3 L 20.2 15.1 M12 8.6 L 12 6.4 M8 10 L 6.8 8.6 M16.2 10 L 17.4 8.7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>`,
  `<circle cx="12" cy="9.6" r="3.4" fill="none" stroke="currentColor" stroke-width="2"/><path d="M4 17.5 C 8 14.5, 13 14.3, 17 16.4 C 18.6 17.2, 19.8 17.3, 20.6 16.8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  `<path d="M4 17.8 L 20 17.6 M6 14.6 C 10 13.4, 14 13.4, 18 14.5 M8.5 11.4 C 11 10.6, 13 10.6, 15.5 11.3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><circle cx="12" cy="7.4" r="2" fill="none" stroke="currentColor" stroke-width="1.8"/>`,
  `<path d="M11.4 3.5 L 13.4 8 L 10.4 12 L 14.2 15.8 L 11.2 20.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
  `<path d="M12 12 m -4.4 0 a 4.4 4.4 0 1 1 4.4 4.4 a 3 3 0 1 1 -3 -3 a 1.5 1.5 0 1 0 1.5 -1.5" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/><path d="M18.5 5.5 L 18.5 8 M17.2 6.8 L 19.8 6.7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`,
  `<path d="M4 18.5 C 6 12.5, 9 9.3, 12 9.4 C 15 9.5, 18 12.6, 20 18.4 M7.4 18.5 C 8.8 14, 10.6 12.4, 12 12.5 C 13.4 12.6, 15.2 14.1, 16.6 18.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
  `<path d="M12 4 L 15.8 10 L 14 20 L 10 20 L 8.2 10.2 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12 4 L 12 20 M 8.2 10.2 L 15.8 10" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
  `<path d="M4 11.5 L 9 11.6 L 11 15 L 15 14.8 L 17 11.6 L 20 11.5 M11 15 L 10.8 19 M15 14.8 L 16.2 18.2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`,
]
export function RealmGlyph({ index }) {
  return <svg className='ink-icon' viewBox='0 0 24 24' aria-hidden='true' focusable='false' dangerouslySetInnerHTML={{ __html: GLYPHS[index] || '' }} />
}
const LIGHT = {
  dawn: `<path d="M7.5 15 A 4.5 4.5 0 0 1 16.5 15 M4 15.4 L 20 15.2 M12 8 L 12 5.6 M8.5 9.5 L 7.4 8.2 M15.5 9.5 L 16.6 8.3" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>`,
  noon: `<circle cx="12" cy="12" r="3.6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4.5 L 12 6.6 M12 17.4 L 12 19.5 M4.5 12 L 6.6 12 M17.4 12 L 19.5 12 M6.8 6.8 L 8.3 8.3 M15.7 15.7 L 17.2 17.2 M17.2 6.8 L 15.7 8.3 M8.3 15.7 L 6.8 17.2" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>`,
  dusk: `<path d="M7.5 9 A 4.5 4.5 0 0 0 16.5 9 M4 9.2 L 20 9 M9 13.5 L 8 14.8 M12 14 L 12 15.6 M15 13.5 L 16 14.8" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"/>`,
  night: `<path d="M14.5 4.5 A 7 7 0 1 0 19.5 15 A 5.6 5.6 0 0 1 14.5 4.5 Z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`,
}
export function LightGlyph({ kind }) {
  return <svg className='ink-icon' viewBox='0 0 24 24' aria-hidden='true' focusable='false' dangerouslySetInnerHTML={{ __html: LIGHT[kind] || '' }} />
}
