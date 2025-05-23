import Phaser from 'phaser'

interface WavePoint {
  x: number
  y: number
  velocity: number
  amplitude: number
}

export default class WaveManager {
  private scene: Phaser.Scene
  private waves: Phaser.Physics.Matter.Image[] = []
  private wavePoints: WavePoint[] = []
  private waveGraphics!: Phaser.GameObjects.Graphics
  private time = 0
  private waveSpeed = 0.02
  private waveHeight = 50
  private waveLength = 100

  constructor(scene: Phaser.Scene) {
    this.scene = scene
    this.createWaveGraphics()
    this.initializeWavePoints()
  }

  private createWaveGraphics() {
    this.waveGraphics = this.scene.add.graphics()
    this.waveGraphics.setDepth(-1) // Behind other objects
  }

  private initializeWavePoints() {
    const numPoints = Math.ceil(this.scene.scale.width / 20) + 2

    for (let i = 0; i < numPoints; i++) {
      this.wavePoints.push({
        x: i * 20,
        y: this.scene.scale.height * 0.7,
        velocity: 0,
        amplitude: this.waveHeight
      })
    }
  }

  createInitialWaves() {
    // Create invisible physics bodies for wave collision
    const waveY = this.scene.scale.height * 0.7
    const numWaves = Math.ceil(this.scene.scale.width / this.waveLength)

    for (let i = 0; i < numWaves; i++) {
      const x = i * this.waveLength + this.waveLength / 2
      const wave = this.scene.matter.add.rectangle(x, waveY, this.waveLength, 20, {
        isStatic: true,
        isSensor: false
      }) as any

      // Set collision category for waves
      wave.setCollisionCategory(2)
      wave.setCollidesWith([1]) // Collide with player

      this.waves.push(wave)
    }
  }

  update(time: number, delta: number) {
    this.time += delta * this.waveSpeed

    // Update wave points with sine wave motion
    for (let i = 0; i < this.wavePoints.length; i++) {
      const point = this.wavePoints[i]
      const waveOffset = (point.x / this.waveLength) * Math.PI * 2
      point.y = this.scene.scale.height * 0.7 + Math.sin(this.time + waveOffset) * point.amplitude

      // Add some randomness for more natural waves
      point.y += Math.sin(this.time * 0.5 + waveOffset * 0.3) * (point.amplitude * 0.3)
    }

    // Update physics bodies to match wave motion
    this.updateWavePhysics()

    // Redraw wave graphics
    this.drawWaves()
  }

  private updateWavePhysics() {
    for (let i = 0; i < this.waves.length; i++) {
      const wave = this.waves[i]
      const waveIndex = Math.floor(i * (this.wavePoints.length / this.waves.length))

      if (this.wavePoints[waveIndex]) {
        const targetY = this.wavePoints[waveIndex].y
        wave.setPosition(wave.x, targetY)

        // Calculate wave slope for realistic surfing physics
        const nextIndex = Math.min(waveIndex + 1, this.wavePoints.length - 1)
        const slope = (this.wavePoints[nextIndex].y - this.wavePoints[waveIndex].y) / 20
        wave.setRotation(Math.atan(slope))
      }
    }
  }

  private drawWaves() {
    this.waveGraphics.clear()

    // Draw the main wave surface
    this.waveGraphics.fillStyle(0x0EA5E9, 0.8) // Ocean blue
    this.waveGraphics.beginPath()

    // Start from bottom left
    this.waveGraphics.moveTo(0, this.scene.scale.height)

    // Draw to first wave point
    this.waveGraphics.lineTo(this.wavePoints[0].x, this.wavePoints[0].y)

    // Draw smooth curve through all wave points
    for (let i = 1; i < this.wavePoints.length - 1; i++) {
      const current = this.wavePoints[i]
      const next = this.wavePoints[i + 1]
      const controlX = current.x + (next.x - current.x) / 2
      const controlY = current.y

      this.waveGraphics.lineTo(next.x, next.y)
    }

    // Complete the shape
    this.waveGraphics.lineTo(this.scene.scale.width, this.scene.scale.height)
    this.waveGraphics.lineTo(0, this.scene.scale.height)
    this.waveGraphics.closePath()
    this.waveGraphics.fillPath()

    // Add wave foam/highlights
    this.drawWaveFoam()
  }

  private drawWaveFoam() {
    this.waveGraphics.lineStyle(3, 0xFFFFFF, 0.6)
    this.waveGraphics.beginPath()

    // Draw foam line along wave peaks
    for (let i = 0; i < this.wavePoints.length - 1; i++) {
      const current = this.wavePoints[i]
      const next = this.wavePoints[i + 1]

      if (i === 0) {
        this.waveGraphics.moveTo(current.x, current.y - 2)
      }

      const controlX = current.x + (next.x - current.x) / 2
      const controlY = current.y - 2
      this.waveGraphics.lineTo(next.x, next.y - 2)
    }

    this.waveGraphics.strokePath()

    // Add some foam particles for extra effect
    if (Math.random() < 0.1) {
      this.createFoamParticle()
    }
  }

  private createFoamParticle() {
    const randomPoint = Phaser.Math.Between(0, this.wavePoints.length - 1)
    const point = this.wavePoints[randomPoint]

    const particle = this.scene.add.circle(point.x, point.y - 5, 2, 0xFFFFFF, 0.8)

    this.scene.tweens.add({
      targets: particle,
      y: point.y - 20,
      alpha: 0,
      duration: 1000,
      ease: 'Power2',
      onComplete: () => particle.destroy()
    })
  }

  reset() {
    this.time = 0

    // Reset wave points to initial positions
    for (let i = 0; i < this.wavePoints.length; i++) {
      this.wavePoints[i].y = this.scene.scale.height * 0.7
    }

    // Clear and recreate waves
    this.waves.forEach(wave => wave.destroy())
    this.waves = []
    this.createInitialWaves()
  }

  destroy() {
    this.waves.forEach(wave => wave.destroy())
    this.waveGraphics.destroy()
  }
}
