const maximumSide = 512
const targetBytes = 150 * 1024

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality))
}

export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith('image/')) throw new Error('Unsupported file type')

  const bitmap = await createImageBitmap(file)
  try {
    const initialScale = Math.min(1, maximumSide / Math.max(bitmap.width, bitmap.height))
    let width = Math.max(1, Math.round(bitmap.width * initialScale))
    let height = Math.max(1, Math.round(bitmap.height * initialScale))
    let quality = 0.72
    let outputType = 'image/webp'
    let smallestBlob: Blob | null = null

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) throw new Error('Canvas is unavailable')
      if (outputType === 'image/jpeg') {
        context.fillStyle = '#ffffff'
        context.fillRect(0, 0, width, height)
      }
      context.drawImage(bitmap, 0, 0, width, height)

      let blob = await canvasToBlob(canvas, outputType, quality)
      if (outputType === 'image/webp' && (!blob || blob.type !== 'image/webp')) {
        outputType = 'image/jpeg'
        blob = await canvasToBlob(canvas, outputType, quality)
      }
      if (!blob) throw new Error('Image encoding failed')
      if (!smallestBlob || blob.size < smallestBlob.size) smallestBlob = blob
      if (blob.size <= targetBytes) return blob

      if (quality > 0.42) quality -= 0.1
      else {
        width = Math.max(1, Math.round(width * 0.82))
        height = Math.max(1, Math.round(height * 0.82))
        quality = 0.62
      }
    }
    if (!smallestBlob) throw new Error('Image compression failed')
    return smallestBlob
  } finally {
    bitmap.close()
  }
}
