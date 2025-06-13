export default function NftSkeleton() {
  return (
    <div className="border p-4 rounded-lg shadow-sm animate-pulse bg-white dark:bg-gray-800">
      <div className="w-full aspect-square bg-gray-200 dark:bg-gray-700 rounded mb-2" />
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    </div>
  )
} 