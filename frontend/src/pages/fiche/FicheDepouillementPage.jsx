import { useState } from 'react'
import { Printer, FileBarChart2 } from 'lucide-react'
import { getFicheDepouillement } from '../../api/fiche'
import { PageLoader } from '../../components/ui/Spinner'
import { useLanguage } from '../../context/LanguageContext'
import { MOTHER_AGE_GROUPS, DEATH_AGE_GROUPS, BIRTH_RANKS, GENERAL_AGE_GROUPS, ageGroupLabel, getTypeName } from '../../utils/helpers'

const currentYear  = new Date().getFullYear()
const currentMonth = new Date().getMonth() + 1

export default function FicheDepouillementPage() {
  const { t, lang, months } = useLanguage()
  const [year,    setYear]    = useState(currentYear)
  const [month,   setMonth]   = useState(currentMonth)
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i)

  const generate = () => {
    setLoading(true)
    setError(null)
    getFicheDepouillement({ year, month })
      .then(r => setData(r.data))
      .catch(() => setError('Failed to load data'))
      .finally(() => setLoading(false))
  }

  const handlePrint = () => window.print()

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('fiche.title')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{t('fiche.subtitle')}</p>
        </div>
        {data && (
          <button onClick={handlePrint} className="btn-secondary print:hidden">
            <Printer size={16} /> {t('fiche.print')}
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="card p-4 flex flex-wrap gap-3 items-end print:hidden">
        <div>
          <label className="label">{t('common.month')}</label>
          <select value={month} onChange={e => setMonth(Number(e.target.value))} className="input w-auto">
            {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="label">{t('common.year')}</label>
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="input w-auto">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <button onClick={generate} disabled={loading} className="btn-primary">
          <FileBarChart2 size={16} /> {t('fiche.generate')}
        </button>
      </div>

      {loading && <PageLoader />}
      {error   && <div className="card p-8 text-center text-red-500">{error}</div>}

      {data && !loading && (
        <div className="space-y-5 fiche-content">
          {/* ── Section 1: Naissances et Décès ─────────────────────────── */}
          <div className="fiche-grid grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FicheSection title={t('fiche.naissances')} color="blue">
              <DeclTable
                rows={[
                  { label: t('fiche.delaiLegal'),  data: data.births.delai_legal },
                  { label: t('fiche.jugCours'),    data: data.births.jugement_annee_cours },
                  { label: t('fiche.jugAnt'),      data: data.births.jugement_annees_anterieures },
                ]}
                totalLabel={t('fiche.totalNaissances')}
                total={data.births.total}
                t={t}
              />
            </FicheSection>

            <FicheSection title={t('fiche.deces')} color="red">
              <DeclTable
                rows={[
                  { label: t('fiche.delaiLegal'),  data: data.deaths.delai_legal },
                  { label: t('fiche.jugCours'),    data: data.deaths.jugement_annee_cours },
                  { label: t('fiche.jugAnt'),      data: data.deaths.jugement_annees_anterieures },
                ]}
                totalLabel={t('fiche.totalDeces')}
                total={data.deaths.total}
                t={t}
              />
            </FicheSection>
          </div>

          {/* ── Section 2: Mariages & Divorces ─────────────────────────── */}
          <div className="fiche-grid grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FicheSection title={t('fiche.mariages')} color="emerald">
              <GenderTable data={data.marriages} t={t} />
            </FicheSection>
            <FicheSection title={t('fiche.divorces')} color="emerald">
              <GenderTable data={data.divorces} t={t} />
            </FicheSection>
          </div>

          {/* ── Section 3: Naissances par âge mère ─────────────────────── */}
          <FicheSection title={t('fiche.byMotherAge')} color="violet">
            <AgeGroupTable
              groups={MOTHER_AGE_GROUPS}
              data={data.births.by_mother_age}
              t={t}
            />
          </FicheSection>

          {/* ── Section 4: Décès par groupes d'âges ────────────────────── */}
          <FicheSection title={t('fiche.byDeathAge')} color="orange">
            <AgeGroupTable
              groups={DEATH_AGE_GROUPS}
              data={data.deaths.by_age_group}
              t={t}
            />
          </FicheSection>

          {/* ── Section 5: Other document types ────────────────────────── */}
          {data.other?.length > 0 && (
            <FicheSection title={t('fiche.otherDocs')} color="slate">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-start py-2 px-3 font-semibold text-slate-600">{t('common.type')}</th>
                    <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.masculin')}</th>
                    <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.feminin')}</th>
                    <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.total')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.other.map(tp => {
                    const total = (tp.total.masculin || 0) + (tp.total.feminin || 0)
                    return (
                      <tr key={tp.name} className="hover:bg-slate-50">
                        <td className="py-2 px-3 text-slate-700 font-medium">{getTypeName(tp, lang)}</td>
                        <td className="py-2 px-3 text-end font-mono">{fmt(tp.total.masculin)}</td>
                        <td className="py-2 px-3 text-end font-mono">{fmt(tp.total.feminin)}</td>
                        <td className="py-2 px-3 text-end font-semibold font-mono text-slate-700">{fmt(total)}</td>
                      </tr>
                    )
                  })}
                  <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
                    <td className="py-2 px-3 text-slate-800">{t('fiche.total')}</td>
                    <td className="py-2 px-3 text-end font-mono">{fmt(data.other.reduce((s, tp) => s + (tp.total.masculin || 0), 0))}</td>
                    <td className="py-2 px-3 text-end font-mono">{fmt(data.other.reduce((s, tp) => s + (tp.total.feminin || 0), 0))}</td>
                    <td className="py-2 px-3 text-end font-mono text-blue-700">{fmt(data.other.reduce((s, tp) => s + (tp.total.masculin || 0) + (tp.total.feminin || 0), 0))}</td>
                  </tr>
                </tbody>
              </table>

              {/* Age group breakdown per type */}
              {data.other.filter(tp => Object.keys(tp.by_age_group).length > 0).map(tp => (
                <div key={tp.name + '_age'} className="border-t border-slate-100 px-3 pb-3 pt-2">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">{getTypeName(tp, lang)} — {t('fiche.ageGroup')}</p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-100">
                        <th className="text-start py-1 font-medium text-slate-400">{t('fiche.ageGroup')}</th>
                        <th className="text-end py-1 font-medium text-slate-400">{t('fiche.masculin')}</th>
                        <th className="text-end py-1 font-medium text-slate-400">{t('fiche.feminin')}</th>
                        <th className="text-end py-1 font-medium text-slate-400">{t('fiche.total')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GENERAL_AGE_GROUPS.map(g => {
                        const row = tp.by_age_group[g] || { masculin: 0, feminin: 0 }
                        return (
                          <tr key={g} className="hover:bg-slate-50">
                            <td className="py-1 text-slate-600">{g}</td>
                            <td className="py-1 text-end font-mono">{fmt(row.masculin)}</td>
                            <td className="py-1 text-end font-mono">{fmt(row.feminin)}</td>
                            <td className="py-1 text-end font-mono font-semibold">{fmt((row.masculin || 0) + (row.feminin || 0))}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </FicheSection>
          )}

          {/* ── Section 6: Rang de la Naissance ────────────────────────── */}
          <FicheSection title={t('fiche.byRank')} color="pink">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-start py-2 px-3 font-semibold text-slate-600">{t('fiche.rank')}</th>
                  <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.masculin')}</th>
                  <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.feminin')}</th>
                  <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.total')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {BIRTH_RANKS.map(r => {
                  const row   = data.births.by_rank[r] || { masculin: 0, feminin: 0 }
                  const total = row.masculin + row.feminin
                  const label = r === 10 ? `10 ${t('fiche.andOver')}` : String(r)
                  return (
                    <tr key={r} className="hover:bg-slate-50">
                      <td className="py-2 px-3 text-slate-700">{label}</td>
                      <td className="py-2 px-3 text-end font-mono">{fmt(row.masculin)}</td>
                      <td className="py-2 px-3 text-end font-mono">{fmt(row.feminin)}</td>
                      <td className="py-2 px-3 text-end font-semibold font-mono">{fmt(total)}</td>
                    </tr>
                  )
                })}
                <TotalRow
                  masculin={sumField(data.births.by_rank, 'masculin')}
                  feminin={sumField(data.births.by_rank, 'feminin')}
                  t={t}
                />
              </tbody>
            </table>
          </FicheSection>
        </div>
      )}
    </div>
  )
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

const fmt = (n) => String(n ?? 0).padStart(2, '0')

const sumField = (obj, field) =>
  Object.values(obj || {}).reduce((s, r) => s + (r[field] || 0), 0)

const COLOR_MAP = {
  blue:    'border-blue-400    bg-blue-50',
  red:     'border-red-400     bg-red-50',
  emerald: 'border-emerald-400 bg-emerald-50',
  violet:  'border-violet-400  bg-violet-50',
  orange:  'border-orange-400  bg-orange-50',
  pink:    'border-pink-400    bg-pink-50',
  slate:   'border-slate-300   bg-slate-50',
}
const TITLE_COLOR = {
  blue:    'text-blue-700',
  red:     'text-red-700',
  emerald: 'text-emerald-700',
  violet:  'text-violet-700',
  orange:  'text-orange-700',
  pink:    'text-pink-700',
  slate:   'text-slate-600',
}

function FicheSection({ title, color = 'blue', children }) {
  return (
    <div className={`fiche-section rounded-2xl border-2 ${COLOR_MAP[color]} overflow-hidden shadow-sm`}>
      <div className={`px-4 py-3 border-b border-current/10`}>
        <h3 className={`text-sm font-bold uppercase tracking-wide ${TITLE_COLOR[color]}`}>{title}</h3>
      </div>
      <div className="bg-white">{children}</div>
    </div>
  )
}

function GenderTable({ data, t }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.masculin')}</th>
          <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.feminin')}</th>
          <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.total')}</th>
        </tr>
      </thead>
      <tbody>
        <tr className="bg-slate-100 font-bold">
          <td className="py-3 px-3 text-end font-mono text-lg">{fmt(data?.masculin)}</td>
          <td className="py-3 px-3 text-end font-mono text-lg">{fmt(data?.feminin)}</td>
          <td className="py-3 px-3 text-end font-mono text-lg text-blue-700">{fmt(data?.total)}</td>
        </tr>
      </tbody>
    </table>
  )
}

function DeclTable({ rows, totalLabel, total, t }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          <th className="text-start py-2 px-3 font-semibold text-slate-600">{t('fiche.event')}</th>
          <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.masculin')}</th>
          <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.feminin')}</th>
          <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.total')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {rows.map(({ label, data }) => (
          <tr key={label} className="hover:bg-slate-50">
            <td className="py-2 px-3 text-slate-700 text-xs leading-tight">{label}</td>
            <td className="py-2 px-3 text-end font-mono">{fmt(data?.masculin)}</td>
            <td className="py-2 px-3 text-end font-mono">{fmt(data?.feminin)}</td>
            <td className="py-2 px-3 text-end font-semibold font-mono">{fmt((data?.masculin || 0) + (data?.feminin || 0))}</td>
          </tr>
        ))}
        <TotalRow
          label={totalLabel}
          masculin={total?.masculin}
          feminin={total?.feminin}
          t={t}
        />
      </tbody>
    </table>
  )
}

