import { useForm } from 'react-hook-form'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { createDocument } from '../../api/documents'
import { useLanguage } from '../../context/LanguageContext'
import { MOTHER_AGE_GROUPS, DEATH_AGE_GROUPS, BIRTH_RANKS, DECL_TYPES, GENERAL_AGE_GROUPS, getTypeName } from '../../utils/helpers'

export default function IssueDocumentModal({ open, onClose, onSuccess, types }) {
  const [loading, setLoading] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const { t, lang } = useLanguage()

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm({
    defaultValues: {
      status: 'issued',
      payment_method: 'cash',
      issue_date: new Date().toISOString().slice(0, 10),
      fee_paid: 0,
    },
  })

  const selectedTypeId  = watch('document_type_id')
  const selectedType    = types.find(tp => String(tp.id) === String(selectedTypeId))
  const category        = selectedType?.category || 'other'
  const isBirth         = category === 'birth'
  const isDeath         = category === 'death'
  const isMarriage      = category === 'marriage'
  const isDivorce       = category === 'divorce'
  const isOther         = category === 'other'
  const hasDeclType     = isBirth || isDeath || isMarriage || isDivorce
  const showStats       = !!selectedTypeId

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await createDocument(data)
      toast.success(t('documents.issuedSuccess'))
      reset()
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to issue document')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (isDirty) setConfirmClose(true)
    else { reset(); onClose() }
  }

  const confirmDiscard = () => { setConfirmClose(false); reset(); onClose() }

  return (
    <>
      <Modal open={open} onClose={handleClose} title={t('documents.issueNew')} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

          {/* Document Type */}
          <div>
            <label className="label">{t('documents.documentType')} *</label>
            <select
              {...register('document_type_id', { required: 'Please select a document type' })}
              className={`input ${errors.document_type_id ? 'border-red-400' : ''}`}
            >
              <option value="">{t('documents.selectType')}</option>
              {types.filter(tp => tp.is_active).map(tp => (
                <option key={tp.id} value={tp.id}>{getTypeName(tp, lang)}</option>
              ))}
            </select>
            {errors.document_type_id && <p className="text-xs text-red-500 mt-1">{errors.document_type_id.message}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('documents.issueDate')} *</label>
              <input type="date" {...register('issue_date', { required: 'Required' })}
                className={`input ${errors.issue_date ? 'border-red-400' : ''}`} />
              {errors.issue_date && <p className="text-xs text-red-500 mt-1">{errors.issue_date.message}</p>}
            </div>
            <div>
              <label className="label">{t('documents.expiryDate')}</label>
              <input type="date" {...register('expiry_date')} className="input" />
            </div>
          </div>

          {/* ── Stats fields — shown for every document type once selected ── */}
          {showStats && (
            <div className={`rounded-xl border p-4 flex flex-col gap-3 ${
              isBirth || isDeath   ? 'border-blue-100 bg-blue-50/40' :
              isMarriage || isDivorce ? 'border-emerald-100 bg-emerald-50/40' :
              'border-slate-200 bg-slate-50/60'
            }`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${
                isBirth || isDeath      ? 'text-blue-700' :
                isMarriage || isDivorce ? 'text-emerald-700' :
                'text-slate-500'
              }`}>
                {isBirth     ? t('fiche.naissances')
                : isDeath    ? t('fiche.deces')
                : isMarriage ? t('fiche.mariages')
                : isDivorce  ? t('fiche.divorces')
                :              t('birthFields.beneficiary')}
              </p>

              {/* Row 1: Gender + Declaration type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">{t('gender.label')}</label>
                  <select {...register('gender')} className="input">
                    <option value="">—</option>
                    <option value="masculin">{t('gender.masculin')}</option>
                    <option value="feminin">{t('gender.feminin')}</option>
                  </select>
                </div>

                {/* Declaration type — all civil registry types */}
                {hasDeclType && (
                  <div>
                    <label className="label">{t('declType.label')}</label>
                    <select {...register('declaration_type')} className="input">
                      <option value="">—</option>
                      {DECL_TYPES.map(k => (
                        <option key={k} value={k}>{t(`declType.${k}`)}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Applicant age group — other types */}
                {isOther && (
                  <div>
                    <label className="label">{t('birthFields.applicantAge')}</label>
                    <select {...register('age_group')} className="input">
                      <option value="">—</option>
                      {GENERAL_AGE_GROUPS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Birth: mother age + birth rank */}
              {isBirth && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">{t('birthFields.motherAge')}</label>
                    <select {...register('age_group')} className="input">
                      <option value="">—</option>
                      {MOTHER_AGE_GROUPS.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">{t('birthFields.birthRank')}</label>
                    <select {...register('birth_rank')} className="input">
                      <option value="">—</option>
                      {BIRTH_RANKS.map(r => (
                        <option key={r} value={r}>{r === 10 ? `10 ${t('fiche.andOver')}` : r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Death: deceased age group */}
              {isDeath && (
                <div>
                  <label className="label">{t('birthFields.ageGroup')}</label>
                  <select {...register('age_group')} className="input">
                    <option value="">—</option>
                    {DEATH_AGE_GROUPS.map(g => (
                      <option key={g} value={g}>
                        {g === 'mort-ne' ? t('fiche.mortNe') : g === 'moins-1' ? t('fiche.moinsUn') : g}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Marriage / Divorce: party age group */}
              {(isMarriage || isDivorce) && (
                <div>
                  <label className="label">{t('birthFields.applicantAge')}</label>
                  <select {...register('age_group')} className="input">
                    <option value="">—</option>
                    {GENERAL_AGE_GROUPS.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Fee & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('documents.feePaid')}</label>
              <input type="number" step="0.01" min="0" {...register('fee_paid')} className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="label">{t('documents.paymentMethod')}</label>
              <select {...register('payment_method')} className="input">
                <option value="cash">{t('payment.cash')}</option>
                <option value="card">{t('payment.card')}</option>
                <option value="online">{t('payment.online')}</option>
                <option value="exempt">{t('payment.exempt')}</option>
              </select>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="label">{t('common.status')}</label>
            <select {...register('status')} className="input">
              <option value="issued">{t('status.issued')}</option>
              <option value="processing">{t('status.processing')}</option>
              <option value="pending">{t('status.pending')}</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="label">{t('common.notes')}</label>
            <textarea {...register('notes')} rows={2} className="input resize-none" placeholder={t('documents.optionalNotes')} />
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={handleClose} className="btn-secondary">{t('common.cancel')}</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading && <Loader2 size={16} className="animate-spin" />}
              {loading ? t('documents.issuing') : t('documents.issueDocument')}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        onConfirm={confirmDiscard}
        title={t('confirm.discardTitle')}
        message={t('confirm.discardMsg')}
        danger={false}
        confirmLabel={t('confirm.discard')}
      />
    </>
  )
}
