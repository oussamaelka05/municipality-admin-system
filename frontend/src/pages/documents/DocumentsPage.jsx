import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Plus, FileText, Eye, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getDocuments, deleteDocument, getDocumentTypes } from '../../api/documents'
import { fmtDate, fmtMoney, STATUS_MAP, STATUS_KEYS, isExpired, getTypeName } from '../../utils/helpers'
import Pagination from '../../components/ui/Pagination'
import { PageLoader } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import IssueDocumentModal from './IssueDocumentModal'
import { useLanguage } from '../../context/LanguageContext'

export default function DocumentsPage() {
  const [data, setData]         = useState(null)
  const [types, setTypes]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [params, setParams]     = useState({ page: 1, per_page: 15, document_type_id: '', status: '', date_from: '', date_to: '' })
  const [showIssue, setShowIssue]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { t, lang } = useLanguage()

  const load = useCallback(() => {
    setLoading(true)
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== ''))
    getDocuments(clean)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [params])

  useEffect(() => { load() }, [load])
  useEffect(() => { getDocumentTypes().then(r => setTypes(r.data.data)) }, [])

  const setParam = (key, val) => setParams(p => ({ ...p, [key]: val, page: 1 }))
  const clearFilters = () => setParams({ page: 1, per_page: 15, document_type_id: '', status: '', date_from: '', date_to: '' })
  const hasFilters = params.document_type_id || params.status || params.date_from || params.date_to

  const handleDelete = async () => {
    try {
      await deleteDocument(deleteTarget.id)
      toast.success(t('documents.deletedSuccess'))
      setDeleteTarget(null)
      load()
    } catch {
      toast.error('Failed to delete document')
    }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('documents.title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data?.total ? `${data.total} ${t('documents.totalRecords')}` : t('documents.manageDocuments')}
          </p>
        </div>
        <button onClick={() => setShowIssue(true)} className="btn-primary">
          <Plus size={16} /> {t('documents.issueDocument')}
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3 items-center">
        <select value={params.document_type_id} onChange={e => setParam('document_type_id', e.target.value)} className="input w-auto min-w-[180px]">
          <option value="">{t('documents.allTypes')}</option>
          {types.map(tp => <option key={tp.id} value={tp.id}>{getTypeName(tp, lang)}</option>)}
        </select>
        <select value={params.status} onChange={e => setParam('status', e.target.value)} className="input w-auto min-w-[140px]">
          <option value="">{t('documents.allStatuses')}</option>
          {STATUS_KEYS.map(k => <option key={k} value={k}>{t(`status.${k}`)}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="date" value={params.date_from} onChange={e => setParam('date_from', e.target.value)} className="input w-auto" />
          <span className="text-slate-400 text-sm">{t('common.to')}</span>
          <input type="date" value={params.date_to} onChange={e => setParam('date_to', e.target.value)} className="input w-auto" />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="btn-ghost">
            <X size={15} /> {t('common.clear')}
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : !data?.data?.length ? (
          <EmptyState
            message={t('documents.noDocuments')}
            action={
              <button onClick={() => setShowIssue(true)} className="btn-primary mt-2">
                <Plus size={14} /> {t('documents.issueFirst')}
              </button>
            }
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-th">{t('documents.reference')}</th>
                    <th className="table-th">{t('documents.documentType')}</th>
                    <th className="table-th">{t('documents.issueDate')}</th>
                    <th className="table-th">{t('common.fee')}</th>
                    <th className="table-th">{t('common.payment')}</th>
                    <th className="table-th">{t('common.status')}</th>
                    <th className="table-th"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.data.map(doc => (
                    <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                      <td className="table-td">
                        <span className="font-mono text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">
                          {doc.reference_number}
                        </span>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: doc.document_type?.color }} />
                          <span className="font-medium">{getTypeName(doc.document_type, lang)}</span>
                        </div>
                      </td>
                      <td className="table-td text-slate-500">{fmtDate(doc.issue_date)}</td>
                      <td className="table-td font-medium">{fmtMoney(doc.fee_paid)}</td>
                      <td className="table-td text-slate-500">{t(`payment.${doc.payment_method}`) || doc.payment_method}</td>
                      <td className="table-td">
                        <div className="flex flex-col gap-1">
                          <span className={`badge ${STATUS_MAP[doc.status]?.cls || 'badge-gray'}`}>
                            {t(`status.${doc.status}`)}
                          </span>
                          {isExpired(doc.expiry_date) && (
                            <span className="badge badge-red">{t('status.expired')}</span>
                          )}
                        </div>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <Link to={`/documents/${doc.id}`} className="btn-ghost p-1.5 rounded-lg" title={t('common.edit')}>
                            <Eye size={15} />
                          </Link>
                          <button
                            onClick={() => setDeleteTarget(doc)}
                            className="btn-ghost p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                            title={t('common.delete')}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={data} onPageChange={p => setParams(prev => ({ ...prev, page: p }))} />
          </>
        )}
      </div>

      <IssueDocumentModal
        open={showIssue}
        onClose={() => setShowIssue(false)}
        onSuccess={() => { setShowIssue(false); load() }}
        types={types}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('documents.deleteTitle')}
        message={t('documents.deleteMsg').replace('{ref}', deleteTarget?.reference_number)}
        confirmLabel={t('confirm.delete')}
      />
    </div>
  )
}
