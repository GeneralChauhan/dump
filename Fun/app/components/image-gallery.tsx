'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface ImageItem {
  id: string
  name: string
  thumbnail: string
  fullSize: string
  alt: string
}

export function ImageGallery() {
  const [images, setImages] = useState<ImageItem[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<string | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/images')
        const data = await response.json()
        setImages(data.images || [])
      } catch (error) {
        console.error('Error fetching images:', error)
        setImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  const handleDownload = async (image: ImageItem) => {
    setDownloading(image.id)
    try {
      const response = await fetch(image.fullSize)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = `${image.name.toLowerCase().replace(/\s+/g, '-')}-background.jpg`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    } finally {
      setDownloading(null)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white border border-neutral-200 rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-video bg-neutral-200"></div>
            <div className="p-4">
              <div className="h-4 bg-neutral-200 rounded mb-2"></div>
              <div className="h-10 bg-neutral-200 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-12 h-12 text-neutral-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <h3 className="text-lg font-medium text-neutral-900 mb-2">No backgrounds found</h3>
        <p className="text-neutral-600">Add images to the <code className="bg-neutral-100 px-2 py-1 rounded text-sm">/public/meeting-backgrounds</code> directory to see them here.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {images.map((image) => (
        <div
          key={image.id}
          className="  rounded-lg overflow-hidden transition-shadow"
        >
          <div className="aspect-video relative bg-neutral-100">
            <Image
              src={image.thumbnail}
              alt={image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                const parent = target.parentElement
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full bg-gradient-to-br from-neutral-200 to-neutral-300 flex items-center justify-center">
                      <svg class="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  `
                }
              }}
            />
          </div>
          <div className="">
            <button
              onClick={() => handleDownload(image)}
              disabled={downloading === image.id}
              className="underline hover:text-blue-600 cursor-pointer"
            >
              {downloading === image.id ? (
                <>
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
