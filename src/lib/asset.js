// Turns "/models/x.webp" into the right URL for wherever the site is hosted
// ("/models/x.webp" locally, "/WEBSITE/models/x.webp" on GitHub Pages).
export const asset = (path) => import.meta.env.BASE_URL + path.replace(/^\//, '')
