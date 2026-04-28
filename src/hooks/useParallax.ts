'use client'

import { useState, useEffect } from 'react'

export const useParallax = () => {
  const [scrollY, setScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [viewportHeight, setViewportHeight] = useState(0)

  useEffect(() => {
    // Definir altura da viewport
    setViewportHeight(window.innerHeight)
    
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      setScrollY(currentScrollY)
      setIsScrolling(true)
      
      // Debounce para melhor performance
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    const handleResize = () => {
      setViewportHeight(window.innerHeight)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)
      clearTimeout(timeoutId)
    }
  }, [])

  // Calcula se chegou no limite da foto (80% da viewport)
  const photoLimit = viewportHeight * 0.8
  const hasReachedPhotoLimit = scrollY >= photoLimit

  return {
    scrollY,
    isScrolling,
    viewportHeight,
    hasReachedPhotoLimit,
    photoLimit
  }
}