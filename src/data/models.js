import { asset } from '../lib/asset.js'
import raw from './models.json'

// The catalogue (written by `npm run sync-models`) with image paths made host-aware.
const models = raw.map((m) => ({
  ...m,
  image: asset(m.image),
  colours: m.colours.map((c) => ({ ...c, image: asset(c.image) })),
}))

export default models
