import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Building2, Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Toaster } from 'react-hot-toast'

const LANG_LABELS = { en: 'EN', fr: 'FR', ar: 'AR' }

export default function LoginPage() {
  const { user, login } = useAuth()
  const { t, lang, setLang } = useLanguage()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  if (user) return <Navigate to="/" replace />

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await login(data)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.response?.data?.message || t('auth.invalidCreds'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <Toaster position="top-center" />

      <div className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />

      <div className="relative w-full max-w-md">
        {/* Language switcher */}
        <div className="flex justify-end gap-1 mb-3">
          {(['en', 'fr', 'ar']).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 text-xs rounded-lg font-semibold transition-all
                ${lang === l ? 'bg-white text-slate-800' : 'text-slate-400 hover:text-white'}`}
            >
              {LANG_LABELS[l]}
            </button>
          ))}
        </div>

        <div className="bg-white/95 backdrop-blur rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-8 text-white text-center">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Building2 size={32} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold">{t('auth.title')}</h1>
            <p className="text-blue-200 text-sm mt-1">{t('auth.subtitle')}</p>
          </div>

          <div className="px-8 py-8">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">{t('auth.welcome')}</h2>
            <p className="text-sm text-slate-500 mb-6">{t('auth.signInDesc')}</p>

            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <div>
                <label className="label">{t('auth.email')}</label>
                <div className="relative">
                  <Mail size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register('email', { required: t('auth.email'), pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })}
                    type="email"
                    placeholder="you@municipality.gov"
                    className={`input ps-9 ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="label">{t('auth.password')}</label>
                <div className="relative">
                  <Lock size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    {...register('password', { required: t('auth.password') })}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={`input ps-9 pe-10 ${errors.password ? 'border-red-400 focus:ring-red-400' : ''}`}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-2.5 mt-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : null}
                {loading ? t('auth.signingIn') : t('auth.signIn')}
              </button>
            </form>
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">
          © {new Date().getFullYear()} {t('auth.footer')}
        </p>
      </div>
    </div>
  )
}
