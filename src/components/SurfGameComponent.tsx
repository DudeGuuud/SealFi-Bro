import { useEffect, useRef } from 'react'
import SurfGame, { GameCallbacks } from '@/game/SurfGame'

interface SurfGameComponentProps {
  onScoreUpdate: (score: number) => void
  onGameOver: () => void
  onGameStart: () => void
  onGameLoaded: () => void
}

export default function SurfGameComponent({
  onScoreUpdate,
  onGameOver,
  onGameStart,
  onGameLoaded
}: SurfGameComponentProps) {
  const gameRef = useRef<SurfGame | null>(null)
  const gameContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && gameContainerRef.current && !gameRef.current) {
      const callbacks: GameCallbacks = {
        onScoreUpdate,
        onGameOver,
        onGameStart
      }

      gameRef.current = new SurfGame(callbacks)
      gameRef.current.init('game-container')
      onGameLoaded()
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy()
        gameRef.current = null
      }
    }
  }, [onScoreUpdate, onGameOver, onGameStart, onGameLoaded])

  // Expose game methods to parent component
  useEffect(() => {
    if (gameRef.current) {
      // Store game reference globally for UI components to access
      (window as any).surfGame = gameRef.current
    }
  }, [gameRef.current])

  return (
    <div 
      id="game-container" 
      ref={gameContainerRef}
      className="w-full h-full"
    />
  )
}
