import { format, parseISO } from 'date-fns'

export const fmtDate = (d) => {
  if (!d) return '—'
  try { return format(typeof d === 'string' ? parseISO(d) : d, 'dd MMM yyyy') } catch { return d }
}

export const fmtMoney = (n) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(n ?? 0)

export const fmtNum = (n) => new Intl.NumberFormat().format(n ?? 0)

export const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

export const STATUS_MAP = {
  issued:     { cls: 'badge-green'  },
  pending:    { cls: 'badge-yellow' },
  processing: { cls: 'badge-blue'   },
  rejected:   { cls: 'badge-red'    },
  cancelled:  { cls: 'badge-gray'   },
}

export const STATUS_KEYS = ['issued', 'pending', 'processing', 'rejected', 'cancelled']

export const DOC_CATEGORIES = ['birth', 'death', 'marriage', 'divorce', 'other']

export const MOTHER_AGE_GROUPS = ['-18', '18-19', '20-24', '25-29', '30-34', '35-39', '40-44', '45-49', '50+']

export const DEATH_AGE_GROUPS = [
  'mort-ne', 'moins-1', '01-04', '05-09', '10-14', '15-19',
  '20-24', '25-29', '30-34', '35-39', '40-44', '45-49',
  '50-54', '55-59', '60-64', '65-69', '70-74', '75-79', '80+',
]

export const BIRTH_RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export const GENERAL_AGE_GROUPS = ['0-17', '18-25', '26-35', '36-50', '51-65', '65+']

export const DECL_TYPES = ['delai_legal', 'jugement_annee_cours', 'jugement_annees_anterieures']

export const getTypeName = (type, lang) => {
  if (!type) return '—'
  if (lang === 'ar' && type.name_ar) return type.name_ar
  if (lang === 'fr' && type.name_fr) return type.name_fr
  return type.name
}

export const ageGroupLabel = (key, t) => {
  if (key === 'mort-ne')  return t('fiche.mortNe')
  if (key === 'moins-1')  return t('fiche.moinsUn')
  if (key === '50+' || key === '80+') return `${key.replace('+', '')} ${t('fiche.andOver')}`
  return key
}

export const isExpired = (expiry_date) => {
  if (!expiry_date) return false
  return new Date(expiry_date) < new Date(new Date().toDateString())
}

export const PAYMENT_MAP = {
  cash:   'Cash',
  card:   'Card',
  online: 'Online',
  exempt: 'Exempt',
}

export const paginationRange = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total]
  if (current >= total - 3) return [1, '…', total-4, total-3, total-2, total-1, total]
  return [1, '…', current-1, current, current+1, '…', total]
}
