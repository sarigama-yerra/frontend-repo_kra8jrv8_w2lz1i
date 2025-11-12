import { useEffect, useMemo, useState } from 'react'
import Navbar, { useI18n } from './Navbar'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function useAuth() {
  const [token, setToken] = useState(localStorage.getItem('token') || '')
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  const login = async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!res.ok) throw new Error('Login gagal')
    const data = await res.json()
    setToken(data.token); setUser({ name: data.name, email: data.email })
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify({ name: data.name, email: data.email }))
  }
  const logout = () => { setToken(''); setUser(null); localStorage.removeItem('token'); localStorage.removeItem('user') }
  return { token, user, login, logout }
}

function Field({ label, children }) {
  return (
    <label className="text-sm text-neutral-600 dark:text-neutral-300 grid gap-1">
      <span>{label}</span>
      {children}
    </label>
  )
}

function CategoryForm({ initial, onSaved, token }) {
  const { t } = useI18n()
  const [values, setValues] = useState(initial || { name: '', slug: '', description: '', order: 0, is_active: true })
  const isEdit = Boolean(initial?.id)

  const save = async () => {
    const url = isEdit ? `${API}/api/categories/${initial.id}` : `${API}/api/categories`
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(values) })
    const data = await res.json()
    onSaved(data)
  }

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('name')}><input className="input" value={values.name} onChange={e=>setValues(v=>({...v, name:e.target.value}))} /></Field>
        <Field label={t('slug')}><input className="input" value={values.slug} onChange={e=>setValues(v=>({...v, slug:e.target.value}))} /></Field>
      </div>
      <Field label={t('description')}><input className="input" value={values.description} onChange={e=>setValues(v=>({...v, description:e.target.value}))} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('order')}><input type="number" className="input" value={values.order} onChange={e=>setValues(v=>({...v, order:Number(e.target.value)}))} /></Field>
        <Field label={t('active')}><input type="checkbox" checked={values.is_active} onChange={e=>setValues(v=>({...v, is_active:e.target.checked}))} /></Field>
      </div>
      <button onClick={save} className="btn-primary">{t('save')}</button>
    </div>
  )
}

function ProductForm({ categories, initial, onSaved, token }) {
  const { t } = useI18n()
  const [values, setValues] = useState(initial || { title: '', description: '', price: '', image_url: '', affiliate_url: '', category_id: '', tags: '', is_active: true })
  const isEdit = Boolean(initial?.id)

  const save = async () => {
    const payload = { ...values, price: values.price? Number(values.price): null, tags: values.tags? values.tags.split(',').map(s=>s.trim()).filter(Boolean): [] }
    const url = isEdit ? `${API}/api/products/${initial.id}` : `${API}/api/products`
    const method = isEdit ? 'PUT' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) })
    const data = await res.json()
    onSaved(data)
  }

  return (
    <div className="grid gap-3">
      <Field label={t('titleP')}><input className="input" value={values.title} onChange={e=>setValues(v=>({...v, title:e.target.value}))} /></Field>
      <Field label={t('description')}><textarea className="input" value={values.description} onChange={e=>setValues(v=>({...v, description:e.target.value}))} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('price')}><input type="number" className="input" value={values.price} onChange={e=>setValues(v=>({...v, price:e.target.value}))} /></Field>
        <Field label={t('imageUrl')}><input className="input" value={values.image_url} onChange={e=>setValues(v=>({...v, image_url:e.target.value}))} /></Field>
      </div>
      <Field label={t('affiliateUrl')}><input className="input" value={values.affiliate_url} onChange={e=>setValues(v=>({...v, affiliate_url:e.target.value}))} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('category')}>
          <select className="input" value={values.category_id} onChange={e=>setValues(v=>({...v, category_id:e.target.value}))}>
            <option value="">-</option>
            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </Field>
        <Field label={t('tags')}><input className="input" value={values.tags} onChange={e=>setValues(v=>({...v, tags:e.target.value}))} /></Field>
      </div>
      <div className="flex items-center gap-2"><input type="checkbox" checked={values.is_active} onChange={e=>setValues(v=>({...v, is_active:e.target.checked}))} /><span className="text-sm">{t('active')}</span></div>
      <button onClick={save} className="btn-primary">{t('save')}</button>
    </div>
  )
}

