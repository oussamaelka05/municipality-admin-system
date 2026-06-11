import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import { createDocumentType, updateDocumentType } from '../../api/documents'
import { useLanguage } from '../../context/LanguageContext'
import { DOC_CATEGORIES } from '../../utils/helpers'

const COLORS = ['#3B82F6','#10B981','#EC4899','#F59E0B','#8B5CF6','#EF4444','#06B6D4','#84CC16','#14B8A6','#6B7280']

export default function DocumentTypeModal({ open, type, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const isEdit = !!type
  const { t } = useLanguage()

  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isDirty } } = useForm()

  useEffect(() => {
    if (open) {
      reset(type
        ? { name: type.name, name_fr: type.name_fr, name_ar: type.name_ar, code: type.code, category: type.category, description: type.description, color: type.color, icon: type.icon, fee: type.fee, processing_days: type.processing_days, is_active: type.is_active }
        : { color: '#3B82F6', fee: 0, processing_days: 1, is_active: true, category: 'other' }
      )
    }
  }, [open, type])

  const selectedColor = watch('color')

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isEdit) await updateDocumentType(type.id, data)
      else await createDocumentType(data)
      toast.success(isEdit ? t('docTypes.typeUpdated') : t('docTypes.typeCreated'))
      onSuccess()
    } catch (err) {
      const errs = err.response?.data?.errors
      if (errs) {
        Object.values(errs).flat().forEach(m => toast.error(m))
      } else {
        toast.error(err.response?.data?.message || 'Failed to save')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (isDirty) {
      setConfirmClose(true)
    } else {
      onClose()
    }
  }

  const confirmDiscard = () => {
    setConfirmClose(false)
    onClose()
  }

  return (
    <>
      <Modal open={open} onClose={handleClose} title={isEdit ? t('docTypes.editTitle') : t('docTypes.newTitle')} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">{t('docTypes.nameEn')} *</label>
              <input {...register('name', { required: 'Required' })} className={`input ${errors.name ? 'border-red-400' : ''}`} placeholder="Birth Certificate" />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="label">{t('docTypes.nameFr')}</label>
              <input {...register('name_fr')} className="input" placeholder="Acte de naissance" />
            </div>
            <div>
              <label className="label">{t('docTypes.nameAr')}</label>
              <input {...register('name_ar')} className="input" placeholder="شهادة الميلاد" dir="rtl" />
            </div>
            <div>
              <label className="label">{t('docTypes.code')} *</label>
              <input {...register('code', { required: 'Required' })} className={`input font-mono ${errors.code ? 'border-red-400' : ''}`} placeholder="BC" />
              {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code.message}</p>}
            </div>
            <div className="col-span-2">
              <label className="label">{t('docCategory.label')} *</label>
              <select {...register('category')} className="input">
                {DOC_CATEGORIES.map(c => (
                  <option key={c} value={c}>{t(`docCategory.${c}`)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">{t('docTypes.description')}</label>
            <textarea {...register('description')} rows={2} className="input resize-none" placeholder="Optional description…" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">{t('docTypes.feeMad')}</label>
              <input type="number" step="0.01" min="0" {...register('fee')} className="input" placeholder="0.00" />
            </div>
            <div>
              <label className="label">{t('docTypes.processingDays')}</label>
              <input type="number" min="1" {...register('processing_days')} className="input" placeholder="1" />
            </div>
          </div>

          <div>
            <label className="label">{t('docTypes.color')}</label>
            <div className="flex items-center gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setValue('color', c)}
                  className="w-7 h-7 rounded-full transition-all border-2"
                  style={{ backgroundColor: c, borderColor: selectedColor === c ? '#1e293b' : 'transparent' }}
                />
              ))}
              <input type="color" {...register('color')} className="w-7 h-7 rounded-full cursor-pointer border border-slate-200" title="Custom color" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input type="checkbox" {...register('is_active')} id="is_active" className="w-4 h-4 accent-blue-600" />
            <label htmlFor="is_active" className="text-sm text-slate-700 cursor-pointer">{t('docTypes.activeLabel')}</label>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
            <button type="button" onClick={handleClose} className="btn-secondary">{t('common.cancel')}</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? t('common.saving') : isEdit ? t('docTypes.updateType') : t('docTypes.createType')}
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
