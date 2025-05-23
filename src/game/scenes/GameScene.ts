import Phaser from 'phaser'
import Player from '../objects/Player'
import SuiCoin from '../objects/SuiCoin'
import WaveManager from '../physics/WaveManager'
import { GameCallbacks } from '../SurfGame'

export default class GameScene extends Phaser.Scene {
  private player!: Player
  private waveManager!: WaveManager
  private suiCoins!: Phaser.GameObjects.Group
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasdKeys!: any
  private score = 0
  private gameStarted = false
  private callbacks!: GameCallbacks
  private coinSpawnTimer = 0
  private backgroundMusic?: Phaser.Sound.BaseSound

  constructor() {
    super({ key: 'GameScene' })
  }

  init(data: { callbacks: GameCallbacks }) {
    this.callbacks = data.callbacks
  }

  preload() {
    // Create simple colored rectangles for game objects
    this.load.image('player', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    this.load.image('surfboard', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    this.load.image('coin', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
    this.load.image('wave', 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==')
  }

  create() {
    // Set world bounds
    this.matter.world.setBounds(0, 0, this.scale.width, this.scale.height)

    // Create wave manager
    this.waveManager = new WaveManager(this)

    // Create player
    this.player = new Player(this, this.scale.width / 2, this.scale.height / 2)

    // Create coin group
    this.suiCoins = this.add.group({
      classType: SuiCoin,
      runChildUpdate: true
    })

    // Setup input
    this.cursors = this.input.keyboard!.createCursorKeys()
    this.wasdKeys = this.input.keyboard!.addKeys('W,S,A,D')

    // Setup collision detection
    this.matter.world.on('collisionstart', this.handleCollision, this)

    // Create initial waves
    this.waveManager.createInitialWaves()
  }

  update(time: number, delta: number) {
    if (!this.gameStarted) return

    // Update player
    this.player.update(this.cursors, this.wasdKeys)

    // Update wave manager
    this.waveManager.update(time, delta)

    // Spawn coins periodically
    this.coinSpawnTimer += delta
    if (this.coinSpawnTimer > 2000) { // Spawn every 2 seconds
      this.spawnSuiCoin()
      this.coinSpawnTimer = 0
    }

    // Check if player fell off screen
    if (this.player.y > this.scale.height + 100) {
      this.gameOver()
    }

    // Update camera to follow player
    this.cameras.main.centerOn(this.player.x, this.player.y - 100)
  }

  private handleCollision(event: any) {
    const pairs = event.pairs

    for (let i = 0; i < pairs.length; i++) {
      const bodyA = pairs[i].bodyA
      const bodyB = pairs[i].bodyB

      // Check coin collection
      if ((bodyA.gameObject instanceof SuiCoin && bodyB.gameObject === this.player) ||
          (bodyB.gameObject instanceof SuiCoin && bodyA.gameObject === this.player)) {

        const coin = bodyA.gameObject instanceof SuiCoin ? bodyA.gameObject : bodyB.gameObject
        this.collectCoin(coin)
      }
    }
  }

  private collectCoin(coin: SuiCoin) {
    coin.collect()
    this.score += 10
    this.callbacks.onScoreUpdate(this.score)

    // Add visual feedback
    const scoreText = this.add.text(coin.x, coin.y, '+10', {
      fontSize: '24px',
      color: '#FFD700'
    })

    this.tweens.add({
      targets: scoreText,
      y: coin.y - 50,
      alpha: 0,
      duration: 1000,
      onComplete: () => scoreText.destroy()
    })
  }

  private spawnSuiCoin() {
    const x = Phaser.Math.Between(100, this.scale.width - 100)
    const y = Phaser.Math.Between(50, this.scale.height / 2)

    const coin = new SuiCoin(this, x, y)
    this.suiCoins.add(coin)
  }

  startGame() {
    this.gameStarted = true
    this.callbacks.onGameStart()
  }

  restartGame() {
    this.score = 0
    this.gameStarted = false
    this.callbacks.onScoreUpdate(this.score)

    // Reset player position
    this.player.setPosition(this.scale.width / 2, this.scale.height / 2)
    this.player.setVelocity(0, 0)

    // Clear all coins
    this.suiCoins.clear(true, true)

    // Reset waves
    this.waveManager.reset()

    // Reset camera
    this.cameras.main.centerOn(this.scale.width / 2, this.scale.height / 2)
  }

  private gameOver() {
    this.gameStarted = false
    this.callbacks.onGameOver()
  }

  resize(width: number, height: number) {
    this.scale.resize(width, height)
    this.matter.world.setBounds(0, 0, width, height)
  }
}
