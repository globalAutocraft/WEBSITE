/*
  Pulls the vehicle list from the catalogue API, cuts each bike out of its
  studio background (keeping a soft real shadow), and saves:
    public/models/<slug>.webp   – transparent cut-out
    src/data/models.json        – list the site reads

  Run again whenever the catalogue changes:   npm run sync-models
*/
import { mkdir, writeFile } from 'node:fs/promises'
import sharp from 'sharp'

const API = 'https://models-api-y0px.onrender.com/api/models?active=true'
const OUT_IMG = new URL('../public/models/', import.meta.url)
const OUT_JSON = new URL('../src/data/models.json', import.meta.url)

// How each catalogue entry is shown on the site. Order = position in its list.
const CATALOG = {
  'APACHE RR 310': { name: 'Apache RR 310', category: 'motorcycles', fuel: 'Petrol' },
  'APACHE RTR 310': { name: 'Apache RTR 310', category: 'motorcycles', fuel: 'Petrol' },
  'APACHE RTR 200 4V': { name: 'Apache RTR 200 4V', category: 'motorcycles', fuel: 'Petrol' },
  'APACHE RTR 180 2V': { name: 'Apache RTR 180', category: 'motorcycles', fuel: 'Petrol' },
  'APACHE RTR 160 4V': { name: 'Apache RTR 160 4V', category: 'motorcycles', fuel: 'Petrol' },
  'APACHE RTR 160 2V': { name: 'Apache RTR 160', category: 'motorcycles', fuel: 'Petrol' },
  RONIN: { name: 'Ronin', category: 'motorcycles', fuel: 'Petrol' },
  RAIDER: { name: 'Raider', category: 'motorcycles', fuel: 'Petrol' },
  RADEON: { name: 'Radeon', category: 'motorcycles', fuel: 'Petrol' },
  SPORT: { name: 'Sport', category: 'motorcycles', fuel: 'Petrol' },
  'XL 100': { name: 'XL100', category: 'motorcycles', fuel: 'Petrol' },
  'NTORQ 150': { name: 'NTORQ 150', category: 'scooters', fuel: 'Petrol' },
  'NTORQ 125': { name: 'NTORQ 125', category: 'scooters', fuel: 'Petrol' },
  'JUPITER 125': { name: 'Jupiter 125', category: 'scooters', fuel: 'Petrol' },
  JUPITER: { name: 'Jupiter', category: 'scooters', fuel: 'Petrol' },
  ZEST: { name: 'Zest', category: 'scooters', fuel: 'Petrol' },
  X: { name: 'TVS X', category: 'electric', fuel: 'Electric' },
  IQUBE: { name: 'iQube', category: 'electric', fuel: 'Electric' },
  ORBITER: { name: 'Orbiter', category: 'electric', fuel: 'Electric' },
}

const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

async function fetchCatalogue() {
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // the API host sleeps when idle; the first call can take most of a minute
      const res = await fetch(API, { signal: AbortSignal.timeout(120_000) })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (e) {
      console.warn(`catalogue attempt ${attempt} failed: ${e.message}`)
    }
  }
  throw new Error('Could not reach the catalogue API')
}

/* ---------- background removal ---------- */

const lum = (r, g, b) => 0.2126 * r + 0.7152 * g + 0.0722 * b