function AgeGroupTable({ groups, data, t }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 bg-slate-50">
          <th className="text-start py-2 px-3 font-semibold text-slate-600">{t('fiche.ageGroup')}</th>
          <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.masculin')}</th>
          <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.feminin')}</th>
          <th className="text-end py-2 px-3 font-semibold text-slate-600">{t('fiche.total')}</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {groups.map(g => {
          const row   = data?.[g] || { masculin: 0, feminin: 0 }
          const total = row.masculin + row.feminin
          return (
            <tr key={g} className="hover:bg-slate-50">
              <td className="py-2 px-3 text-slate-700">{ageGroupLabel(g, t)}</td>
              <td className="py-2 px-3 text-end font-mono">{fmt(row.masculin)}</td>
              <td className="py-2 px-3 text-end font-mono">{fmt(row.feminin)}</td>
              <td className="py-2 px-3 text-end font-semibold font-mono">{fmt(total)}</td>
            </tr>
          )
        })}
        <TotalRow
          masculin={sumField(data, 'masculin')}
          feminin={sumField(data, 'feminin')}
          t={t}
        />
      </tbody>
    </table>
  )
}

function FicheRow({ label, value }) {
  return (
    <tr className="hover:bg-slate-50">
      <td className="py-2 px-3 text-slate-700">{label}</td>
      <td className="py-2 px-3 text-end font-semibold font-mono text-lg">{fmt(value)}</td>
    </tr>
  )
}

function TotalRow({ label, masculin, feminin, t }) {
  const total = (masculin || 0) + (feminin || 0)
  return (
    <tr className="bg-slate-100 font-bold border-t-2 border-slate-300">
      <td className="py-2 px-3 text-slate-800">{label || t('fiche.total')}</td>
      <td className="py-2 px-3 text-end font-mono">{fmt(masculin)}</td>
      <td className="py-2 px-3 text-end font-mono">{fmt(feminin)}</td>
      <td className="py-2 px-3 text-end font-mono text-blue-700">{fmt(total)}</td>
    </tr>
  )
}
