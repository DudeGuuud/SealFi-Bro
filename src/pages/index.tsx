import { useState } from 'react'
import Head from 'next/head'
import dynamic from 'next/dynamic'

// Dynamically import components to avoid SSR issues
const WalletConnection = dynamic(() => import('@/components/WalletConnection'), { ssr: false })
const CanvasGame = dynamic(() => import('@/components/CanvasGame'), { ssr: false })

export default function Home() {
  const [score, setScore] = useState(0)
  const [isGameStarted, setIsGameStarted] = useState(false)

  return (
    <>
      <Head>
        <title>Surf On Sui - SealFi Bro&apos;s Adventure</title>
        <meta name="description" content="Help SealFi Bro surf the blockchain waves and collect SUI tokens!" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/avatar.png" />
      </Head>

      <main className="game-container">
        {/* Canvas Game Component */}
        <CanvasGame
          score={score}
          setScore={setScore}
          isGameStarted={isGameStarted}
          setIsGameStarted={setIsGameStarted}
        />

        {/* Wallet Connection */}
        <WalletConnection />

        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Animated background clouds */}
          <div className="absolute top-10 left-10 w-20 h-12 bg-white bg-opacity-30 rounded-full animate-float"></div>
          <div className="absolute top-20 right-20 w-16 h-8 bg-white bg-opacity-25 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-32 left-1/3 w-24 h-14 bg-white bg-opacity-20 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

          {/* Floating SUI logos */}
          <div className="absolute top-1/4 right-10 text-4xl animate-float" style={{ animationDelay: '0.5s' }}>🪙</div>
          <div className="absolute top-1/2 left-10 text-3xl animate-float" style={{ animationDelay: '1.5s' }}>🌊</div>
          <div className="absolute bottom-1/4 right-1/4 text-2xl animate-float" style={{ animationDelay: '2.5s' }}>🏄‍♂️</div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 z-10">
          <p className="text-white text-sm opacity-75 text-center">
            Built for Sui Overflow Hackathon 2025 |
            <span className="text-sui-300"> SealFi Bro</span> 🦭
          </p>
        </div>
      </main>
    </>
  )
}
