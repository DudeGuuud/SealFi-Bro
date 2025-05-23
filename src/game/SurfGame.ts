import Phaser from 'phaser'
import GameScene from './scenes/GameScene'

export interface GameCallbacks {
  onScoreUpdate: (score: number) => void
  onGameOver: () => void
  onGameStart: () => void
}

export default class SurfGame {
  private game: Phaser.Game | null = null
  private callbacks: GameCallbacks

  constructor(callbacks: GameCallbacks) {
    this.callbacks = callbacks
  }

  init(containerId: string) {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: window.innerWidth,
      height: window.innerHeight,
      parent: containerId,
      backgroundColor: '#87CEEB',
      physics: {
        default: 'matter',
        matter: {
          gravity: { x: 0, y: 0.8 },
          debug: false,
          enableSleeping: false,
        }
      },
      scene: [GameScene],
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      render: {
        antialias: true,
        pixelArt: false,
      }
    }

    this.game = new Phaser.Game(config)

    // Pass callbacks to the scene
    this.game.scene.start('GameScene', { callbacks: this.callbacks })

    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this))
  }

  private handleResize() {
    if (this.game) {
      this.game.scale.resize(window.innerWidth, window.innerHeight)
    }
  }

  startGame() {
    if (this.game) {
      const scene = this.game.scene.getScene('GameScene') as GameScene
      scene?.startGame()
    }
  }

  restartGame() {
    if (this.game) {
      const scene = this.game.scene.getScene('GameScene') as GameScene
      scene?.restartGame()
    }
  }

  destroy() {
    window.removeEventListener('resize', this.handleResize.bind(this))
    if (this.game) {
      this.game.destroy(true)
      this.game = null
    }
  }

  getGame(): Phaser.Game | null {
    return this.game
  }
}
