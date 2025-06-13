export default function LoanPlaceholder() {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
        Coming Soon: NFT-Backed Loans
      </h3>
      <p className="text-yellow-700 dark:text-yellow-300">
        Soon you'll be able to use your Kong NFTs as collateral to borrow ETH. Stay tuned for updates!
      </p>
      <div className="mt-4 text-sm text-yellow-600 dark:text-yellow-400">
        Features will include:
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Instant liquidity against your Kong NFTs</li>
          <li>Competitive interest rates</li>
          <li>Flexible loan terms</li>
          <li>No credit checks required</li>
        </ul>
      </div>
    </div>
  )
} 