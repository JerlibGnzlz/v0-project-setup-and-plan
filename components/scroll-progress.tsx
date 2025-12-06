'use client'

import { useEffect, useState } from 'react'

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight
      const progress = (window.scrollY / totalHeight) * 100
      setScrollProgress(progress)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-1 bg-gray-200/30 pointer-events-none">
      <div
        className="h-full bg-gradient-to-r from-[#2C7DA0] via-[#52796F] to-[#8B4513] transition-all duration-150 ease-out shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}
