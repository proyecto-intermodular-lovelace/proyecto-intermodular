import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthProvider'
import apiFetch from '../../services/api'
import { User, Mail, Lock, Shield, Save, Eye, EyeOff, CheckCircle, AlertCircle, Search } from 'lucide-react'

const ROLE_SUPER  = 'SUPERADMIN'
const ROLE_ADMIN  = 'ADMIN'
const ROLE_USER   = 'USER'

const ROLE_LABELS = { SUPERADMIN: 'Economato', ADMIN: 'Docente', USER: 'Alumno / a' }
const ROLE_COLORS = {
  SUPERADMIN: 'bg-red-50 text-cifp-red border-red-200',
  ADMIN:      'bg-blue-50 text-blue-700 border-blue-200',
  USER:       'bg-green-50 text-green-700 border-green-200',
}

function initials(nombre, apellido1) {
  return `${(nombre?.[0] ?? '').toUpperCase()}${(apellido1?.[0] ?? '').toUpperCase()}` || '?'
}

function Field({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {Icon && <Icon size={13} />} {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

function TextInput({ value, onChange, readOnly, placeholder, error, type = 'text' }) {
  return (
    <input
      type={type} value={value} onChange={onChange} readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full rounded-xl border px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 ${
        readOnly
          ? 'bg-gray-50 text-gray-500 border-gray-200 cursor-default'
          : error
          ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
          : 'border-gray-200 focus:border-cifp-blue focus:ring-blue-100'
      }`}
    />
  )
}

function Toast({ type, message, onDismiss }) {
  const isOk = type === 'success'
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border text-sm ${isOk ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
      {isOk ? <CheckCircle size={16} className="mt-0.5 shrink-0 text-green-600" /> : <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />}
      <span className="flex-1">{message}</span>
      <button onClick={onDismiss} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
    </div>
  )
}

export default function ProfilePage() {
  const { user: me, user: authUser } = useAuth()
  const myRole = me?.role

  // ── profile form ──────────────────────────────────────────────────
  const [form, setForm]     = useState({ id: '', nombre: '', apellido1: '', apellido2: '', email: '', role: ROLE_USER })
  const [formErrors, setFormErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState(null)

  // ── search (admin+) ───────────────────────────────────────────────
  const [searchQ, setSearchQ]   = useState('')
  const [searching, setSearching] = useState(false)

  // ── password form ─────────────────────────────────────────────────
  const [pwForm, setPwForm]     = useState({ current: '', next: '', confirm: '' })
  const [pwErrors, setPwErrors] = useState({})
  const [pwSaving, setPwSaving] = useState(false)
  const [showPw, setShowPw]     = useState({ current: false, next: false, confirm: false })
  const [pwToast, setPwToast]   = useState(null)

  const isViewingOwn = form.id === me?.id

  function notify(msg, type = 'success')   { setToast({ msg, type });   setTimeout(() => setToast(null), 4000) }
  function notifyPw(msg, type = 'success') { setPwToast({ msg, type }); setTimeout(() => setPwToast(null), 4000) }

  // ── load profile ──────────────────────────────────────────────────
  async function loadProfile(id) {
    if (!id) return
    try {
      const data = await apiFetch(`/users/${id}`)
      setForm({
        id:        data.id        ?? '',
        nombre:    data.nombre    ?? '',
        apellido1: data.apellido1 ?? '',
        apellido2: data.apellido2 ?? '',
        email:     data.email     ?? '',
        role:      data.role      ?? ROLE_USER,
      })
      setFormErrors({})
    } catch (err) {
      notify(err.message || 'Error al cargar perfil', 'error')
    }
  }

  useEffect(() => {
    if (me?.id) loadProfile(me.id)
  }, [me?.id])

  // ── search ────────────────────────────────────────────────────────
  async function handleSearch(e) {
    e.preventDefault()
    const q = searchQ.trim()
    if (!q) return
    setSearching(true)
    try {
      if (/^[0-9a-fA-F-]{8,}$/.test(q)) {
        await loadProfile(q)
      } else {
        const list = await apiFetch('/users')
        const ql   = q.toLowerCase()
        const hit  = (list ?? []).find(u =>
          [u.email, u.nombre, u.apellido1, u.apellido2].some(f => (f ?? '').toLowerCase().includes(ql))
        )
        if (hit) await loadProfile(hit.id)
        else notify('No se encontró ningún usuario', 'error')
      }
    } catch (err) {
      notify(err.message || 'Error en búsqueda', 'error')
    } finally {
      setSearching(false)
    }
  }

  // ── save personal data ────────────────────────────────────────────
  function validateForm() {
    const e = {}
    if (!form.nombre.trim()    || form.nombre.trim().length < 2)    e.nombre    = 'Mínimo 2 caracteres'
    if (!form.apellido1.trim() || form.apellido1.trim().length < 2) e.apellido1 = 'Mínimo 2 caracteres'
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email))           e.email      = 'Email inválido'
    setFormErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSave(e) {
    e.preventDefault()
    if (!validateForm()) return
    setSaving(true)
    try {
      const payload = { nombre: form.nombre, apellido1: form.apellido1, apellido2: form.apellido2, email: form.email }
      if (myRole === ROLE_SUPER) payload.role = form.role
      await apiFetch(`/users/${form.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      notify('Datos actualizados correctamente')
    } catch (err) {
      notify(err.message || 'Error al guardar', 'error')
    } finally {
      setSaving(false)
    }
  }

  // ── change password ───────────────────────────────────────────────
  function validatePw() {
    const e = {}
    if (!pwForm.current)                        e.current  = 'Introduce tu contraseña actual'
    if (!pwForm.next || pwForm.next.length < 6) e.next     = 'Mínimo 6 caracteres'
    if (pwForm.next !== pwForm.confirm)          e.confirm  = 'Las contraseñas no coinciden'
    setPwErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleChangePw(e) {
    e.preventDefault()
    if (!validatePw()) return
    setPwSaving(true)
    try {
      await apiFetch('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      })
      setPwForm({ current: '', next: '', confirm: '' })
      notifyPw('Contraseña actualizada correctamente')
    } catch (err) {
      notifyPw(err.body?.message ?? err.message ?? 'Error al cambiar contraseña', 'error')
    } finally {
      setPwSaving(false)
    }
  }

  const canEditRole = myRole === ROLE_SUPER
  const showSearch  = myRole === ROLE_SUPER || myRole === ROLE_ADMIN

  // ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-8">

      <h1 className="text-2xl font-bold text-gray-900">Mi perfil</h1>

      {/* ── Avatar + identity banner ──────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 flex items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-cifp-blue flex items-center justify-center text-white text-2xl font-bold shrink-0 select-none">
          {initials(form.nombre, form.apellido1)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-gray-900 truncate">
            {form.nombre ? `${form.nombre} ${form.apellido1}` : form.email || 'Cargando…'}
          </p>
          <p className="text-sm text-gray-400 truncate">{form.email}</p>
        </div>
        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold border shrink-0 ${ROLE_COLORS[form.role] ?? ROLE_COLORS[ROLE_USER]}`}>
          {ROLE_LABELS[form.role] ?? form.role}
        </span>
      </div>

      {/* ── Admin user search ─────────────────────────────────────── */}
      {showSearch && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2"><Search size={15} /> Buscar usuario</h2>
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={searchQ} onChange={e => setSearchQ(e.target.value)}
              placeholder="ID, email o nombre…"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-cifp-blue focus:ring-blue-100"
            />
            <button type="submit" disabled={searching}
              className="px-4 py-2.5 rounded-xl bg-cifp-blue text-white text-sm font-medium hover:bg-cifp-blue-dark disabled:opacity-50 transition-colors">
              {searching ? '…' : 'Buscar'}
            </button>
            {!isViewingOwn && (
              <button type="button" onClick={() => me?.id && loadProfile(me.id)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                Mi perfil
              </button>
            )}
          </form>
        </div>
      )}

      {/* ── Personal data form ────────────────────────────────────── */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 space-y-5">
        <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><User size={15} /> Datos personales</h2>

        {toast && <Toast type={toast.type} message={toast.msg} onDismiss={() => setToast(null)} />}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nombre" icon={User} error={formErrors.nombre}>
            <TextInput value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} error={formErrors.nombre} />
          </Field>
          <Field label="Primer apellido" error={formErrors.apellido1}>
            <TextInput value={form.apellido1} onChange={e => setForm({ ...form, apellido1: e.target.value })} error={formErrors.apellido1} />
          </Field>
          <Field label="Segundo apellido">
            <TextInput value={form.apellido2 ?? ''} onChange={e => setForm({ ...form, apellido2: e.target.value })} placeholder="Opcional" />
          </Field>
          <Field label="Email" icon={Mail} error={formErrors.email}>
            <TextInput value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} error={formErrors.email} />
          </Field>
          {canEditRole && (
            <Field label="Rol" icon={Shield}>
              <select
                value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:border-cifp-blue focus:ring-blue-100"
              >
                <option value={ROLE_USER}>Alumno (USER)</option>
                <option value={ROLE_ADMIN}>Docente (ADMIN)</option>
                <option value={ROLE_SUPER}>Economato (SUPERADMIN)</option>
              </select>
            </Field>
          )}
        </div>

        <div className="flex justify-end pt-1">
          <button type="submit" disabled={saving}
            className="inline-flex items-center gap-2 bg-cifp-blue text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-cifp-blue-dark disabled:opacity-50 transition-colors">
            <Save size={16} />
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </div>
      </form>

      {/* ── Change password (own profile only) ───────────────────── */}
      {isViewingOwn && (
        <form onSubmit={handleChangePw} className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-5 space-y-5">
          <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Lock size={15} /> Cambiar contraseña</h2>

          {pwToast && <Toast type={pwToast.type} message={pwToast.msg} onDismiss={() => setPwToast(null)} />}

          {[
            { key: 'current', label: 'Contraseña actual',   placeholder: '••••••••' },
            { key: 'next',    label: 'Nueva contraseña',    placeholder: 'Mínimo 6 caracteres' },
            { key: 'confirm', label: 'Confirmar contraseña', placeholder: 'Repite la nueva contraseña' },
          ].map(({ key, label, placeholder }) => (
            <Field key={key} label={label} icon={Lock} error={pwErrors[key]}>
              <div className="relative">
                <input
                  type={showPw[key] ? 'text' : 'password'}
                  value={pwForm[key]}
                  onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })}
                  placeholder={placeholder}
                  className={`w-full rounded-xl border px-4 py-2.5 pr-11 text-sm transition-colors focus:outline-none focus:ring-2 ${
                    pwErrors[key]
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-gray-200 focus:border-cifp-blue focus:ring-blue-100'
                  }`}
                />
                <button type="button" tabIndex={-1}
                  onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </Field>
          ))}

          <div className="flex justify-end pt-1">
            <button type="submit" disabled={pwSaving}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-700 disabled:opacity-50 transition-colors">
              <Lock size={16} />
              {pwSaving ? 'Guardando…' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      )}

    </div>
  )
}
