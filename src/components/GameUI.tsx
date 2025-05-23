import { useState, useEffect } from 'react'

interface GameUIProps {
  score: number
  isGameStarted: boolean
  onStartGame: () => void
  onRestartGame: () => void
}

export default function GameUI({ score, isGameStarted }: GameUIProps) {
  const [showInstructions, setShowInstructions] = useState(!isGameStarted)

  useEffect(() => {
    setShowInstructions(!isGameStarted)
  }, [isGameStarted])

  const handleStartGame = () => {
    const game = (window as any).surfGame
    if (game) {
      game.startGame()
    }
  }

  const handleRestartGame = () => {
    const game = (window as any).surfGame
    if (game) {
      game.restartGame()
    }
  }

  return (
    <div className="ui-overlay">
      {/* Score Display */}
      <div className="absolute top-4 left-4 z-20">
        <div className="score-display">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400">🪙</span>
            <span>SUI: {score}</span>
          </div>
        </div>
      </div>

      {/* Game Instructions / Start Screen */}
      {showInstructions && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30">
          <div className="game-instructions text-center">
            <h1 className="text-4xl font-bold mb-4 text-sui-400">🏄‍♂️ Surf On Sui</h1>
            <div className="mb-6">
              <img
                src="/avatar.png"
                alt="SealFi Bro"
                className="w-24 h-24 mx-auto mb-4 animate-float"
              />
              <p className="text-lg mb-2">Help SealFi Bro surf the blockchain waves!</p>
            </div>

            <div className="text-left mb-6 space-y-2">
              <p><span className="font-bold">🎮 Controls:</span></p>
              <p>• Use <kbd className="bg-gray-700 px-2 py-1 rounded">A</kbd> and <kbd className="bg-gray-700 px-2 py-1 rounded">D</kbd> to move left/right</p>
              <p>• Use <kbd className="bg-gray-700 px-2 py-1 rounded">W</kbd> to jump</p>
              <p>• Collect <span className="text-yellow-400">🪙 SUI tokens</span> for points</p>
              <p>• Ride the waves and avoid falling!</p>
            </div>

            <button
              onClick={handleStartGame}
              className="wallet-button text-xl px-8 py-3 glow"
            >
              🚀 Start Surfing!
            </button>
          </div>
        </div>
      )}

      {/* Game Over Screen */}
      {isGameStarted && score > 0 && (
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={handleRestartGame}
            className="wallet-button"
          >
            🔄 Restart
          </button>
        </div>
      )}

      {/* Performance Tips */}
      <div className="absolute bottom-4 left-4 z-20">
        <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-xs max-w-xs">
          <p className="text-sui-400 font-bold">💡 Pro Tips:</p>
          <p>• Stay on the waves for bonus points</p>
          <p>• Perfect landings give extra SUI</p>
          <p>• Chain combos for multipliers!</p>
        </div>
      </div>
    </div>
  )
}
