import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Edit2, Trash2, ShieldCheck, User, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUsers, deleteUser, updateUser } from '../../api/users'
import { fmtDate } from '../../utils/helpers'
import Pagination from '../../components/ui/Pagination'
import { PageLoader } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import UserModal from './UserModal'

export default function UsersPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [draft, setDraft]     = useState('')
  const [role, setRole]       = useState('')
  const [page, setPage]       = useState(1)
  const [modal, setModal]     = useState({ open: false, user: null })
  const [delTarget, setDelTarget] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    const p = { page, per_page: 15 }
    if (search) p.search = search
    if (role)   p.role   = role
    getUsers(p)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [page, search, role])

  useEffect(() => { load() }, [load])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(draft)
    setPage(1)
  }

  const handleDelete = async () => {
    try {
      await deleteUser(delTarget.id)
      toast.success('User deleted')
      setDelTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete')
    }
  }

  const toggleActive = async (user) => {
    try {
      await updateUser(user.id, { is_active: !user.is_active })
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`)
      load()
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="text-sm text-slate-500 mt-0.5">{data?.total ? `${data.total} users` : 'Manage system users'}</p>
        </div>
        <button onClick={() => setModal({ open: true, user: null })} className="btn-primary">
          <Plus size={16} /> Add User
        </button>
      </div>

      <form onSubmit={handleSearch} className="card p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={draft} onChange={e => setDraft(e.target.value)} placeholder="Search users…" className="input pl-9" />
        </div>
        <select value={role} onChange={e => { setRole(e.target.value); setPage(1) }} className="input w-auto">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="employee">Employee</option>
        </select>
        <button type="submit" className="btn-primary">Search</button>
        {(search || role) && (
          <button type="button" onClick={() => { setSearch(''); setDraft(''); setRole(''); setPage(1) }} className="btn-ghost">
            <X size={15} />
          </button>
        )}
      </form>

      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : !data?.data?.length ? (
          <EmptyState message="No users found" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-th">User</th>
                    <th className="table-th">Role</th>
                    <th className="table-th">Department</th>
                    <th className="table-th text-right">Docs Issued</th>
                    <th className="table-th">Status</th>
                    <th className="table-th">Joined</th>
                    <th className="table-th"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.data.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                            ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-blue-100 text-blue-700'}`}>
                            {u.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{u.name}</p>
                            <p className="text-xs text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-td">
                        <span className={`badge ${u.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                          {u.role === 'admin' ? <ShieldCheck size={10} className="mr-1" /> : <User size={10} className="mr-1" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="table-td text-slate-500">{u.department || '—'}</td>
                      <td className="table-td text-right font-semibold">{u.documents_count ?? 0}</td>
                      <td className="table-td">
                        <button onClick={() => toggleActive(u)} className={`badge cursor-pointer ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="table-td text-slate-500">{fmtDate(u.created_at)}</td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setModal({ open: true, user: u })} className="btn-ghost p-1.5 rounded-lg">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => setDelTarget(u)} className="btn-ghost p-1.5 rounded-lg text-red-500 hover:bg-red-50">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination meta={data} onPageChange={setPage} />
          </>
        )}
      </div>

      <UserModal
        open={modal.open}
        user={modal.user}
        onClose={() => setModal({ open: false, user: null })}
        onSuccess={() => { setModal({ open: false, user: null }); load() }}
      />
      <ConfirmDialog
        open={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Delete user "${delTarget?.name}"? This cannot be undone.`}
      />
    </div>
  )
}