export default function AdminPage() {
  const { t } = useI18n()
  const { token, user, login, logout } = useAuth()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [tab, setTab] = useState('categories')
  const [editing, setEditing] = useState(null)

  const headers = useMemo(()=> token? { 'Authorization': `Bearer ${token}` } : {}, [token])

  const fetchAll = async () => {
    const [c, p] = await Promise.all([
      fetch(`${API}/api/categories`).then(r=>r.json()),
      fetch(`${API}/api/products?active=`).then(r=>r.json()),
    ])
    setCategories(c)
    setProducts(p)
  }

  useEffect(()=>{ fetchAll() }, [token])

  if (!token) {
    let emailInput, passInput
    const submit = async (e) => {
      e.preventDefault()
      try {
        await login(emailInput.value, passInput.value)
      } catch (e) { alert(e.message) }
    }
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
        <Navbar />
        <main className="max-w-md mx-auto px-4 pt-10">
          <form onSubmit={submit} className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 grid gap-4">
            <h1 className="text-xl font-semibold">Admin Login</h1>
            <input ref={r=>emailInput=r} className="input" placeholder="Email" defaultValue="admin@example.com" />
            <input ref={r=>passInput=r} className="input" placeholder="Password" type="password" defaultValue="admin123" />
            <button className="btn-primary">Login</button>
          </form>
        </main>
      </div>
    )
  }

  const removeCategory = async (id) => {
    if (!confirm('Hapus kategori?')) return
    await fetch(`${API}/api/categories/${id}`, { method: 'DELETE', headers })
    setEditing(null)
    fetchAll()
  }
  const removeProduct = async (id) => {
    if (!confirm('Hapus produk?')) return
    await fetch(`${API}/api/products/${id}`, { method: 'DELETE', headers })
    setEditing(null)
    fetchAll()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-6 pb-20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            <button className={`tab ${tab==='categories'?'tab-active':''}`} onClick={()=>setTab('categories')}>{t('categories')}</button>
            <button className={`tab ${tab==='products'?'tab-active':''}`} onClick={()=>setTab('products')}>Catalog</button>
          </div>
          <div className="flex items-center gap-2">
            {user && <span className="text-sm text-neutral-500">{user.email}</span>}
            <button onClick={logout} className="border px-3 py-1 rounded-full text-sm">Logout</button>
          </div>
        </div>

        {tab==='categories' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="card-title">{editing?.type==='category' ? 'Edit' : t('addCategory')}</h2>
              <CategoryForm token={token} initial={editing?.type==='category' ? editing.data : null} onSaved={()=>{ setEditing(null); fetchAll() }} />
            </div>
            <div className="card">
              <h2 className="card-title">{t('categories')}</h2>
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {categories.map(c => (
                  <li key={c.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-neutral-500">/{c.slug}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary" onClick={()=>setEditing({ type:'category', data:c })}>{t('update')}</button>
                      <button className="btn-danger" onClick={()=>removeCategory(c.id)}>{t('delete')}</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {tab==='products' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="card">
              <h2 className="card-title">{editing?.type==='product' ? 'Edit' : t('addProduct')}</h2>
              <ProductForm token={token} categories={categories} initial={editing?.type==='product' ? editing.data : null} onSaved={()=>{ setEditing(null); fetchAll() }} />
            </div>
            <div className="card">
              <h2 className="card-title">Catalog</h2>
              <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {products.map(p => (
                  <li key={p.id} className="py-3 flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="font-medium truncate max-w-[220px]">{p.title}</div>
                      <div className="text-xs text-neutral-500">{p.category_id ? categories.find(c=>c.id===p.category_id)?.name : '-'}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="btn-secondary" onClick={()=>setEditing({ type:'product', data:p })}>{t('update')}</button>
                      <button className="btn-danger" onClick={()=>removeProduct(p.id)}>{t('delete')}</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

