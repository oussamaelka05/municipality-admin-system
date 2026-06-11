import { useEffect } from 'react'
import { Trash2, AlertTriangle } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  danger = true,
  confirmLabel,
}) {
  const { t } = useLanguage()

  useEffect(() => {
    if (!open) return
    const handle = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open, onClose])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  const Icon     = danger ? Trash2 : AlertTriangle
  const iconBg   = danger ? 'bg-red-50'    : 'bg-amber-50'
  const iconRing = danger ? 'ring-red-100'  : 'ring-amber-100'
  const iconClr  = danger ? 'text-red-500'  : 'text-amber-500'
  const btnCls   = danger ? 'btn-danger'    : 'btn-primary'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-enter">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 flex flex-col items-center text-center gap-6 dialog-enter">

        {/* Icon bubble */}
        <div className={`w-20 h-20 ${iconBg} ring-8 ${iconRing} rounded-full flex items-center justify-center shrink-0`}>
          <Icon size={34} className={iconClr} strokeWidth={1.8} />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-800">{title}</h2>
          <p className="text-sm text-slate-500 leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            className="btn-secondary flex-1 justify-center py-2.5"
          >
            {t('confirm.cancel')}
          </button>
          <button
            onClick={onConfirm}
            className={`${btnCls} flex-1 justify-center py-2.5`}
          >
            {confirmLabel || t('confirm.confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
