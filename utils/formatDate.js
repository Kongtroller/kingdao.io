export function formatDate(timestamp) {
  const date = new Date(timestamp)
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
