import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Eye, Trash2, User, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { getCitizens, deleteCitizen } from '../../api/citizens'
import { fmtDate } from '../../utils/helpers'
import Pagination from '../../components/ui/Pagination'
import { PageLoader } from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import CitizenModal from './CitizenModal'

export default function CitizensPage() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [draft, setDraft]     = useState('')
  const [page, setPage]       = useState(1)
  const [modal, setModal]     = useState({ open: false, citizen: null })
  const [delTarget, setDelTarget] = useState(null)

  const load = useCallback(() => {
    setLoading(true)
    const p = { page, per_page: 15 }
    if (search) p.search = search
    getCitizens(p)
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [page, search])

  useEffect(() => { load() }, [load])

  const handleSearch = (e) => {
    e.preventDefault()
    setSearch(draft)
    setPage(1)
  }

  const handleDelete = async () => {
    try {
      await deleteCitizen(delTarget.id)
      toast.success('Citizen deleted')
      setDelTarget(null)
      load()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">Citizens</h1>
          <p className="text-sm text-slate-500 mt-0.5">{data?.total ? `${data.total} registered` : 'Manage citizen records'}</p>
        </div>
        <button onClick={() => setModal({ open: true, citizen: null })} className="btn-primary">
          <Plus size={16} /> Add Citizen
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            placeholder="Search by name, national ID, phone…"
            className="input pl-9"
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
        {search && <button type="button" onClick={() => { setSearch(''); setDraft(''); setPage(1) }} className="btn-ghost"><X size={15} /></button>}
      </form>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? <PageLoader /> : !data?.data?.length ? (
          <EmptyState message="No citizens found" action={
            <button onClick={() => setModal({ open: true, citizen: null })} className="btn-primary mt-2">
              <Plus size={14} /> Add Citizen
            </button>
          } />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="table-th">Name</th>
                    <th className="table-th">National ID</th>
                    <th className="table-th">Date of Birth</th>
                    <th className="table-th">Phone</th>
                    <th className="table-th">City</th>
                    <th className="table-th text-right">Documents</th>
                    <th className="table-th"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.data.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="table-td">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 text-sm font-bold shrink-0">
                            {c.first_name?.[0]}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">{c.first_name} {c.last_name}</p>
                            {(c.first_name_ar || c.last_name_ar) && (
                              <p className="text-xs text-slate-400" dir="rtl">{c.first_name_ar} {c.last_name_ar}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="table-td font-mono text-xs text-slate-600">{c.national_id || '—'}</td>
                      <td className="table-td text-slate-500">{fmtDate(c.date_of_birth)}</td>
                      <td className="table-td text-slate-500">{c.phone || '—'}</td>
                      <td className="table-td text-slate-500">{c.city || '—'}</td>
                      <td className="table-td text-right">
                        <span className="badge badge-blue">{c.documents_count}</span>
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1 justify-end">
                          <button onClick={() => setModal({ open: true, citizen: c })} className="btn-ghost p-1.5 rounded-lg" title="Edit">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => setDelTarget(c)} className="btn-ghost p-1.5 rounded-lg text-red-500 hover:bg-red-50" title="Delete">
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

      <CitizenModal
        open={modal.open}
        citizen={modal.citizen}
        onClose={() => setModal({ open: false, citizen: null })}
        onSuccess={() => { setModal({ open: false, citizen: null }); load() }}
      />
      <ConfirmDialog
        open={!!delTarget}
        onClose={() => setDelTarget(null)}
        onConfirm={handleDelete}
        title="Delete Citizen"
        message={`Delete citizen "${delTarget?.first_name} ${delTarget?.last_name}"?`}
      />
    </div>
  )
}
