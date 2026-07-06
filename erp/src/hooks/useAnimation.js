import { useEffect, useRef, useState } from 'react'

export function useInView(options = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          if (!options.repeat) observer.unobserve(el)
        } else if (options.repeat) {
          setInView(false)
        }
      },
      { threshold: options.threshold || 0.1, ...options }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, inView]
}

export function useStaggerAnimation(count, options = {}) {
  const { baseDelay = 0, staggerDelay = 50 } = options
  return Array.from({ length: count }, (_, i) => ({
    animationDelay: `${baseDelay + i * staggerDelay}ms`,
  }))
}
