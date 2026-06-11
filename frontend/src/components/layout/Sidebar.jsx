import { NavLink } from 'react-router-dom'
import { LayoutDashboard, FileText, FolderOpen, BarChart3, LogOut, Building2, ClipboardList } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'

const LANG_LABELS = { en: 'EN', fr: 'FR', ar: 'AR' }

export default function Sidebar({ className = '' }) {
  const { user, logout } = useAuth()
  const { t, lang, setLang } = useLanguage()

  const navItems = [
    { to: '/',               icon: LayoutDashboard, label: t('nav.dashboard')     },
    { to: '/documents',      icon: FileText,        label: t('nav.documents')     },
    { to: '/document-types', icon: FolderOpen,      label: t('nav.documentTypes') },
    { to: '/statistics',     icon: BarChart3,       label: t('nav.statistics')    },
    { to: '/fiche',          icon: ClipboardList,   label: t('fiche.navLabel')    },
  ]

  return (
    <aside className={`w-64 shrink-0 bg-white border-r border-slate-100 flex flex-col h-screen sticky top-0 ${className}`}>
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
        <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
          <Building2 size={20} className="text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-slate-800">{t('auth.title')}</p>
          <p className="text-xs text-slate-400">{t('auth.subtitle')}</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Language switcher */}
      <div className="px-3 pb-3">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {(['en', 'fr', 'ar']).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`flex-1 py-1 text-xs rounded-lg font-semibold transition-all
                ${lang === l ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 px-3 py-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-all">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{t('nav.administrator')}</p>
          </div>
          <button onClick={logout} title="Logout" className="p-1 text-slate-400 hover:text-red-500 transition-colors">
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
