import Phaser from 'phaser'

export default class SuiCoin extends Phaser.Physics.Matter.Image {
  private floatTween?: Phaser.Tweens.Tween
  private glowEffect?: Phaser.GameObjects.Graphics
  private collected = false

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'coin')
    
    // Add to scene
    scene.add.existing(this)
    
    // Set appearance
    this.setDisplaySize(30, 30)
    this.setTint(0xFFD700) // Golden color for SUI coin
    
    // Set physics properties
    this.setCircle(15)
    this.setSensor(true) // Make it a sensor so it doesn't affect physics
    this.setFrictionAir(0.02)
    this.setIgnoreGravity(true)
    
    // Set collision category for coins
    this.setCollisionCategory(4)
    this.setCollidesWith([1]) // Only collide with player
    
    // Create glow effect
    this.createGlowEffect()
    
    // Add floating animation
    this.startFloatingAnimation()
    
    // Add rotation animation
    this.scene.tweens.add({
      targets: this,
      rotation: Math.PI * 2,
      duration: 3000,
      repeat: -1,
      ease: 'Linear'
    })
  }

  private createGlowEffect() {
    this.glowEffect = this.scene.add.graphics()
    this.glowEffect.fillStyle(0xFFD700, 0.3)
    this.glowEffect.fillCircle(this.x, this.y, 25)
    
    // Pulsing glow animation
    this.scene.tweens.add({
      targets: this.glowEffect,
      alpha: 0.1,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  private startFloatingAnimation() {
    this.floatTween = this.scene.tweens.add({
      targets: this,
      y: this.y - 10,
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    })
  }

  update() {
    if (this.glowEffect && !this.collected) {
      this.glowEffect.setPosition(this.x, this.y)
    }
  }

  collect() {
    if (this.collected) return
    
    this.collected = true
    
    // Stop animations
    if (this.floatTween) {
      this.floatTween.stop()
    }
    
    // Collection animation
    this.scene.tweens.add({
      targets: this,
      scaleX: 2,
      scaleY: 2,
      alpha: 0,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        this.destroy()
      }
    })
    
    // Glow effect animation
    if (this.glowEffect) {
      this.scene.tweens.add({
        targets: this.glowEffect,
        scaleX: 3,
        scaleY: 3,
        alpha: 0,
        duration: 300,
        ease: 'Power2',
        onComplete: () => {
          this.glowEffect?.destroy()
        }
      })
    }
    
    // Create collection particles
    const particles = this.scene.add.particles(this.x, this.y, 'coin', {
      speed: { min: 100, max: 200 },
      scale: { start: 0.5, end: 0 },
      lifespan: 500,
      quantity: 8,
      tint: 0xFFD700
    })
    
    this.scene.time.delayedCall(500, () => {
      particles.destroy()
    })
    
    // Play collection sound (if available)
    // this.scene.sound.play('coinCollect', { volume: 0.3 })
  }

  destroy() {
    if (this.glowEffect) {
      this.glowEffect.destroy()
    }
    if (this.floatTween) {
      this.floatTween.stop()
    }
    super.destroy()
  }
}
