export function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="text-5xl mb-4">{icon || '📋'}</div>
      <h3 className="font-display text-lg font-semibold text-warm-700 mb-2">{title}</h3>
      {description && <p className="text-sm text-warm-400 mb-6 max-w-xs">{description}</p>}
      {action}
    </div>
  )
}
