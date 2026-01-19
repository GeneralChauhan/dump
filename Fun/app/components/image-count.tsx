'use client'

import { useState, useEffect } from 'react'

export function ImageCount() {
  const [count, setCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImageCount = async () => {
      try {
        const response = await fetch('/api/images')
        const data = await response.json()
        setCount(data.images?.length || 0)
      } catch (error) {
        console.error('Error fetching image count:', error)
        setCount(0)
      } finally {
        setLoading(false)
      }
    }

    fetchImageCount()
  }, [])

  if (loading) {
    return (
      <div className="text-sm text-neutral-500">
        <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="text-sm text-neutral-500">
      {count === 0 ? 'No backgrounds available' : 
       count === 1 ? '1 background available' : 
       `${count} backgrounds available`}
    </div>
  )
}
