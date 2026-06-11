import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Calendar, FileText } from 'lucide-react'
import { getDailyStats, getMonthlyStats, getAvailableYears } from '../../api/statistics'
import { fmtNum, fmtMoney } from '../../utils/helpers'
import { PageLoader } from '../../components/ui/Spinner'
import { useLanguage } from '../../context/LanguageContext'

const currentYear  = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1
const currentDay   = new Date().getDate()

export default function StatisticsPage() {
  const [tab, setTab]     = useState('monthly')
  const [years, setYears] = useState([currentYear])
  const [year, setYear]   = useState(currentYear)
  const [month, setMonth] = useState(currentMonth)
  const [day, setDay]     = useState(currentDay)
  const [data, setData]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const { t, months } = useLanguage()

  const TABS = [
    { key: 'daily',   label: t('statistics.daily')   },
    { key: 'monthly', label: t('statistics.monthly') },
    { key: 'yearly',  label: t('statistics.yearly')  },
  ]

  useEffect(() => {
    getAvailableYears().then(r => {
      const y = r.data.years
      if (y.length) setYears(y)
    })
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    setData(null)

    const fetchers = {
      daily:   () => getDailyStats({ year, month }),
      monthly: () => getDailyStats({ year, month }),
      yearly:  () => getMonthlyStats({ year }),
    }

    fetchers[tab]()
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load statistics'))
      .finally(() => setLoading(false))
  }, [tab, year, month, day])

  const daysInMonth = new Date(year, month, 0).getDate()

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('statistics.title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('statistics.subtitle')}</p>
        </div>
      </div>

      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {TABS.map(tb => (
            <button
              key={tb.key}
              onClick={() => setTab(tb.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all
                ${tab === tb.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2 flex-wrap">
          <Calendar size={15} className="text-slate-400" />

          {tab === 'daily' && (
            <select value={day} onChange={e => setDay(Number(e.target.value))} className="input w-auto">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(d => (
                <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
              ))}
            </select>
          )}

          {(tab === 'daily' || tab === 'monthly') && (
            <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input w-auto">
              {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
            </select>
          )}

          <select value={year} onChange={e => setYear(Number(e.target.value))} className="input w-auto">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading && <PageLoader />}
      {error   && <div className="card p-8 text-center text-red-500">{error}</div>}
      {!loading && !error && data && (
        <>
          {tab === 'daily'   && <DailyView   data={data} year={year} month={month} day={day} t={t} months={months} />}
          {tab === 'monthly' && <MonthlyView data={data} year={year} month={month} t={t} months={months} />}
          {tab === 'yearly'  && <YearlyView  data={data} year={year} t={t} months={months} />}
        </>
      )}
    </div>
  )
}

function NoData({ label }) {
  return (
    <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-400">
      <FileText size={36} strokeWidth={1.2} />
      <p className="text-sm">{label}</p>
    </div>
  )
}

function SummaryRow({ items }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map(({ label, value }) => (
        <div key={label} className="card p-4">
          <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
        </div>
      ))}
    </div>
  )
}

function DailyView({ data, year, month, day, t, months }) {
  const daily = data?.daily ?? []

  const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  const dayData = daily.find(d => d.date === dateStr)

  const count   = dayData ? Number(dayData.count)   : 0
  const revenue = dayData ? Number(dayData.revenue) : 0

  const byType = (data?.by_type ?? []).filter(r => r.date === dateStr)

  const label = `${String(day).padStart(2, '0')} ${months[month - 1]} ${year}`

  return (
    <div className="space-y-4">
      <SummaryRow items={[
        { label: t('statistics.totalDocuments'), value: fmtNum(count)          },
        { label: t('statistics.totalRevenue'),   value: fmtMoney(revenue)      },
        { label: t('common.date'),               value: label                  },
        { label: t('statistics.breakdown'),      value: fmtNum(byType.length)  },
      ]} />

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="text-base font-semibold text-slate-800">{t('statistics.breakdown')} — {label}</h3>
        </div>
        {count === 0 ? (
          <NoData label={t('statistics.noData')} />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="table-th">{t('statistics.documentTypes')}</th>
                <th className="table-th text-right">{t('statistics.count')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {byType.map(r => (
                <tr key={r.type_name} className="hover:bg-slate-50">
                  <td className="table-td">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      {r.type_name}
                    </div>
                  </td>
                  <td className="table-td text-right font-semibold">{fmtNum(r.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function MonthlyView({ data, year, month, t, months }) {
  const daily = data?.daily ?? []
  const total   = daily.reduce((s, d) => s + Number(d.count), 0)
  const revenue = daily.reduce((s, d) => s + Number(d.revenue), 0)
  const peak    = daily.length
    ? daily.reduce((mx, d) => Number(d.count) > Number(mx.count) ? d : mx, daily[0])
    : null

  const lineData = daily.map(d => ({
    day:       d.date?.slice(8),
    [t('statistics.documents')]: Number(d.count),
  }))

  const label = `${months[month - 1]} ${year}`

  return (
    <div className="space-y-4">
      <SummaryRow items={[
        { label: t('statistics.totalDocuments'), value: fmtNum(total) },
        { label: t('statistics.totalRevenue'),   value: fmtMoney(revenue) },
        { label: t('statistics.workingDays'),    value: fmtNum(daily.length) },
        { label: t('statistics.peakDay'),        value: peak ? `${t('common.day')} ${peak.date?.slice(8)} (${peak.count})` : '—' },
      ]} />

      <div className="card p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4">{t('statistics.monthlyTitle')} — {label}</h3>
        {lineData.length === 0 ? (
          <NoData label={t('statistics.noData')} />
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={lineData} margin={{ left: -15, right: 5, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend />
              <Line type="monotone" dataKey={t('statistics.documents')} stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {total > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">{t('common.day')}</th>
                  <th className="table-th text-right">{t('statistics.documents')}</th>
                  <th className="table-th text-right">{t('statistics.revenue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {daily.map(row => (
                  <tr key={row.date} className="hover:bg-slate-50">
                    <td className="table-td font-medium">{row.date}</td>
                    <td className="table-td text-right font-semibold">{fmtNum(row.count)}</td>
                    <td className="table-td text-right">{fmtMoney(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

function YearlyView({ data, year, t, months }) {
  const monthly = data?.monthly ?? []
  const total   = monthly.reduce((s, d) => s + Number(d.count), 0)
  const revenue = monthly.reduce((s, d) => s + Number(d.revenue), 0)

  const barData = Array.from({ length: 12 }, (_, i) => {
    const found = monthly.find(m => Number(m.month) === i + 1)
    return {
      month:     months[i].slice(0, 3),
      [t('statistics.documents')]: found ? Number(found.count)   : 0,
      [t('statistics.revenue')]:   found ? Number(found.revenue) : 0,
    }
  })

  return (
    <div className="space-y-4">
      <SummaryRow items={[
        { label: t('statistics.totalDocuments'), value: fmtNum(total) },
        { label: t('statistics.totalRevenue'),   value: fmtMoney(revenue) },
        { label: t('statistics.avgMonth'),       value: fmtNum(Math.round(total / 12)) },
        { label: t('common.year'),               value: String(year) },
      ]} />

      <div className="card p-5">
        <h3 className="text-base font-semibold text-slate-800 mb-4">{t('statistics.yearlyTitle')} — {year}</h3>
        {total === 0 ? (
          <NoData label={t('statistics.noData')} />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData} margin={{ left: -15, right: 5, top: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }} />
              <Legend />
              <Bar dataKey={t('statistics.documents')} fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {total > 0 && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="table-th">{t('common.month')}</th>
                  <th className="table-th text-right">{t('statistics.documents')}</th>
                  <th className="table-th text-right">{t('statistics.revenue')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {barData.filter(r => r[t('statistics.documents')] > 0).map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="table-td font-medium">{row.month}</td>
                    <td className="table-td text-right font-semibold">{fmtNum(row[t('statistics.documents')])}</td>
                    <td className="table-td text-right">{fmtMoney(row[t('statistics.revenue')])}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
