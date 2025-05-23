import { useState, useEffect, useCallback, useRef } from 'react'

interface SimpleGameProps {
  score: number
  setScore: (score: number) => void
  isGameStarted: boolean
  setIsGameStarted: (started: boolean) => void
}

interface Position {
  x: number
  y: number
}

interface Coin {
  id: number
  x: number
  y: number
  collected: boolean
}

export default function SimpleGame({ score, setScore, isGameStarted, setIsGameStarted }: SimpleGameProps) {
  const [playerPos, setPlayerPos] = useState<Position>({ x: 50, y: 70 })
  const [coins, setCoins] = useState<Coin[]>([])
  const [showInstructions, setShowInstructions] = useState(true)
  const gameAreaRef = useRef<HTMLDivElement>(null)
  const animationRef = useRef<number>()
  const keysRef = useRef<{ [key: string]: boolean }>({})

  // Game constants
  const PLAYER_SPEED = 2
  const COIN_SPAWN_RATE = 0.02
  const COIN_FALL_SPEED = 1

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Game loop
  const gameLoop = useCallback(() => {
    if (!isGameStarted) return

    // Update player position
    setPlayerPos(prev => {
      let newX = prev.x
      let newY = prev.y

      if (keysRef.current['a'] || keysRef.current['arrowleft']) {
        newX = Math.max(0, newX - PLAYER_SPEED)
      }
      if (keysRef.current['d'] || keysRef.current['arrowright']) {
        newX = Math.min(100, newX + PLAYER_SPEED)
      }
      if (keysRef.current['w'] || keysRef.current['arrowup']) {
        newY = Math.max(0, newY - PLAYER_SPEED)
      }
      if (keysRef.current['s'] || keysRef.current['arrowdown']) {
        newY = Math.min(100, newY + PLAYER_SPEED)
      }

      return { x: newX, y: newY }
    })

    // Spawn coins
    if (Math.random() < COIN_SPAWN_RATE) {
      setCoins(prev => [
        ...prev,
        {
          id: Date.now(),
          x: Math.random() * 90 + 5,
          y: -5,
          collected: false
        }
      ])
    }

    // Update coins
    setCoins(prev => prev.map(coin => ({
      ...coin,
      y: coin.y + COIN_FALL_SPEED
    })).filter(coin => coin.y < 105 && !coin.collected))

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [isGameStarted])

  // Start game loop
  useEffect(() => {
    if (isGameStarted) {
      animationRef.current = requestAnimationFrame(gameLoop)
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isGameStarted, gameLoop])

  // Check collisions
  useEffect(() => {
    coins.forEach(coin => {
      if (!coin.collected) {
        const distance = Math.sqrt(
          Math.pow(coin.x - playerPos.x, 2) + Math.pow(coin.y - playerPos.y, 2)
        )
        
        if (distance < 8) {
          setScore(score + 10)
          setCoins(prev => prev.map(c => 
            c.id === coin.id ? { ...c, collected: true } : c
          ))
        }
      }
    })
  }, [playerPos, coins, score, setScore])

  const startGame = () => {
    setIsGameStarted(true)
    setShowInstructions(false)
    setScore(0)
    setCoins([])
    setPlayerPos({ x: 50, y: 70 })
  }

  const restartGame = () => {
    setIsGameStarted(false)
    setShowInstructions(true)
    setScore(0)
    setCoins([])
    setPlayerPos({ x: 50, y: 70 })
  }

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Game Area */}
      <div 
        ref={gameAreaRef}
        className="relative w-full h-full bg-gradient-to-b from-sky-300 via-blue-400 to-blue-600"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)
          `
        }}
      >
        {/* Animated waves */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-blue-800 to-transparent opacity-60">
          <div className="absolute bottom-0 w-full h-16 bg-blue-700 opacity-80 animate-wave"></div>
        </div>

        {/* Player (SealFi Bro) */}
        <div
          className="absolute w-12 h-12 transition-all duration-100 ease-out z-10"
          style={{
            left: `${playerPos.x}%`,
            top: `${playerPos.y}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="relative">
            {/* Surfboard */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-4 bg-yellow-400 rounded-full shadow-lg"></div>
            {/* SealFi Bro */}
            <div className="w-12 h-12 bg-blue-500 rounded-full border-4 border-blue-600 shadow-lg flex items-center justify-center text-white text-xl animate-surf">
              🦭
            </div>
          </div>
        </div>

        {/* Coins */}
        {coins.map(coin => (
          <div
            key={coin.id}
            className={`absolute w-8 h-8 transition-all duration-200 ${coin.collected ? 'scale-150 opacity-0' : 'scale-100 opacity-100'}`}
            style={{
              left: `${coin.x}%`,
              top: `${coin.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="w-8 h-8 bg-yellow-400 rounded-full border-2 border-yellow-500 shadow-lg flex items-center justify-center text-yellow-800 font-bold animate-spin">
              🪙
            </div>
          </div>
        ))}

        {/* Score Display */}
        <div className="absolute top-4 left-4 z-20">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg font-bold text-xl">
            <div className="flex items-center gap-2">
              <span className="text-yellow-400">🪙</span>
              <span>SUI: {score}</span>
            </div>
          </div>
        </div>

        {/* Instructions/Start Screen */}
        {showInstructions && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
            <div className="bg-black bg-opacity-70 text-white p-8 rounded-lg max-w-md text-center">
              <h1 className="text-4xl font-bold mb-4 text-blue-400">🏄‍♂️ Surf On Sui</h1>
              <div className="mb-6">
                <div className="text-6xl mb-4 animate-float">🦭</div>
                <p className="text-lg mb-2">Help SealFi Bro collect SUI tokens!</p>
              </div>
              
              <div className="text-left mb-6 space-y-2">
                <p><span className="font-bold">🎮 Controls:</span></p>
                <p>• Use <kbd className="bg-gray-700 px-2 py-1 rounded">WASD</kbd> or arrow keys to move</p>
                <p>• Collect <span className="text-yellow-400">🪙 SUI tokens</span> for points</p>
                <p>• Surf the blockchain waves!</p>
              </div>

              <button
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg"
              >
                🚀 Start Surfing!
              </button>
            </div>
          </div>
        )}

        {/* Game Controls */}
        {isGameStarted && (
          <div className="absolute bottom-4 right-4 z-20">
            <button
              onClick={restartGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              🔄 Restart
            </button>
          </div>
        )}

        {/* Performance Tips */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs max-w-xs">
            <p className="text-blue-400 font-bold">💡 Pro Tips:</p>
            <p>• Move around to collect more coins</p>
            <p>• Each coin gives you 10 SUI points</p>
            <p>• Stay active for higher scores!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
