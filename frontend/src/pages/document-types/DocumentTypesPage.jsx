import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, FileText, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { getDocumentTypes, deleteDocumentType, updateDocumentType } from '../../api/documents'
import { fmtMoney, fmtNum, getTypeName } from '../../utils/helpers'
import { PageLoader } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import DocumentTypeModal from './DocumentTypeModal'
import { useLanguage } from '../../context/LanguageContext'

export default function DocumentTypesPage() {
  const [types, setTypes]     = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState({ open: false, type: null })
  const [delTarget, setDelTarget] = useState(null)
  const { t, lang } = useLanguage()

  const load = () => {
    setLoading(true)
    getDocumentTypes()
      .then(r => setTypes(r.data.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async () => {
    try {
      await deleteDocumentType(delTarget.id)
      toast.success('Document type deleted')
      setDelTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  const toggleActive = async (type) => {
    try {
      await updateDocumentType(type.id, { is_active: !type.is_active })
      toast.success(`Type ${type.is_active ? 'deactivated' : 'activated'}`)
      load()
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('docTypes.title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('docTypes.subtitle')}</p>
        </div>
        <button onClick={() => setModal({ open: true, type: null })} className="btn-primary">
          <Plus size={16} /> {t('docTypes.newType')}
        </button>
      </div>

      {loading ? <PageLoader /> : types.length === 0 ? (
        <EmptyState message={t('docTypes.noTypes')} action={
          <button onClick={() => setModal({ open: true, type: null })} className="btn-primary mt-2">
            <Plus size={14} /> {t('docTypes.addFirst')}
          </button>
        } />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {types.map(type => (
            <div key={type.id} className={`card p-5 flex flex-col gap-4 transition-opacity ${!type.is_active ? 'opacity-60' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: type.color + '20' }}>
                  <FileText size={20} style={{ color: type.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{getTypeName(type, lang)}</h3>
                    {!type.is_active && <span className="badge badge-gray text-[10px]">{t('common.inactive')}</span>}
                  </div>
                  {lang === 'ar'
                    ? (type.name_fr && <p className="text-xs text-slate-400">{type.name_fr}</p>)
                    : (type.name_ar && <p className="text-xs text-slate-400" dir="rtl">{type.name_ar}</p>)
                  }
                </div>
                <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded shrink-0">{type.code}</span>
              </div>

              {type.description && (
                <p className="text-xs text-slate-500 leading-relaxed">{type.description}</p>
              )}

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100">
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800">{fmtNum(type.documents_count)}</p>
                  <p className="text-[10px] text-slate-400">{t('docTypes.issued')}</p>
                </div>
                <div className="text-center border-x border-slate-100">
                  <p className="text-sm font-bold text-slate-800">{fmtMoney(type.fee)}</p>
                  <p className="text-[10px] text-slate-400">{t('common.fee')}</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-slate-800">{type.processing_days}</p>
                  <p className="text-[10px] text-slate-400">{t('common.days')}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button onClick={() => setModal({ open: true, type })} className="btn-secondary flex-1 justify-center text-xs py-1.5">
                  <Edit2 size={13} /> {t('common.edit')}
                </button>
                <button onClick={() => toggleActive(type)} className="btn-ghost px-2.5" title={type.is_active ? t('common.inactive') : t('common.active')}>
                  {type.is_active
                    ? <ToggleRight size={20} className="text-emerald-500" />
                    : <ToggleLeft size={20} className="text-slate-400" />}
                </button>
                <button onClick={() => setDelTarget(type)} className="btn-ghost px-2.5 text-red-500 hover:bg-red-50">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <DocumentTypeModal
        open={modal.open}
        type={modal.type}
        onClose={() => setModal({ open: false, type: null })}
        onSuccess={() => { setModal({ open: false, type: null }); load() }}
      />

      <ConfirmDialog
        open={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        title={t('docTypes.deleteTitle')}
        message={t('docTypes.deleteMsg').replace('{name}', delTarget?.name)}
        confirmLabel={t('confirm.delete')}
      />
    </div>
  )
}
