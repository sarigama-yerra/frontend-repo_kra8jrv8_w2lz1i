import { useEffect, useMemo, useState } from 'react'
import Navbar, { useI18n } from './Navbar'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

function CategoryList({ categories, activeId, onSelect }) {
  return (
    <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
      <button onClick={() => onSelect(null)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap border ${activeId===null? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white' : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'}`}>All</button>
      {categories.map(c => (
        <button key={c.id} onClick={() => onSelect(c.id)} className={`px-3 py-1 rounded-full text-sm whitespace-nowrap border ${activeId===c.id? 'bg-neutral-900 text-white dark:bg-white dark:text-black border-neutral-900 dark:border-white' : 'border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300'}`}>{c.name}</button>
      ))}
    </div>
  )
}

function ProductCard({ p }) {
  return (
    <a href={p.affiliate_url} target="_blank" rel="noopener noreferrer" className="group rounded-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden bg-white dark:bg-neutral-900 hover:shadow-md transition-shadow">
      {p.image_url ? (
        <img src={p.image_url} alt={p.title} className="w-full h-40 object-cover"/>
      ) : (
        <div className="w-full h-40 bg-neutral-100 dark:bg-neutral-800" />
      )}
      <div className="p-3">
        <h3 className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 group-hover:underline">{p.title}</h3>
        {p.price != null && (
          <p className="text-sm text-neutral-500 mt-1">Rp {p.price.toLocaleString('id-ID')}</p>
        )}
      </div>
    </a>
  )
}

export default function CatalogPage() {
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [query, setQuery] = useState('')
  const { t } = useI18n()

  const fetchData = async () => {
    const [cRes, pRes] = await Promise.all([
      fetch(`${API}/api/categories`).then(r=>r.json()),
      fetch(`${API}/api/products`).then(r=>r.json())
    ])
    setCategories(cRes)
    setProducts(pRes)
  }

  useEffect(() => { fetchData() }, [])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const byCat = activeCategory ? p.category_id === activeCategory : true
      const byQ = query ? (p.title?.toLowerCase().includes(query.toLowerCase())) : true
      return byCat && byQ
    })
  }, [products, activeCategory, query])

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-neutral-50 dark:from-black dark:to-neutral-950 text-neutral-900 dark:text-neutral-100">
      <Navbar />
      <main className="max-w-5xl mx-auto px-4 pt-4 pb-24">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <input value={query} onChange={e=>setQuery(e.target.value)} placeholder={t('search')} className="w-full px-4 py-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 outline-none focus:ring-2 focus:ring-neutral-300 dark:focus:ring-neutral-700" />
          </div>
        </div>

        <section className="mt-4 grid md:grid-cols-[220px_1fr] gap-6">
          <aside>
            <h2 className="text-sm font-semibold text-neutral-500 uppercase tracking-wide mb-2">{t('categories')}</h2>
            <CategoryList categories={categories} activeId={activeCategory} onSelect={setActiveCategory} />
          </aside>
          <div>
            {filtered.length === 0 ? (
              <p className="text-neutral-500 text-sm">{t('noProducts')}</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {filtered.map(p => <ProductCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}
