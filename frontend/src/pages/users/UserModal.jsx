import { useForm } from 'react-hook-form'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import Modal from '../../components/ui/Modal'
import { createUser, updateUser } from '../../api/users'

export default function UserModal({ open, user, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false)
  const isEdit = !!user

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    if (open) reset(user ? { name: user.name, email: user.email, phone: user.phone, role: user.role, department: user.department, is_active: user.is_active } : { role: 'employee', is_active: true })
  }, [open, user])

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isEdit) await updateUser(user.id, data)
      else await createUser(data)
      toast.success(isEdit ? 'User updated' : 'User created')
      onSuccess()
    } catch (err) {
      const msgs = err.response?.data?.errors
      if (msgs) Object.values(msgs).flat().forEach(m => toast.error(m))
      else toast.error(err.response?.data?.message || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit User' : 'Add User'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <div>
          <label className="label">Full Name *</label>
          <input {...register('name', { required: 'Required' })} className={`input ${errors.name ? 'border-red-400' : ''}`} placeholder="John Doe" />
          {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label">Email *</label>
          <input type="email" {...register('email', { required: 'Required' })} className={`input ${errors.email ? 'border-red-400' : ''}`} placeholder="user@municipality.gov" />
          {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        {!isEdit && (
          <div>
            <label className="label">Password *</label>
            <input type="password" {...register('password', { required: !isEdit && 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} className={`input ${errors.password ? 'border-red-400' : ''}`} placeholder="Min. 8 characters" />
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Role</label>
            <select {...register('role')} className="input">
              <option value="employee">Employee</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="label">Phone</label>
            <input {...register('phone')} className="input" placeholder="+212…" />
          </div>
        </div>

        <div>
          <label className="label">Department</label>
          <input {...register('department')} className="input" placeholder="Civil Status, Legalization…" />
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" {...register('is_active')} id="is_active" className="w-4 h-4 accent-blue-600" />
          <label htmlFor="is_active" className="text-sm text-slate-700 cursor-pointer">Account active</label>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
          <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading && <Loader2 size={15} className="animate-spin" />}
            {loading ? 'Saving…' : isEdit ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
