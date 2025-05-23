import { useEffect, useRef, useState, useCallback } from 'react'

interface CanvasGameProps {
  score: number
  setScore: React.Dispatch<React.SetStateAction<number>>
  isGameStarted: boolean
  setIsGameStarted: (started: boolean) => void
}

interface GameObject {
  x: number
  y: number
  vx: number
  vy: number
  width: number
  height: number
}

interface Player extends GameObject {
  onGround: boolean
  surfboardAngle: number
}

interface Coin extends GameObject {
  collected: boolean
  id: number
  rotation: number
}

interface Shark extends GameObject {
  id: number
  direction: number
  attackCooldown: number
  jumpCooldown: number
  isJumping: boolean
}

interface Wave {
  points: { x: number; y: number }[]
  time: number
}

export default function CanvasGame({ score, setScore, isGameStarted, setIsGameStarted }: CanvasGameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number>()
  const keysRef = useRef<{ [key: string]: boolean }>({})
  const [showInstructions, setShowInstructions] = useState(true)

  // Game state
  const playerRef = useRef<Player>({
    x: 400,
    y: 300,
    vx: 0,
    vy: 0,
    width: 40,
    height: 40,
    onGround: false,
    surfboardAngle: 0
  })

  const coinsRef = useRef<Coin[]>([])
  const sharksRef = useRef<Shark[]>([])
  const waveRef = useRef<Wave>({
    points: [],
    time: 0
  })

  const gameStateRef = useRef({
    lastCoinSpawn: 0,
    lastSharkSpawn: 0,
    cameraX: 0,
    cameraY: 0
  })

  // Load images
  const avatarImageRef = useRef<HTMLImageElement | null>(null)
  const suiLogoRef = useRef<HTMLImageElement | null>(null)

  useEffect(() => {
    // Load avatar image
    const avatarImg = new Image()
    avatarImg.src = '/avatar.png'
    avatarImg.onload = () => {
      avatarImageRef.current = avatarImg
    }

    // Load SUI logo
    const suiImg = new Image()
    suiImg.src = '/sui-logo.svg'
    suiImg.onload = () => {
      suiLogoRef.current = suiImg
    }
  }, [])

  // Game constants
  const GRAVITY = 0.5
  const PLAYER_SPEED = 8
  const JUMP_POWER = 15
  const WAVE_HEIGHT = 100
  const WAVE_FREQUENCY = 0.02
  const COIN_SPAWN_INTERVAL = 1500
  const SHARK_SPAWN_INTERVAL = 5000
  const COIN_SIZE = 40
  const SHARK_SPEED = 3

  // Initialize wave points
  const initializeWave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const points = []
    const numPoints = Math.ceil(canvas.width / 20) + 10
    const baseY = canvas.height * 0.7

    for (let i = 0; i < numPoints; i++) {
      points.push({
        x: i * 20,
        y: baseY
      })
    }

    waveRef.current.points = points
  }, [])

  // Update wave animation
  const updateWave = useCallback((deltaTime: number) => {
    waveRef.current.time += deltaTime * 0.001

    waveRef.current.points.forEach((point, i) => {
      const baseY = canvasRef.current!.height * 0.7
      const waveOffset = (point.x * WAVE_FREQUENCY) + waveRef.current.time
      point.y = baseY + Math.sin(waveOffset) * WAVE_HEIGHT * 0.3 +
                Math.sin(waveOffset * 0.5) * WAVE_HEIGHT * 0.2
    })
  }, [])

  // Get wave height at specific x position
  const getWaveHeight = useCallback((x: number): number => {
    const points = waveRef.current.points
    if (points.length < 2) return canvasRef.current!.height * 0.7

    // Find the two points that bracket this x position
    for (let i = 0; i < points.length - 1; i++) {
      if (x >= points[i].x && x <= points[i + 1].x) {
        // Linear interpolation between the two points
        const t = (x - points[i].x) / (points[i + 1].x - points[i].x)
        return points[i].y + t * (points[i + 1].y - points[i].y)
      }
    }

    return canvasRef.current!.height * 0.7
  }, [])

  // Update player physics
  const updatePlayer = useCallback((deltaTime: number) => {
    const player = playerRef.current
    const canvas = canvasRef.current!

    // Handle input
    if (keysRef.current['a'] || keysRef.current['arrowleft']) {
      player.vx = Math.max(player.vx - 0.5, -PLAYER_SPEED)
    }
    if (keysRef.current['d'] || keysRef.current['arrowright']) {
      player.vx = Math.min(player.vx + 0.5, PLAYER_SPEED)
    }
    if ((keysRef.current['w'] || keysRef.current['arrowup'] || keysRef.current[' ']) && player.onGround) {
      player.vy = -JUMP_POWER
      player.onGround = false
    }

    // Apply gravity
    player.vy += GRAVITY

    // Apply friction when on ground
    if (player.onGround) {
      player.vx *= 0.9
    } else {
      player.vx *= 0.99 // Air resistance
    }

    // Update position
    player.x += player.vx
    player.y += player.vy

    // Check wave collision
    const waveHeight = getWaveHeight(player.x + player.width / 2)
    if (player.y + player.height >= waveHeight && player.vy >= 0) {
      player.y = waveHeight - player.height
      player.vy = 0
      player.onGround = true

      // Calculate surfboard angle based on wave slope
      const leftHeight = getWaveHeight(player.x)
      const rightHeight = getWaveHeight(player.x + player.width)
      player.surfboardAngle = Math.atan2(rightHeight - leftHeight, player.width) * 0.5
    } else {
      player.onGround = false
    }

    // Keep player in bounds horizontally
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x))

    // Game over if player falls too far
    if (player.y > canvas.height + 100) {
      setIsGameStarted(false)
      setShowInstructions(true)
    }
  }, [getWaveHeight, setIsGameStarted])

  // Spawn coins
  const spawnCoin = useCallback(() => {
    const canvas = canvasRef.current!
    const now = Date.now()

    if (now - gameStateRef.current.lastCoinSpawn > COIN_SPAWN_INTERVAL) {
      const x = Math.random() * (canvas.width - COIN_SIZE) + COIN_SIZE / 2
      // Lower the coin spawn position - spawn in the lower 60% of screen
      const y = Math.random() * (canvas.height * 0.6) + canvas.height * 0.3

      coinsRef.current.push({
        x,
        y,
        vx: 0,
        vy: 0,
        width: COIN_SIZE,
        height: COIN_SIZE,
        collected: false,
        id: now,
        rotation: 0
      })

      gameStateRef.current.lastCoinSpawn = now
    }
  }, [])

  // Spawn sharks
  const spawnShark = useCallback(() => {
    const canvas = canvasRef.current!
    const now = Date.now()

    if (now - gameStateRef.current.lastSharkSpawn > SHARK_SPAWN_INTERVAL) {
      const side = Math.random() > 0.5 ? 1 : -1
      const x = side > 0 ? -60 : canvas.width + 60
      const y = canvas.height * 0.6 + Math.random() * (canvas.height * 0.3)

      sharksRef.current.push({
        x,
        y,
        vx: side * SHARK_SPEED,
        vy: 0,
        width: 80,
        height: 40,
        id: now,
        direction: side,
        attackCooldown: 0,
        jumpCooldown: 0,
        isJumping: false
      })

      gameStateRef.current.lastSharkSpawn = now
    }
  }, [])

  // Update coins
  const updateCoins = useCallback((deltaTime: number) => {
    coinsRef.current = coinsRef.current.filter(coin => {
      if (coin.collected) return false

      // Animate opacity for blinking effect (no rotation)
      coin.rotation += deltaTime * 0.003 // Slower animation for opacity

      // Check collision with player (improved collision detection)
      const player = playerRef.current
      const dx = coin.x + coin.width / 2 - (player.x + player.width / 2)
      const dy = coin.y + coin.height / 2 - (player.y + player.height / 2)
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < (coin.width / 2 + player.width / 2) * 0.8) {
        coin.collected = true
        setScore(prev => prev + 10)
        return false
      }

      return true
    })
  }, [setScore])

  // Update sharks
  const updateSharks = useCallback((deltaTime: number) => {
    const canvas = canvasRef.current!
    const player = playerRef.current

    sharksRef.current = sharksRef.current.filter(shark => {
      // Update jump cooldown
      shark.jumpCooldown -= deltaTime

      // Check if shark should jump (when close to player)
      const distanceToPlayer = Math.abs(shark.x - player.x)
      if (distanceToPlayer < 200 && shark.jumpCooldown <= 0 && !shark.isJumping) {
        shark.vy = -12 // Jump power
        shark.isJumping = true
        shark.jumpCooldown = 3000 // 3 second cooldown
      }

      // Apply gravity to jumping sharks
      if (shark.isJumping) {
        shark.vy += GRAVITY * 0.8 // Slightly less gravity for sharks
        shark.y += shark.vy

        // Check if shark landed
        const waveHeight = getWaveHeight(shark.x + shark.width / 2)
        if (shark.y + shark.height >= waveHeight && shark.vy >= 0) {
          shark.y = waveHeight - shark.height
          shark.vy = 0
          shark.isJumping = false
        }
      }

      // Move shark horizontally
      shark.x += shark.vx

      // Check collision with player (improved detection)
      const dx = shark.x + shark.width / 2 - (player.x + player.width / 2)
      const dy = shark.y + shark.height / 2 - (player.y + player.height / 2)
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance < (shark.width / 2 + player.width / 2) * 0.6) {
        // Player hit by shark - game over
        setIsGameStarted(false)
        setShowInstructions(true)
        return false
      }

      // Remove sharks that are off screen
      if (shark.x < -150 || shark.x > canvas.width + 150) {
        return false
      }

      return true
    })
  }, [setIsGameStarted, getWaveHeight])

  // Render game
  const render = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    // Clear canvas with gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
    gradient.addColorStop(0, '#87CEEB')
    gradient.addColorStop(0.7, '#4682B4')
    gradient.addColorStop(1, '#191970')
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)'
    ctx.beginPath()
    ctx.arc(100, 80, 30, 0, Math.PI * 2)
    ctx.arc(130, 80, 40, 0, Math.PI * 2)
    ctx.arc(160, 80, 30, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(canvas.width - 150, 120, 25, 0, Math.PI * 2)
    ctx.arc(canvas.width - 120, 120, 35, 0, Math.PI * 2)
    ctx.arc(canvas.width - 90, 120, 25, 0, Math.PI * 2)
    ctx.fill()

    // Draw waves
    const points = waveRef.current.points
    if (points.length > 1) {
      // Wave body
      const waveGradient = ctx.createLinearGradient(0, points[0].y, 0, canvas.height)
      waveGradient.addColorStop(0, '#20B2AA')
      waveGradient.addColorStop(1, '#008B8B')
      ctx.fillStyle = waveGradient

      ctx.beginPath()
      ctx.moveTo(0, canvas.height)
      ctx.lineTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }

      ctx.lineTo(canvas.width, canvas.height)
      ctx.closePath()
      ctx.fill()

      // Wave foam
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)'
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(points[0].x, points[0].y)

      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y)
      }

      ctx.stroke()
    }

    // Draw coins (SUI tokens)
    coinsRef.current.forEach(coin => {
      ctx.save()
      ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2)

      // Calculate blinking opacity (0.6 to 1.0)
      const opacity = 0.6 + 0.4 * (Math.sin(coin.rotation) + 1) / 2

      // Coin glow
      ctx.shadowColor = '#4DA2FF'
      ctx.shadowBlur = 15

      if (suiLogoRef.current) {
        // Set opacity for blinking effect
        ctx.globalAlpha = opacity

        // Draw SUI logo maintaining aspect ratio
        const logoAspectRatio = suiLogoRef.current.width / suiLogoRef.current.height
        let drawWidth = coin.width
        let drawHeight = coin.height

        // Maintain aspect ratio - adjust to fit within coin bounds
        if (logoAspectRatio > 1) {
          // Logo is wider than tall
          drawHeight = drawWidth / logoAspectRatio
        } else {
          // Logo is taller than wide
          drawWidth = drawHeight * logoAspectRatio
        }

        ctx.drawImage(
          suiLogoRef.current,
          -drawWidth / 2,
          -drawHeight / 2,
          drawWidth,
          drawHeight
        )
      } else {
        // Fallback: Draw SUI logo-inspired design with blinking
        ctx.globalAlpha = opacity
        const radius = coin.width / 2

        // Main circle (blue)
        ctx.fillStyle = '#4DA2FF'
        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, Math.PI * 2)
        ctx.fill()

        // Inner design (white)
        ctx.shadowBlur = 0
        ctx.fillStyle = 'white'
        ctx.beginPath()
        ctx.arc(-radius * 0.3, -radius * 0.2, radius * 0.25, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(radius * 0.3, -radius * 0.2, radius * 0.25, 0, Math.PI * 2)
        ctx.fill()

        ctx.beginPath()
        ctx.arc(0, radius * 0.3, radius * 0.3, 0, Math.PI * 2)
        ctx.fill()

        // Border
        ctx.strokeStyle = '#2E5BFF'
        ctx.lineWidth = 3
        ctx.beginPath()
        ctx.arc(0, 0, radius, 0, Math.PI * 2)
        ctx.stroke()
      }

      ctx.restore()
    })

    // Draw sharks
    sharksRef.current.forEach(shark => {
      ctx.save()
      ctx.translate(shark.x + shark.width / 2, shark.y + shark.height / 2)

      // Flip shark based on direction
      if (shark.direction < 0) {
        ctx.scale(-1, 1)
      }

      // Shark body (pixel style)
      ctx.fillStyle = '#708090'
      ctx.fillRect(-40, -15, 70, 25)

      // Shark head (triangular)
      ctx.fillStyle = '#696969'
      ctx.beginPath()
      ctx.moveTo(30, 0)
      ctx.lineTo(40, -8)
      ctx.lineTo(40, 8)
      ctx.closePath()
      ctx.fill()

      // Shark fin
      ctx.fillStyle = '#556B2F'
      ctx.beginPath()
      ctx.moveTo(-10, -15)
      ctx.lineTo(0, -25)
      ctx.lineTo(10, -15)
      ctx.closePath()
      ctx.fill()

      // Shark tail
      ctx.fillStyle = '#708090'
      ctx.beginPath()
      ctx.moveTo(-40, 0)
      ctx.lineTo(-55, -10)
      ctx.lineTo(-50, 0)
      ctx.lineTo(-55, 10)
      ctx.closePath()
      ctx.fill()

      // Shark eye
      ctx.fillStyle = 'red'
      ctx.beginPath()
      ctx.arc(15, -5, 3, 0, Math.PI * 2)
      ctx.fill()

      // Shark teeth
      ctx.fillStyle = 'white'
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(25 + i * 3, 3)
        ctx.lineTo(26 + i * 3, 8)
        ctx.lineTo(27 + i * 3, 3)
        ctx.closePath()
        ctx.fill()
      }

      ctx.restore()
    })

    // Draw player (SealFi Bro using avatar.png)
    const player = playerRef.current
    ctx.save()
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2)

    // Surfboard
    ctx.save()
    ctx.rotate(player.surfboardAngle)
    ctx.fillStyle = '#FFD700'
    ctx.fillRect(-30, 15, 60, 8)
    ctx.strokeStyle = '#FFA500'
    ctx.lineWidth = 2
    ctx.strokeRect(-30, 15, 60, 8)

    // Surfboard pattern
    ctx.fillStyle = '#FF6347'
    ctx.fillRect(-25, 16, 10, 6)
    ctx.fillRect(-5, 16, 10, 6)
    ctx.fillRect(15, 16, 10, 6)
    ctx.restore()

    // Draw SealFi Bro avatar
    if (avatarImageRef.current) {
      // Draw avatar image
      ctx.drawImage(
        avatarImageRef.current,
        -player.width / 2,
        -player.height / 2,
        player.width,
        player.height
      )
    } else {
      // Fallback: Simple seal shape
      ctx.fillStyle = '#4682B4'
      ctx.beginPath()
      ctx.arc(0, 0, player.width / 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.strokeStyle = '#191970'
      ctx.lineWidth = 3
      ctx.stroke()

      // Simple eyes
      ctx.fillStyle = 'white'
      ctx.beginPath()
      ctx.arc(-8, -8, 4, 0, Math.PI * 2)
      ctx.arc(8, -8, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = 'black'
      ctx.beginPath()
      ctx.arc(-8, -8, 2, 0, Math.PI * 2)
      ctx.arc(8, -8, 2, 0, Math.PI * 2)
      ctx.fill()
    }

    ctx.restore()
  }, [])

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (!isGameStarted) return

    const deltaTime = 16 // Assume 60fps

    updateWave(deltaTime)
    updatePlayer(deltaTime)
    spawnCoin()
    spawnShark()
    updateCoins(deltaTime)
    updateSharks(deltaTime)
    render()

    animationRef.current = requestAnimationFrame(gameLoop)
  }, [isGameStarted, updateWave, updatePlayer, spawnCoin, spawnShark, updateCoins, updateSharks, render])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true
      e.preventDefault()
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false
      e.preventDefault()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Handle canvas resize
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initializeWave()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
    }
  }, [initializeWave])

  // Start/stop game loop
  useEffect(() => {
    if (isGameStarted) {
      initializeWave()
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
  }, [isGameStarted, gameLoop, initializeWave])

  const startGame = () => {
    setIsGameStarted(true)
    setShowInstructions(false)
    setScore(0)
    coinsRef.current = []
    sharksRef.current = []

    // Reset player
    const canvas = canvasRef.current!
    playerRef.current = {
      x: canvas.width / 2 - 20,
      y: canvas.height / 2,
      vx: 0,
      vy: 0,
      width: 40,
      height: 40,
      onGround: false,
      surfboardAngle: 0
    }

    gameStateRef.current = {
      lastCoinSpawn: 0,
      lastSharkSpawn: 0,
      cameraX: 0,
      cameraY: 0
    }
  }

  const restartGame = () => {
    setIsGameStarted(false)
    setShowInstructions(true)
    setScore(0)
  }

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ background: 'linear-gradient(to bottom, #87CEEB, #4682B4)' }}
      />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Score */}
        <div className="absolute top-4 left-4 pointer-events-auto">
          <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg font-bold text-xl">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
              <span>SUI: {score}</span>
            </div>
          </div>
        </div>

        {/* Instructions */}
        {showInstructions && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center pointer-events-auto">
            <div className="bg-black bg-opacity-70 text-white p-8 rounded-lg max-w-md text-center">
              <h1 className="text-4xl font-bold mb-4 text-blue-400">Surf On Sui</h1>
              <div className="mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-lg overflow-hidden">
                  <img
                    src="/avatar.png"
                    alt="SealFi Bro"
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-lg mb-2">Help SealFi Bro surf the blockchain waves!</p>
              </div>

              <div className="text-left mb-6 space-y-2">
                <p><span className="font-bold">Controls:</span></p>
                <p>• Use <kbd className="bg-gray-700 px-2 py-1 rounded">A/D</kbd> or arrow keys to move</p>
                <p>• Use <kbd className="bg-gray-700 px-2 py-1 rounded">W</kbd> or <kbd className="bg-gray-700 px-2 py-1 rounded">Space</kbd> to jump</p>
                <p>• Collect <span className="text-blue-400">SUI tokens</span> for points</p>
                <p>• Avoid the sharks!</p>
                <p>• Surf the waves and stay alive!</p>
              </div>

              <button
                onClick={startGame}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-xl transition-colors duration-200 shadow-lg"
              >
                Start Surfing!
              </button>
            </div>
          </div>
        )}

        {/* Game Controls */}
        {isGameStarted && (
          <div className="absolute bottom-4 right-4 pointer-events-auto">
            <button
              onClick={restartGame}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
            >
              🔄 Restart
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
