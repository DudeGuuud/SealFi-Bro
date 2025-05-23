# Surf On Sui - SealFi Bro's Web3 Adventure 🏄‍♂️

![SealFi Bro Image](/Surfing_SealFi_Bro.png)  
*"Sui to the Moon! 🚀"*

## 🎮 Game Overview

**Surf On Sui** is an exciting Web3 surfing game featuring SealFi Bro, the degen surf king of the Sui blockchain! Help our beloved seal navigate through blockchain waves, collect SUI tokens, and experience the thrill of decentralized surfing.

### 🌟 Features
- **Realistic Physics**: Powered by Phaser.js and Matter.js for smooth, realistic surfing mechanics
- **Web3 Integration**: Built with the latest @mysten/dapp-kit for seamless wallet connectivity
- **Stunning Visuals**: Beautiful wave animations and particle effects
- **Responsive Design**: Optimized for all screen sizes and devices
- **Sui Blockchain Theme**: Collect SUI tokens and experience blockchain-inspired gameplay

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Start the development server**
   ```bash
   pnpm dev
   ```

3. **Open your browser**
   Navigate to `http://localhost:3000` and start surfing!

## 🎯 How to Play

### Controls
- **A/D Keys**: Move left and right
- **W Key**: Jump/Boost
- **Mouse**: Navigate UI elements

### Objective
- Surf the blockchain waves as SealFi Bro
- Collect golden SUI tokens for points
- Perform tricks and combos for bonus scores
- Stay on the waves and avoid falling off the screen!

### Tips
- Perfect landings give extra points
- Chain multiple tricks for score multipliers
- Use wave momentum for higher jumps
- Collect tokens while maintaining your surfing flow

## 🛠️ Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS with custom animations
- **Game Engine**: Phaser.js 3.88 with Matter.js physics
- **Web3**: @mysten/dapp-kit (latest), @mysten/sui
- **State Management**: React Query (@tanstack/react-query)
- **Deployment**: Vercel-ready configuration

## 🌊 Game Architecture

### Core Components
- **SurfGame**: Main game controller and Phaser configuration
- **GameScene**: Primary game scene with physics and gameplay logic
- **Player**: SealFi Bro character with surfboard physics
- **WaveManager**: Dynamic wave generation and physics
- **SuiCoin**: Collectible tokens with animations
- **WalletConnection**: Sui wallet integration component

### Physics System
- Matter.js integration for realistic surfing physics
- Dynamic wave generation with sine wave mathematics
- Collision detection for token collection
- Momentum-based movement system

## 🔗 Web3 Integration

The game is built with future blockchain functionality in mind:

- **Wallet Connection**: Seamless integration with Sui wallets
- **Account Display**: Shows connected wallet address
- **Extensible Architecture**: Ready for smart contract integration
- **Token Mechanics**: Designed for future on-chain token rewards

## 📱 Deployment

### Vercel Deployment
```bash
# Build for production
pnpm build

# Deploy to Vercel
vercel --prod
```

### Environment Setup
No environment variables required for basic functionality. The game connects to Sui devnet by default.

## 🏆 Sui Overflow Hackathon 2025

This project was created for the **Sui Overflow Hackathon** with the theme of aquatic animals. SealFi Bro perfectly embodies the aquatic theme while showcasing the potential of Sui blockchain gaming.

---
*"One Coin to Rule Them All, and in the Blockchain Bind Them!"* - SealFi Bro 🦭
