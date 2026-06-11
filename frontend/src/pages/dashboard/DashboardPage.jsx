import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText, TrendingUp, Calendar, BarChart3,
  ArrowUpRight,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts'
import { getDashboard } from '../../api/statistics'
import { fmtNum, fmtMoney, fmtDate, STATUS_MAP, isExpired, getTypeName } from '../../utils/helpers'
import { PageLoader } from '../../components/ui/Spinner'
import { useLanguage } from '../../context/LanguageContext'

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { t, lang } = useLanguage()

  const LOCALE_MAP = { en: 'en-GB', fr: 'fr-MA', ar: 'ar-MA' }

  useEffect(() => {
    getDashboard()
      .then(r => setData(r.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <PageLoader />

  const { summary, by_type, status_breakdown, recent_documents } = data

  const summaryCards = [
    {
      label: t('dashboard.today'),
      count: summary.today.count,
      revenue: summary.today.revenue,
      icon: Calendar,
      bg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      label: t('dashboard.thisMonth'),
      count: summary.month.count,
      revenue: summary.month.revenue,
      icon: TrendingUp,
      bg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: t('dashboard.thisYear'),
      count: summary.year.count,
      revenue: summary.year.revenue,
      icon: BarChart3,
      bg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      label: t('dashboard.allTime'),
      count: summary.total.count,
      revenue: summary.total.revenue,
      icon: FileText,
      bg: 'bg-amber-50',
      iconColor: 'text-amber-600',
    },
  ]

  const pieData = by_type.filter(tp => tp.total > 0).map(tp => ({
    name: getTypeName(tp, lang),
    value: tp.total,
    color: tp.color,
  }))

  const barData = by_type
    .sort((a, b) => b.total - a.total)
    .slice(0, 8)
    .map(tp => ({ name: tp.code, full: getTypeName(tp, lang), count: tp.total, color: tp.color }))

  const statusData = Object.entries(status_breakdown || {}).map(([k, v]) => ({
    name: t(`status.${k}`),
    value: Number(v),
    cls: k,
  }))

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('dashboard.title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {new Date().toLocaleDateString(LOCALE_MAP[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <Link to="/documents" className="btn-primary">
          <FileText size={16} />
          {t('dashboard.issueDocument')}
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map(({ label, count, revenue, icon: Icon, bg, iconColor }) => (
          <div key={label} className="stat-card">
            <div className="flex items-start justify-between">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                <Icon size={20} className={iconColor} />
              </div>
              <span className="text-xs text-slate-400 font-medium">{label}</span>
            </div>
            <div>
              <p className="text-3xl font-bold text-slate-800">{fmtNum(count)}</p>
              <p className="text-xs text-slate-500 mt-0.5">{t('dashboard.documentsIssued')}</p>
            </div>
            <div className="pt-2 border-t border-slate-50">
              <p className="text-sm font-semibold text-slate-700">{fmtMoney(revenue)}</p>
              <p className="text-xs text-slate-400">{t('dashboard.totalRevenue')}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-base font-semibold text-slate-800 mb-4">{t('dashboard.byType')}</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                formatter={(val, _, props) => [fmtNum(val), props.payload.full]}
                contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {barData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">{t('dashboard.distribution')}</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="45%" innerRadius={55} outerRadius={85} paddingAngle={2} dataKey="value">
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip formatter={(val) => fmtNum(val)} contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ fontSize: 11, color: '#64748b' }}>{val}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-slate-400 text-sm">{t('dashboard.noDataYet')}</div>
          )}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h3 className="text-base font-semibold text-slate-800">{t('dashboard.recentDocuments')}</h3>
            <Link to="/documents" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              {t('dashboard.viewAll')} <ArrowUpRight size={12} />
            </Link>
          </div>
          <div className="divide-y divide-slate-50">
            {recent_documents.map(doc => (
              <Link key={doc.id} to={`/documents/${doc.id}`}
                className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: doc.document_type?.color + '20' }}>
                  <FileText size={14} style={{ color: doc.document_type?.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{getTypeName(doc.document_type, lang)}</p>
                  <p className="text-xs text-slate-400 truncate font-mono">{doc.reference_number}</p>
                </div>
                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                  <p className="text-xs text-slate-500">{fmtDate(doc.issue_date)}</p>
                  {isExpired(doc.expiry_date)
                    ? <span className="badge badge-red">{t('status.expired')}</span>
                    : <StatusBadge status={doc.status} t={t} />
                  }
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-base font-semibold text-slate-800 mb-4">{t('dashboard.statusBreakdown')}</h3>
          <div className="flex flex-col gap-3">
            {statusData.map(({ name, value, cls }) => {
              const total = statusData.reduce((s, d) => s + d.value, 0)
              const pct = total ? Math.round((value / total) * 100) : 0
              const colors = { issued: '#10b981', pending: '#f59e0b', processing: '#3b82f6', rejected: '#ef4444', cancelled: '#94a3b8' }
              return (
                <div key={cls}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">{name}</span>
                    <span className="text-xs text-slate-500">{fmtNum(value)} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: colors[cls] || '#94a3b8' }} />
                  </div>
                </div>
              )
            })}
            {statusData.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">{t('dashboard.noDataYet')}</p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{t('dashboard.byTypeToday')}</p>
            <div className="flex flex-col gap-2">
              {by_type.filter(tp => tp.today_total > 0).slice(0, 5).map(tp => (
                <div key={tp.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tp.color }} />
                    <span className="text-xs text-slate-600 truncate max-w-[130px]">{getTypeName(tp, lang)}</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">{tp.today_total}</span>
                </div>
              ))}
              {by_type.every(tp => !tp.today_total) && (
                <p className="text-xs text-slate-400 text-center py-4">{t('dashboard.noDocumentsToday')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, t }) {
  const map = {
    issued:     'bg-emerald-100 text-emerald-700',
    pending:    'bg-amber-100 text-amber-700',
    processing: 'bg-blue-100 text-blue-700',
    rejected:   'bg-red-100 text-red-700',
    cancelled:  'bg-slate-100 text-slate-500',
  }
  return (
    <span className={`badge mt-0.5 ${map[status] || 'badge-gray'}`}>
      {t(`status.${status}`)}
    </span>
  )
}
