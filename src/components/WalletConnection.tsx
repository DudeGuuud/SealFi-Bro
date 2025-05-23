import { ConnectButton, useCurrentAccount } from '@mysten/dapp-kit'

export default function WalletConnection() {
  const currentAccount = useCurrentAccount()

  return (
    <div className="absolute top-4 right-4 z-20 ui-element">
      <div className="flex items-center gap-4">
        {currentAccount && (
          <div className="bg-black bg-opacity-50 text-white px-3 py-2 rounded-lg text-sm">
            <div className="text-xs opacity-75">Connected:</div>
            <div className="font-mono">
              {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
            </div>
          </div>
        )}
        <ConnectButton />
      </div>
    </div>
  )
}
