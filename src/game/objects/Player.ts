import Phaser from 'phaser'

export default class Player extends Phaser.Physics.Matter.Image {
  private surfboard!: Phaser.Physics.Matter.Image
  private isOnWave = false
  private jumpPower = 15
  private movementSpeed = 8
  private airControl = 0.3
  private lastDirection = 1 // 1 for right, -1 for left

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene.matter.world, x, y, 'player')

    // Add to scene
    scene.add.existing(this)

    // Create player body (SealFi Bro)
    this.setDisplaySize(40, 40)
    this.setTint(0x4A90E2) // Blue seal color

    // Create surfboard
    this.surfboard = scene.matter.add.image(x, y + 25, 'surfboard')
    this.surfboard.setDisplaySize(60, 15)
    this.surfboard.setTint(0xFFD700) // Golden surfboard

    // Set physics properties
    this.setFrictionAir(0.01)
    this.setBounce(0.3)
    this.setMass(1)

    this.surfboard.setFrictionAir(0.02)
    this.surfboard.setBounce(0.2)
    this.surfboard.setMass(0.5)

    // Create constraint to connect player to surfboard
    scene.matter.add.constraint(this.body as MatterJS.BodyType, this.surfboard.body as MatterJS.BodyType, 30, 0.8)

    // Set collision categories
    this.setCollisionCategory(1)
    this.setCollidesWith([2, 4]) // Collide with waves and coins

    this.surfboard.setCollisionCategory(1)
    this.surfboard.setCollidesWith([2]) // Only collide with waves
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys, wasdKeys: any) {
    const isGrounded = this.isOnWave

    // Horizontal movement
    if (cursors.left.isDown || wasdKeys.A.isDown) {
      if (isGrounded) {
        this.setVelocityX(-this.movementSpeed)
      } else {
        this.setVelocityX(this.body!.velocity.x - this.airControl * 0.1)
      }
      this.lastDirection = -1
      this.setFlipX(true)
    } else if (cursors.right.isDown || wasdKeys.D.isDown) {
      if (isGrounded) {
        this.setVelocityX(this.movementSpeed)
      } else {
        this.setVelocityX(this.body!.velocity.x + this.airControl * 0.1)
      }
      this.lastDirection = 1
      this.setFlipX(false)
    } else if (isGrounded) {
      // Apply friction when on ground
      this.setVelocityX(this.body!.velocity.x * 0.8)
    }

    // Jumping
    if ((cursors.up.isDown || wasdKeys.W.isDown) && isGrounded) {
      this.setVelocityY(-this.jumpPower)
      this.isOnWave = false

      // Add some style to the jump
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.2,
        scaleY: 0.8,
        duration: 100,
        yoyo: true,
        ease: 'Power2'
      })
    }

    // Rotation for style (slight tilt based on movement)
    const targetRotation = this.body!.velocity.x * 0.02
    this.setRotation(this.rotation + (targetRotation - this.rotation) * 0.1)

    // Surfboard follows with slight delay and rotation
    const boardTargetRotation = this.body!.velocity.x * 0.03
    this.surfboard.setRotation(this.surfboard.rotation + (boardTargetRotation - this.surfboard.rotation) * 0.08)

    // Add floating animation when on waves
    if (this.isOnWave) {
      const time = this.scene.time.now * 0.003
      const floatOffset = Math.sin(time) * 2
      this.y += floatOffset * 0.1
    }

    // Limit maximum velocity
    const maxVelocity = 20
    if (Math.abs(this.body!.velocity.x) > maxVelocity) {
      this.setVelocityX(Math.sign(this.body!.velocity.x) * maxVelocity)
    }
    if (Math.abs(this.body!.velocity.y) > maxVelocity) {
      this.setVelocityY(Math.sign(this.body!.velocity.y) * maxVelocity)
    }
  }

  setOnWave(onWave: boolean) {
    this.isOnWave = onWave
  }

  performTrick() {
    // Add a spinning trick animation
    this.scene.tweens.add({
      targets: this,
      rotation: this.rotation + Math.PI * 2,
      duration: 500,
      ease: 'Power2'
    })

    // Add particle effect
    const particles = this.scene.add.particles(this.x, this.y, 'coin', {
      speed: { min: 50, max: 100 },
      scale: { start: 0.3, end: 0 },
      lifespan: 300,
      quantity: 5
    })

    this.scene.time.delayedCall(300, () => {
      particles.destroy()
    })
  }

  destroy() {
    if (this.surfboard) {
      this.surfboard.destroy()
    }
    super.destroy()
  }
}