async function cutOut(buffer) {
  const { data, info } = await sharp(buffer)
    .resize({ width: 900, height: 700, fit: 'inside', withoutEnlargement: true })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })
  const { width: W, height: H } = info
  const px = (x, y) => (y * W + x) * 4

  // studio background colour = median of the border pixels
  const border = []
  for (let x = 0; x < W; x += 3) border.push(lum(...data.subarray(px(x, 0), px(x, 0) + 3)), lum(...data.subarray(px(x, H - 1), px(x, H - 1) + 3)))
  for (let y = 0; y < H; y += 3) border.push(lum(...data.subarray(px(0, y), px(0, y) + 3)), lum(...data.subarray(px(W - 1, y), px(W - 1, y) + 3)))
  border.sort((a, b) => a - b)
  const bg = border[border.length >> 1]

  // A pixel is "background or shadow" if it is neutral grey, not brighter than
  // the backdrop and not too dark (so tyres and black paint are never eaten).
  const isBackdrop = (i) => {
    const r = data[i], g = data[i + 1], b = data[i + 2]
    const l = lum(r, g, b)
    const sat = Math.max(r, g, b) - Math.min(r, g, b)
    return sat < 16 && l <= bg + 6 && l >= bg * 0.5
  }

  // flood fill from the edges so look-alike pixels inside the bike are kept
  const inBg = new Uint8Array(W * H)
  const stack = []
  const seed = (x, y) => {
    const k = y * W + x
    if (!inBg[k] && isBackdrop(k * 4)) {
      inBg[k] = 1
      stack.push(k)
    }
  }
  for (let x = 0; x < W; x++) seed(x, 0), seed(x, H - 1)
  for (let y = 0; y < H; y++) seed(0, y), seed(W - 1, y)
  while (stack.length) {
    const k = stack.pop()
    const x = k % W, y = (k / W) | 0
    if (x > 0) seed(x - 1, y)
    if (x < W - 1) seed(x + 1, y)
    if (y > 0) seed(x, y - 1)
    if (y < H - 1) seed(x, y + 1)
  }

  // backdrop → transparent; its darker parts become a black shadow with alpha
  for (let k = 0; k < W * H; k++) {
    const i = k * 4
    if (inBg[k]) {
      const l = lum(data[i], data[i + 1], data[i + 2])
      const shade = Math.max(0, (bg - l) / bg)
      data[i] = data[i + 1] = data[i + 2] = 0
      data[i + 3] = Math.min(255, Math.round(shade * 1.5 * 255))
    } else {
      // soften the 1px rim where the bike meets the removed background
      const x = k % W, y = (k / W) | 0
      const touches = (x > 0 && inBg[k - 1]) || (x < W - 1 && inBg[k + 1]) || (y > 0 && inBg[k - W]) || (y < H - 1 && inBg[k + W])
      if (touches) data[i + 3] = 170
    }
  }

  return sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .trim({ threshold: 1 })
    .webp({ quality: 84, alphaQuality: 90 })
    .toBuffer()
}

/* ---------- main ---------- */

async function download(url) {
  const res = await fetch(url, { signal: AbortSignal.timeout(60_000) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return cutOut(Buffer.from(await res.arrayBuffer()))
}

const catalogue = await fetchCatalogue()
await mkdir(OUT_IMG, { recursive: true })

const models = []
const order = Object.keys(CATALOG)

for (const [key, entry] of Object.entries(catalogue)) {
  if (!entry.active) continue
  const meta = CATALOG[key]
  if (!meta) {
    console.warn(`⚠ "${key}" is in the catalogue but not in CATALOG above – add it to show it on the site`)
    continue
  }
  const slug = slugify(meta.name)
  try {
    // Note: tvsmotor.com blocks automated downloads (HTTP 403). Use an image from
    // another host in the catalogue for those models, or drop a file in public/models/.
    await writeFile(new URL(`${slug}.webp`, OUT_IMG), await download(entry.image))

    // variants and colours; every colour gets its own cut-out photo
    const variants = []
    const colours = new Map() // colour name → { name, image }
    for (const [vName, v] of Object.entries(entry.variants || {})) {
      if (v.active === false) continue
      const vColours = []
      for (const [cName, c] of Object.entries(v.colors || {})) {
        if (c.active === false) continue
        vColours.push(cName)
        if (!colours.has(cName) && c.image) colours.set(cName, { name: cName, url: c.image })
      }
      variants.push({ name: vName, colours: vColours })
    }
    await mkdir(new URL(`${slug}/`, OUT_IMG), { recursive: true })
    const colourList = []
    const done = new Map() // same photo used for several colours → cut it out once
    for (const c of colours.values()) {
      const file = `${slug}/${slugify(c.name)}.webp`
      try {
        if (!done.has(c.url)) {
          await writeFile(new URL(file, OUT_IMG), await download(c.url))
          done.set(c.url, file)
        }
        colourList.push({ name: c.name, image: `/models/${done.get(c.url)}` })
      } catch (e) {
        console.warn(`   colour ${c.name}: ${e.message}`)
      }
    }

    models.push({ slug, key, ...meta, image: `/models/${slug}.webp`, variants, colours: colourList })
    console.log(`✓ ${meta.name} (${variants.length} variants, ${colourList.length} colours)`)
  } catch (e) {
    console.warn(`✗ ${meta.name}: ${e.message}`)
  }
}

models.sort((a, b) => order.indexOf(a.key) - order.indexOf(b.key))
await writeFile(OUT_JSON, JSON.stringify(models, null, 2) + '\n')
console.log(`\nSaved ${models.length} models.`)
