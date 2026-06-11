import { ChevronLeft, ChevronRight } from 'lucide-react'
import { paginationRange } from '../../utils/helpers'
import { useLanguage } from '../../context/LanguageContext'

export default function Pagination({ meta, onPageChange }) {
  const { t } = useLanguage()
  if (!meta || meta.last_page <= 1) return null
  const { current_page, last_page, from, to, total } = meta
  const pages = paginationRange(current_page, last_page)

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
      <span className="text-xs text-slate-500">
        {t('common.showing')} {from}–{to} {t('common.of')} {total} {t('common.results')}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(current_page - 1)}
          disabled={current_page === 1}
          className="btn-ghost p-1.5 rounded-lg disabled:opacity-40"
        >
          <ChevronLeft size={16} />
        </button>
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={i} className="px-2 text-slate-400 text-sm">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 rounded-lg text-sm font-medium transition-all
                ${p === current_page ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(current_page + 1)}
          disabled={current_page === last_page}
          className="btn-ghost p-1.5 rounded-lg disabled:opacity-40"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
