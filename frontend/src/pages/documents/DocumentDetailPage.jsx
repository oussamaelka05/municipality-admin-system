import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Trash2, Edit2, FileText, Calendar, CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { getDocument, deleteDocument, updateDocument } from '../../api/documents'
import { fmtDate, fmtMoney, STATUS_MAP, STATUS_KEYS, isExpired, ageGroupLabel, GENERAL_AGE_GROUPS, getTypeName } from '../../utils/helpers'
import { PageLoader } from '../../components/ui/Spinner'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { useLanguage } from '../../context/LanguageContext'

export default function DocumentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t, lang } = useLanguage()
  const [doc, setDoc]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [editStatus, setEditStatus] = useState(false)
  const [newStatus, setNewStatus]   = useState('')

  useEffect(() => {
    getDocument(id)
      .then(r => { setDoc(r.data.data); setNewStatus(r.data.data.status) })
      .catch(() => { toast.error('Document not found'); navigate('/documents') })
      .finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    setDeleting(false)
    try {
      await deleteDocument(id)
      toast.success(t('documents.deletedSuccess'))
      navigate('/documents')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleStatusUpdate = async () => {
    try {
      const r = await updateDocument(id, { status: newStatus })
      setDoc(r.data.data)
      setEditStatus(false)
      toast.success(t('documents.updateStatus'))
    } catch {
      toast.error('Failed to update status')
    }
  }

  if (loading) return <PageLoader />
  if (!doc)    return null

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <Link to="/documents" className="btn-ghost p-2 rounded-lg"><ArrowLeft size={18} /></Link>
        <div className="flex-1">
          <h1 className="page-title">{t('documents.title')}</h1>
          <p className="text-sm text-slate-500 font-mono">{doc.reference_number}</p>
        </div>
        <button onClick={() => setDeleting(true)} className="btn-danger">
          <Trash2 size={15} /> {t('common.delete')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          {/* Document type card */}
          <div className="card p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: (doc.document_type?.color || '#3b82f6') + '20' }}>
                <FileText size={22} style={{ color: doc.document_type?.color || '#3b82f6' }} />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-slate-800">{getTypeName(doc.document_type, lang)}</h2>
                <p className="text-sm text-slate-500 mt-0.5">
                  {doc.document_type?.description || t('documents.officialDoc')}
                </p>
                <p className="text-xs font-mono text-slate-400 mt-1">{t('common.code')}: {doc.document_type?.code}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={`badge text-sm px-3 py-1 ${STATUS_MAP[doc.status]?.cls || 'badge-gray'}`}>
                  {t(`status.${doc.status}`)}
                </span>
                {isExpired(doc.expiry_date) && (
                  <span className="badge badge-red text-sm px-3 py-1">{t('status.expired')}</span>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('common.date')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <InfoField icon={Calendar} label={t('documents.issueDate')}  value={fmtDate(doc.issue_date)} />
              <InfoField
                icon={Calendar}
                label={t('documents.expiryDate')}
                value={fmtDate(doc.expiry_date)}
                expired={isExpired(doc.expiry_date)}
                expiredLabel={t('status.expired')}
              />
              <InfoField icon={Calendar} label={t('documents.registered')}  value={fmtDate(doc.created_at)} />
            </div>
          </div>

          {/* Statistical fields table */}
          {(doc.gender || doc.declaration_type || doc.age_group || doc.birth_rank) && (
            <StatsTable doc={doc} t={t} />
          )}

          {doc.notes && (
            <div className="card p-5">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t('common.notes')}</h3>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{doc.notes}</p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Payment */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('common.payment')}</h3>
            <p className="text-3xl font-bold text-slate-800">{fmtMoney(doc.fee_paid)}</p>
            <p className="text-sm text-slate-500 mt-1">{t(`payment.${doc.payment_method}`) || doc.payment_method}</p>
          </div>

          {/* Status */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('common.status')}</h3>
              {!editStatus && (
                <button onClick={() => setEditStatus(true)} className="btn-ghost p-1.5 rounded-lg text-xs flex items-center gap-1">
                  <Edit2 size={12} /> {t('common.edit')}
                </button>
              )}
            </div>
            {editStatus ? (
              <div className="flex flex-col gap-2">
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)} className="input">
                  {STATUS_KEYS.map(k => (
                    <option key={k} value={k}>{t(`status.${k}`)}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <button onClick={() => setEditStatus(false)} className="btn-secondary flex-1 text-xs">{t('common.cancel')}</button>
                  <button onClick={handleStatusUpdate} className="btn-primary flex-1 text-xs">{t('common.save')}</button>
                </div>
              </div>
            ) : (
              <span className={`badge text-sm px-3 py-1 ${STATUS_MAP[doc.status]?.cls || 'badge-gray'}`}>
                {t(`status.${doc.status}`)}
              </span>
            )}
          </div>

          {/* Issued by */}
          <div className="card p-5">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t('documents.issuedBy')}</h3>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm">
                {doc.issued_by?.name?.[0]}
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">{doc.issued_by?.name}</p>
                <p className="text-xs text-slate-400">{doc.issued_by?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={deleting}
        onClose={() => setDeleting(false)}
        onConfirm={handleDelete}
        title={t('documents.deleteTitle')}
        message={t('documents.deleteMsg').replace('{ref}', doc.reference_number)}
        confirmLabel={t('confirm.delete')}
      />
    </div>
  )
}

function StatsTable({ doc, t }) {
  const category = doc.document_type?.category || 'other'
  const isBirth    = category === 'birth'
  const isDeath    = category === 'death'
  const isMarriage = category === 'marriage'
  const isDivorce  = category === 'divorce'

  const COLORS = {
    birth:    { border: 'border-blue-400',    bg: 'bg-blue-50',    title: 'text-blue-700',    header: 'bg-blue-50'    },
    death:    { border: 'border-red-400',     bg: 'bg-red-50',     title: 'text-red-700',     header: 'bg-red-50'     },
    marriage: { border: 'border-emerald-400', bg: 'bg-emerald-50', title: 'text-emerald-700', header: 'bg-emerald-50' },
    divorce:  { border: 'border-emerald-400', bg: 'bg-emerald-50', title: 'text-emerald-700', header: 'bg-emerald-50' },
    other:    { border: 'border-slate-300',   bg: 'bg-slate-50',   title: 'text-slate-600',   header: 'bg-slate-50'   },
  }
  const c = COLORS[category] || COLORS.other

  const sectionTitle =
    isBirth    ? t('fiche.naissances') :
    isDeath    ? t('fiche.deces')      :
    isMarriage ? t('fiche.mariages')   :
    isDivorce  ? t('fiche.divorces')   :
                 t('birthFields.beneficiary')

  const ageLabel =
    isBirth ? t('birthFields.motherAge') :
    isDeath ? t('birthFields.ageGroup')  :
              t('birthFields.applicantAge')

  const rows = [
    doc.gender         && { label: t('gender.label'),   value: t(`gender.${doc.gender}`) },
    doc.declaration_type && { label: t('declType.label'), value: t(`declType.${doc.declaration_type}`) },
    doc.age_group      && { label: ageLabel,             value: ageGroupLabel(doc.age_group, t) },
    doc.birth_rank     && { label: t('birthFields.birthRank'), value: doc.birth_rank >= 10 ? `10 ${t('fiche.andOver')}` : `#${doc.birth_rank}` },
  ].filter(Boolean)

  return (
    <div className={`rounded-2xl border-2 ${c.border} ${c.bg} overflow-hidden shadow-sm`}>
      <div className="px-4 py-3 border-b border-black/5">
        <h3 className={`text-xs font-bold uppercase tracking-wide ${c.title}`}>{sectionTitle}</h3>
      </div>
      <div className="bg-white">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-slate-50">
            {rows.map(({ label, value }) => (
              <tr key={label} className="hover:bg-slate-50">
                <td className="py-2.5 px-4 text-slate-400 font-medium w-1/2">{label}</td>
                <td className="py-2.5 px-4 text-slate-800 font-semibold">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function InfoField({ icon: Icon, label, value, expired = false, expiredLabel = 'Expired' }) {
  return (
    <div className="flex items-start gap-3">
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${expired ? 'bg-red-100' : 'bg-slate-100'}`}>
        <Icon size={13} className={expired ? 'text-red-500' : 'text-slate-500'} />
      </div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <div className="flex items-center gap-2">
          <p className={`text-sm font-medium ${expired ? 'text-red-600' : 'text-slate-800'}`}>{value}</p>
          {expired && <span className="badge badge-red text-[10px] px-1.5 py-0">{expiredLabel}</span>}
        </div>
      </div>
    </div>
  )
}
