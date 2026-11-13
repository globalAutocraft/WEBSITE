// Turns a catalogue colour name ("NITRO GREEN", "Copper + White", "BLK YLW") into
// swatch colours for the little dots. The exact name is always shown as the label.
const WORDS = [
  [/black|blk|panther|deadpool|stardust|gl blk/i, '#17171b'],
  [/white/i, '#f3f3f3'],
  [/silver|stellar/i, '#c3c6cc'],
  [/titanium|nardo|wolverine|lunar|t\.? ?grey|m\.? ?grey|grey|gray/i, '#7c8088'],
  [/turq/i, '#16a3b2'],
  [/nitro|neon|n\.green/i, '#b8d42b'],
  [/aurora|doomsday|green/i, '#3f8f3a'],
  [/yellow|ylw|sunburst/i, '#efcf1d'],
  [/copper|bronze|martian/i, '#a5603d'],
  [/brown|walnut/i, '#6e4a33'],
  [/purple/i, '#6a3fa2'],
  [/captain america/i, '#2148b8'],
  [/blue|str|fz|dawn|stratos|spectral/i, '#2451c6'],
  [/red|racing|rc|helket|ironman/i, '#d2232c'],
]

export function swatch(name) {
  const parts = name.split(/\s*\+\s*|\s+(?=black|blk|grey|white|red|yellow|ylw)/i)
  const colours = []
  for (const part of parts) {
    const hit = WORDS.find(([re]) => re.test(part))
    if (hit && !colours.includes(hit[1])) colours.push(hit[1])
  }
  if (!colours.length) colours.push('#9a9aa3')
  return colours.slice(0, 2)
}

export const swatchBackground = (name) => {
  const [a, b] = swatch(name)
  return b ? `linear-gradient(135deg, ${a} 50%, ${b} 50%)` : a
}

// "STRIKING RED" → "Striking Red"
export const prettyColour = (name) =>
  name
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/\b([A-Z][a-z]?)\b(?!\.)/g, (w) => (w.length <= 2 ? w.toUpperCase() : w)) // RC, GL, FZ stay capitals
    .replace(/\bBlk\b/, 'Black')
    .replace(/\bYlw\b/, 'Yellow')
