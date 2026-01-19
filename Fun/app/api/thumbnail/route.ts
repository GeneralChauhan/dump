import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const imageName = searchParams.get('image')
    
    if (!imageName) {
      return new NextResponse('Image parameter required', { status: 400 })
    }

    const imagePath = path.join(process.cwd(), 'public', 'meeting-backgrounds', imageName)
    
    // Check if the original image exists
    if (!fs.existsSync(imagePath)) {
      return new NextResponse('Image not found', { status: 404 })
    }

    // Generate thumbnail using sharp
    const thumbnailBuffer = await sharp(imagePath)
      .resize(480, 270, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({
        quality: 80,
        progressive: true
      })
      .toBuffer()

    // Set cache headers for thumbnails
    const headers = new Headers()
    headers.set('Content-Type', 'image/jpeg')
    headers.set('Cache-Control', 'public, max-age=31536000, immutable') // Cache for 1 year
    headers.set('Content-Length', thumbnailBuffer.length.toString())

    return new NextResponse(thumbnailBuffer as unknown as BodyInit, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Error generating thumbnail:', error)
    return new NextResponse('Error generating thumbnail', { status: 500 })
  }
}
