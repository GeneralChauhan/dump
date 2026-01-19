import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'meeting-backgrounds')
    
    // Check if directory exists
    if (!fs.existsSync(publicDir)) {
      return NextResponse.json({ images: [] })
    }

    // Get all image files from the main directory
    const files = fs.readdirSync(publicDir)
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return imageExtensions.includes(ext) && fs.statSync(path.join(publicDir, file)).isFile()
    })

    // Create image objects with dynamic thumbnail paths
    const images = imageFiles.map((file, index) => {
      const name = path.parse(file).name
      const thumbnailPath = `/api/thumbnail?image=${encodeURIComponent(file)}`
      const fullSizePath = `/meeting-backgrounds/${file}`
      
      return {
        id: (index + 1).toString(),
        name: name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        thumbnail: thumbnailPath,
        fullSize: fullSizePath,
        alt: `${name.replace(/[-_]/g, ' ')} meeting background`
      }
    })

    return NextResponse.json({ images })
  } catch (error) {
    console.error('Error reading images directory:', error)
    return NextResponse.json({ images: [] })
  }
}
