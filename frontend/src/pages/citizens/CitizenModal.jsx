import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal'
import { createCitizen, updateCitizen } from '../../api/citizens'

export default function CitizenModal({ open, citizen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!citizen

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (open) reset(citizen || {})
  }, [open, citizen])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isEdit) await updateCitizen(citizen.id, data)
      else await createCitizen(data)
      toast.success(isEdit ? 'Citizen updated' : 'Citizen added')
      onSuccess()
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) Object.values(msgs).flat().forEach(m => toast.error(m))
      else toast.error('Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Citizen' : 'Add Citizen'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">First Name *</label>
            <input {...register('first_name', { required: 'Required' })} className={`input ${errors.first_name ? 'border-red-400' : ''}`} />
            {errors.first_name && <p className="text-xs text-red-500 mt-1">{errors.first_name.message}</p>}
          </div>
          <div>
            <label className="label">Last Name *</label>
            <input {...register('last_name', { required: 'Required' })} className={`input ${errors.last_name ? 'border-red-400' : ''}`} />
            {errors.last_name && <p className="text-xs text-red-500 mt-1">{errors.last_name.message}</p>}
          </div>
          <div>
            <label className="label">First Name (Arabic)</label>
            <input {...register('first_name_ar')} className="input" dir="rtl" />
          </div>
          <div>
            <label className="label">Last Name (Arabic)</label>
            <input {...register('last_name_ar')} className="input" dir="rtl" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">National ID</label>
            <input {...register('national_id')} className="input font-mono" placeholder="ID number" />
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input type="date" {...register('date_of_birth')} className="input" />
          </div>
          <div>
            <label className="label">Gender</label>
            <select {...register('gender')} className="input">
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
          <div>
            <label className="label">Phone</label>
            <input {...register('phone')} className="input" placeholder="+212…" />
          </div>
        </div>

        <div>
          <label className="label">Email</label>
          <input type="email" {...register('email')} className="input" placeholder="optional@email.com" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Address</label>
            <input {...register('address')} className="input" />
          </div>
          <div>
            <label className="label">City</label>
            <input {...register('city')} className="input" />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Saving…' : isEdit ? 'Update' : 'Add Citizen'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
