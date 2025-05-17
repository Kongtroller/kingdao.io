import { useState } from 'react'

export default function ImageWithFallback({ src, alt, ...props }) {
  const [error, setError] = useState(false)

  if (error) {
    return (
      <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-400">
        Failed to load image
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  )
} 