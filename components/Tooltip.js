export function Tooltip({ children }) {
  return (
    <div className="absolute z-10 w-64 bg-white border shadow-lg rounded-lg -top-2 left-full ml-2">
      {children}
      <div className="absolute -left-2 top-4 w-0 h-0 border-t-8 border-r-8 border-b-8 border-transparent border-r-white" />
    </div>
  )
} 