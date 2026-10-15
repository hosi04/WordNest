/** The largest centered square inside a width × height image. */
export function squareCrop(width: number, height: number): { x: number; y: number; size: number } {
  const size = Math.min(width, height)
  return { x: Math.round((width - size) / 2), y: Math.round((height - size) / 2), size }
}

/** Center-crops a picture to a square and shrinks it to size × size WebP (big enough to view full screen, ~50 KB). */
export async function toSquareWebp(file: Blob, size = 640): Promise<Blob> {
  const bitmap = await createImageBitmap(file)
  const crop = squareCrop(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = Math.min(size, crop.size)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported')
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, crop.x, crop.y, crop.size, crop.size, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not encode image'))), 'image/webp', 0.85),
  )
}
