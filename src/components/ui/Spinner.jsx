export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8', xl: 'w-12 h-12' }
  return (
    <div className={`${sizes[size]} ${className} animate-spin rounded-full border-2 border-warm-200 border-t-teal-500`} />
  )
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-cream-100 flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-teal-500 flex items-center justify-center shadow-card">
        <span className="text-white font-display font-bold text-2xl">T</span>
      </div>
      <Spinner size="lg" />
    </div>
  )
}
