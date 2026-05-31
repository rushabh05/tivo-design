import { X } from 'lucide-react'
import { useEffect } from 'react'

export function Modal({ isOpen, onClose, title, children, size = 'default' }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    default: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-full mx-4',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className={`relative w-full ${sizes[size]} bg-white rounded-t-3xl sm:rounded-2xl shadow-elevated animate-fade-up max-h-[92vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-warm-100 flex-shrink-0">
          <h2 className="font-display text-lg font-semibold text-warm-800">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-warm-100 transition-colors text-warm-500">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-5">
          {children}
        </div>
      </div>
    </div>
  )
}
