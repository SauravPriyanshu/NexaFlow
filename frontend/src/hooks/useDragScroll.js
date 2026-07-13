import { useEffect, useRef } from 'react'

export function useDragScroll(boardRef) {
  const animFrameRef = useRef(null)
  const isDraggingRef = useRef(false)
  const speedRef = useRef(0)

  useEffect(() => {
    const EDGE_SIZE = 120      // px from edge where scroll activates
    const MAX_SPEED = 18       // max px per frame

    function getScrollSpeed(mouseX) {
      const board = boardRef.current
      if (!board) return 0
      const rect = board.getBoundingClientRect()
      const distFromLeft = mouseX - rect.left
      const distFromRight = rect.right - mouseX

      if (distFromLeft < EDGE_SIZE) {
        // near left edge → scroll left (negative)
        const ratio = 1 - Math.max(0, distFromLeft) / EDGE_SIZE
        return -Math.min(MAX_SPEED, MAX_SPEED * ratio * ratio)
      }
      if (distFromRight < EDGE_SIZE) {
        // near right edge → scroll right (positive)
        const ratio = 1 - Math.max(0, distFromRight) / EDGE_SIZE
        return Math.min(MAX_SPEED, MAX_SPEED * ratio * ratio)
      }
      return 0
    }

    function onMouseMove(e) {
      if (!isDraggingRef.current) return
      speedRef.current = getScrollSpeed(e.clientX)
    }

    window.addEventListener('mousemove', onMouseMove)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [boardRef])

  const tick = () => {
    if (isDraggingRef.current && Math.abs(speedRef.current) > 0.5 && boardRef.current) {
      boardRef.current.scrollLeft += speedRef.current
    }
    if (isDraggingRef.current) {
      animFrameRef.current = requestAnimationFrame(tick)
    }
  }

  return {
    onDragStart: () => { 
      isDraggingRef.current = true
      speedRef.current = 0
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      animFrameRef.current = requestAnimationFrame(tick)
    },
    onDragEnd: () => { 
      isDraggingRef.current = false
      speedRef.current = 0
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
      }
    },
  }
}
