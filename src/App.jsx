import { useEffect, useMemo, useState } from 'react'

function App() {
  // UI state
  const [lang, setLang] = useState(() => localStorage.getItem('lang') || 'id')
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('dark')
    if (saved != null) return saved === 'true'
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  })
  const [view, setView] = useState('public') // public | admin

  // Data state
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Admin state
  const [token, setToken] = useState(localStorage.getItem('admin_token') || '')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [catForm, setCatForm] = useState({ id: null, name: '', description: '', order: 0, is_active: true })
  const [itemForm, setItemForm] = useState({ id: null, title: '', description: '', image_url: '', affiliate_url: '', price: '', category_id: '', tags: '', is_active: true })

  const t = useMemo(() => ({
    id: {
      title: 'Katalog Barang',
      subtitle: 'Bagikan link affiliate Shopee dari barang-barang yang saya gunakan',
      search: 'Cari barang...',
      categories: 'Kategori',
      all: 'Semua',
      buy: 'Beli di Shopee',
      admin: 'Admin',
      logout: 'Keluar',
      login: 'Masuk',
      save: 'Simpan',
      addCategory: 'Tambah Kategori',
      editCategory: 'Ubah Kategori',
      addItem: 'Tambah Barang',
      editItem: 'Ubah Barang',
      items: 'Barang',
      name: 'Nama',
      description: 'Deskripsi',
      order: 'Urutan',
      active: 'Aktif',
      image: 'Gambar (URL)',
      link: 'Link Affiliate Shopee',
      price: 'Harga (opsional)',
      category: 'Kategori',
      tags: 'Tag (pisahkan dengan koma)',
      delete: 'Hapus',
      cancel: 'Batal',
      empty: 'Tidak ada barang yang cocok',
      adminPanel: 'Panel Admin',
      required: 'Harus diisi',
      english: 'English',
      bahasa: 'Indonesia',
      dark: 'Gelap',
      light: 'Terang'
    },
    en: {
      title: 'Product Catalog',
      subtitle: 'Share your Shopee affiliate links for the gear you use',
      search: 'Search items...',
      categories: 'Categories',
      all: 'All',
      buy: 'Buy on Shopee',
      admin: 'Admin',
      logout: 'Logout',
      login: 'Login',
      save: 'Save',
      addCategory: 'Add Category',
      editCategory: 'Edit Category',
      addItem: 'Add Item',
      editItem: 'Edit Item',
      items: 'Items',
      name: 'Name',
      description: 'Description',
      order: 'Order',
      active: 'Active',
      image: 'Image (URL)',
      link: 'Shopee Affiliate Link',
      price: 'Price (optional)',
      category: 'Category',
      tags: 'Tags (comma separated)',
      delete: 'Delete',
      cancel: 'Cancel',
      empty: 'No items match your search',
      adminPanel: 'Admin Panel',
      required: 'Required',
      english: 'English',
      bahasa: 'Indonesian',
      dark: 'Dark',
      light: 'Light'
    }
  }), [])

  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dark', String(dark))
  }, [dark])

  useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadItems()
  }, [activeCategory, q])

  async function loadCategories() {
    try {
      setError('')
      const res = await fetch(`${baseUrl}/categories`)
      const data = await res.json()
      setCategories(data)
    } catch (e) {
      setError('Failed to load categories')
    }
  }

  async function loadItems() {
    try {
      setLoading(true)
      setError('')
      const params = new URLSearchParams()
      if (activeCategory) params.set('category_id', activeCategory)
      if (q) params.set('q', q)
      const res = await fetch(`${baseUrl}/items?${params.toString()}`)
      const data = await res.json()
      setItems(data)
    } catch (e) {
      setError('Failed to load items')
    } finally {
      setLoading(false)
    }
  }

  function fmtPrice(p) {
    if (p == null || p === '') return ''
    try {
      return new Intl.NumberFormat(lang === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(p))
    } catch {
      return p
    }
  }

  async function doLogin(e) {
    e.preventDefault()
    try {
      const res = await fetch(`${baseUrl}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(loginForm) })
      if (!res.ok) throw new Error('Login failed')
      const data = await res.json()
      setToken(data.token)
      localStorage.setItem('admin_token', data.token)
    } catch (e) {
      alert('Login gagal / failed')
    }
  }

  function logout() {
    setToken('')
    localStorage.removeItem('admin_token')
  }

  // Admin CRUD helpers
  function authHeaders() {
    return token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' }
  }

  async function saveCategory(e) {
    e.preventDefault()
    const payload = { name: catForm.name, description: catForm.description || null, order: Number(catForm.order) || 0, is_active: !!catForm.is_active }
    try {
      const method = catForm.id ? 'PUT' : 'POST'
      const url = catForm.id ? `${baseUrl}/admin/categories/${catForm.id}` : `${baseUrl}/admin/categories`
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('save failed')
      await loadCategories()
      setCatForm({ id: null, name: '', description: '', order: 0, is_active: true })
    } catch (e) {
      alert('Gagal menyimpan kategori')
    }
  }

  async function editCategory(c) {
    setCatForm({ id: c.id, name: c.name, description: c.description || '', order: c.order || 0, is_active: c.is_active !== false })
  }

  async function deleteCategory(id) {
    if (!confirm('Hapus kategori ini?')) return
    try {
      const res = await fetch(`${baseUrl}/admin/categories/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error('delete failed')
      await loadCategories()
      if (activeCategory === id) setActiveCategory(null)
    } catch (e) {
      alert('Gagal menghapus kategori')
    }
  }

  async function saveItem(e) {
    e.preventDefault()
    const payload = {
      title: itemForm.title,
      description: itemForm.description || null,
      image_url: itemForm.image_url || null,
      affiliate_url: itemForm.affiliate_url,
      price: itemForm.price !== '' ? Number(itemForm.price) : null,
      category_id: itemForm.category_id || null,
      tags: (itemForm.tags || '').split(',').map(s => s.trim()).filter(Boolean),
      is_active: !!itemForm.is_active,
    }
    try {
      const method = itemForm.id ? 'PUT' : 'POST'
      const url = itemForm.id ? `${baseUrl}/admin/items/${itemForm.id}` : `${baseUrl}/admin/items`
      const res = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(payload) })
      if (!res.ok) throw new Error('save failed')
      await loadItems()
      setItemForm({ id: null, title: '', description: '', image_url: '', affiliate_url: '', price: '', category_id: '', tags: '', is_active: true })
    } catch (e) {
      alert('Gagal menyimpan barang')
    }
  }

  async function editItem(i) {
    setItemForm({ id: i.id, title: i.title, description: i.description || '', image_url: i.image_url || '', affiliate_url: i.affiliate_url || '', price: i.price ?? '', category_id: i.category_id || '', tags: (i.tags || []).join(', '), is_active: i.is_active !== false })
  }

  async function deleteItem(id) {
    if (!confirm('Hapus barang ini?')) return
    try {
      const res = await fetch(`${baseUrl}/admin/items/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (!res.ok) throw new Error('delete failed')
      await loadItems()
    } catch (e) {
      alert('Gagal menghapus barang')
    }
  }

  const dict = t[lang]

  return (
    <div className={`min-h-screen ${dark ? 'bg-neutral-950 text-white' : 'bg-gradient-to-b from-white to-neutral-100 text-neutral-900'} transition-colors`}> 
      <header className="sticky top-0 z-30 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-neutral-900/60 border-b border-black/5 dark:border-white/10">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-pink-500 text-white font-bold shadow">S</span>
            <div>
              <h1 className="text-base font-semibold">{dict.title}</h1>
              <p className="text-xs opacity-70 hidden sm:block">{dict.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="px-3 py-1.5 text-xs rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
              {lang === 'id' ? dict.english : dict.bahasa}
            </button>
            <button onClick={() => setDark(d => !d)} className="px-3 py-1.5 text-xs rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">
              {dark ? dict.light : dict.dark}
            </button>
            <button onClick={() => setView(v => v === 'public' ? 'admin' : 'public')} className="px-3 py-1.5 text-xs rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900">
              {view === 'public' ? dict.admin : 'Home'}
            </button>
          </div>
        </div>
      </header>

      {view === 'public' ? (
        <main className="mx-auto max-w-5xl px-4 py-6 grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Categories list */}
          <aside className="md:col-span-1">
            <div className={`rounded-2xl p-4 ${dark ? 'bg-neutral-900/60 border border-white/10' : 'bg-white shadow-sm border border-black/5'}`}>
              <h2 className="text-sm font-semibold mb-3">{dict.categories}</h2>
              <ul className="space-y-1 max-h-[60vh] overflow-auto pr-1">
                <li>
                  <button onClick={() => setActiveCategory(null)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeCategory === null ? 'bg-orange-500 text-white' : dark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                    {dict.all}
                  </button>
                </li>
                {categories.map(c => (
                  <li key={c.id}>
                    <button onClick={() => setActiveCategory(c.id)} className={`w-full text-left px-3 py-2 rounded-lg text-sm ${activeCategory === c.id ? 'bg-orange-500 text-white' : dark ? 'hover:bg-white/5' : 'hover:bg-black/5'}`}>
                      {c.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Catalog grid */}
          <section className="md:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1">
                <input value={q} onChange={e => setQ(e.target.value)} placeholder={dict.search} className={`w-full px-4 py-3 rounded-2xl text-sm outline-none border ${dark ? 'bg-neutral-900 border-white/10 placeholder:text-white/40' : 'bg-white border-black/10 placeholder:text-neutral-500'} focus:ring-2 focus:ring-orange-400/40`} />
              </div>
            </div>

            {loading ? (
              <div className="text-sm opacity-70">Loading...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {items.length === 0 && (
                  <div className="col-span-full text-sm opacity-70">{dict.empty}</div>
                )}
                {items.map(item => (
                  <article key={item.id} className={`group rounded-2xl overflow-hidden border ${dark ? 'border-white/10 bg-neutral-900 hover:bg-neutral-850' : 'border-black/5 bg-white hover:shadow-md'} transition`}> 
                    <div className="aspect-square overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs opacity-60">No Image</div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold line-clamp-2 mb-1">{item.title}</h3>
                      {item.price != null && (
                        <p className="text-xs opacity-70 mb-2">{fmtPrice(item.price)}</p>
                      )}
                      <a href={item.affiliate_url} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 text-white text-xs font-semibold py-2 hover:bg-orange-600">
                        {dict.buy}
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
            {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
          </section>
        </main>
      ) : (
        <main className="mx-auto max-w-5xl px-4 py-6">
          <div className={`rounded-2xl p-4 ${dark ? 'bg-neutral-900/60 border border-white/10' : 'bg-white shadow-sm border border-black/5'}`}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{dict.adminPanel}</h2>
              {token ? (
                <button onClick={logout} className="px-3 py-1.5 text-xs rounded-full border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5">{dict.logout}</button>
              ) : null}
            </div>

            {!token ? (
              <form onSubmit={doLogin} className="grid gap-3 max-w-sm">
                <input placeholder="Username" value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`} />
                <input type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`} />
                <button className="rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 px-4 py-2 text-sm font-semibold">{dict.login}</button>
              </form>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Category editor */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">{catForm.id ? dict.editCategory : dict.addCategory}</h3>
                  <form onSubmit={saveCategory} className="grid gap-2">
                    <input required placeholder={`${dict.name} *`} value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`} />
                    <input placeholder={dict.description} value={catForm.description} onChange={e => setCatForm({ ...catForm, description: e.target.value })} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`} />
                    <div className="flex items-center gap-2">
                      <input type="number" placeholder={dict.order} value={catForm.order} onChange={e => setCatForm({ ...catForm, order: e.target.value })} className={`w-32 px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`} />
                      <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={catForm.is_active} onChange={e => setCatForm({ ...catForm, is_active: e.target.checked })} />
                        {dict.active}
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold">{dict.save}</button>
                      {catForm.id && (
                        <button type="button" onClick={() => setCatForm({ id: null, name: '', description: '', order: 0, is_active: true })} className="rounded-lg px-4 py-2 text-sm border border-black/10 dark:border-white/10">{dict.cancel}</button>
                      )}
                    </div>
                  </form>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">{dict.categories}</h4>
                    <ul className="space-y-2 max-h-72 overflow-auto pr-1">
                      {categories.map(c => (
                        <li key={c.id} className="flex items-center justify-between gap-2 p-2 rounded-lg border border-black/5 dark:border-white/10">
                          <div className="text-sm">
                            <div className="font-medium">{c.name}</div>
                            {c.description && <div className="opacity-70 text-xs">{c.description}</div>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => editCategory(c)} className="text-xs px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800">Edit</button>
                            <button onClick={() => deleteCategory(c.id)} className="text-xs px-2 py-1 rounded bg-red-500 text-white">{dict.delete}</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Item editor */}
                <div>
                  <h3 className="text-sm font-semibold mb-2">{itemForm.id ? dict.editItem : dict.addItem}</h3>
                  <form onSubmit={saveItem} className="grid gap-2">
                    <input required placeholder={`${dict.name} *`} value={itemForm.title} onChange={e => setItemForm({ ...itemForm, title: e.target.value })} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`} />
                    <input placeholder={dict.description} value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`} />
                    <input placeholder={dict.image} value={itemForm.image_url} onChange={e => setItemForm({ ...itemForm, image_url: e.target.value })} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`} />
                    <input required placeholder={`${dict.link} *`} value={itemForm.affiliate_url} onChange={e => setItemForm({ ...itemForm, affiliate_url: e.target.value })} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`} />
                    <div className="grid grid-cols-2 gap-2">
                      <input placeholder={dict.price} value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`} />
                      <select value={itemForm.category_id} onChange={e => setItemForm({ ...itemForm, category_id: e.target.value })} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`}>
                        <option value="">{dict.category}</option>
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <input placeholder={dict.tags} value={itemForm.tags} onChange={e => setItemForm({ ...itemForm, tags: e.target.value })} className={`px-3 py-2 rounded-lg border ${dark ? 'bg-neutral-900 border-white/10' : 'bg-white border-black/10'}`} />
                    <label className="inline-flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={itemForm.is_active} onChange={e => setItemForm({ ...itemForm, is_active: e.target.checked })} />
                      {dict.active}
                    </label>
                    <div className="flex items-center gap-2">
                      <button className="rounded-lg bg-orange-500 text-white px-4 py-2 text-sm font-semibold">{dict.save}</button>
                      {itemForm.id && (
                        <button type="button" onClick={() => setItemForm({ id: null, title: '', description: '', image_url: '', affiliate_url: '', price: '', category_id: '', tags: '', is_active: true })} className="rounded-lg px-4 py-2 text-sm border border-black/10 dark:border-white/10">{dict.cancel}</button>
                      )}
                    </div>
                  </form>

                  <div className="mt-4">
                    <h4 className="text-sm font-semibold mb-2">{dict.items}</h4>
                    <ul className="space-y-2 max-h-72 overflow-auto pr-1">
                      {items.map(i => (
                        <li key={i.id} className="flex items-center justify-between gap-2 p-2 rounded-lg border border-black/5 dark:border-white/10">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-lg overflow-hidden bg-neutral-100 dark:bg-neutral-800 flex-shrink-0">
                              {i.image_url ? <img src={i.image_url} alt={i.title} className="h-full w-full object-cover" /> : null}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{i.title}</div>
                              {i.price != null && <div className="text-xs opacity-70">{fmtPrice(i.price)}</div>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => editItem(i)} className="text-xs px-2 py-1 rounded bg-neutral-200 dark:bg-neutral-800">Edit</button>
                            <button onClick={() => deleteItem(i.id)} className="text-xs px-2 py-1 rounded bg-red-500 text-white">{dict.delete}</button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      )}

      <footer className="mx-auto max-w-5xl px-4 pb-10 pt-6 opacity-60 text-xs">
        © {new Date().getFullYear()} • Shopee Affiliate Catalog
      </footer>
    </div>
  )
}

export default App
