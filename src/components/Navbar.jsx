import { useEffect, useState } from 'react'

const translations = {
  id: {
    title: 'Katalog Barang',
    search: 'Cari barang...',
    categories: 'Kategori',
    all: 'Semua',
    admin: 'Admin',
    logout: 'Keluar',
    login: 'Masuk',
    addCategory: 'Tambah Kategori',
    addProduct: 'Tambah Produk',
    save: 'Simpan',
    name: 'Nama',
    slug: 'Slug',
    description: 'Deskripsi',
    order: 'Urutan',
    active: 'Aktif',
    titleP: 'Judul',
    price: 'Harga',
    imageUrl: 'URL Gambar',
    affiliateUrl: 'Link Afiliasi Shopee',
    category: 'Kategori',
    tags: 'Tag (pisahkan dengan koma)',
    update: 'Perbarui',
    delete: 'Hapus',
    noProducts: 'Tidak ada produk',
    dark: 'Gelap',
    light: 'Terang'
  },
  en: {
    title: 'Product Catalog',
    search: 'Search products...',
    categories: 'Categories',
    all: 'All',
    admin: 'Admin',
    logout: 'Logout',
    login: 'Login',
    addCategory: 'Add Category',
    addProduct: 'Add Product',
    save: 'Save',
    name: 'Name',
    slug: 'Slug',
    description: 'Description',
    order: 'Order',
    active: 'Active',
    titleP: 'Title',
    price: 'Price',
    imageUrl: 'Image URL',
    affiliateUrl: 'Shopee Affiliate Link',
    category: 'Category',
    tags: 'Tags (comma separated)',
    update: 'Update',
    delete: 'Delete',
    noProducts: 'No products',
    dark: 'Dark',
    light: 'Light'
  }
}

export function useI18n() {
  const [lang, setLang] = useState(localStorage.getItem('lang') || 'id')
  useEffect(() => {
    localStorage.setItem('lang', lang)
  }, [lang])
  const t = (key) => translations[lang][key] || key
  return { lang, setLang, t }
}

export function useTheme() {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light')
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])
  return { theme, setTheme }
}

export default function Navbar({ onToggleMenu }) {
  const { lang, setLang, t } = useI18n()
  const { theme, setTheme } = useTheme()

  return (
    <header className="sticky top-0 z-20 backdrop-blur bg-white/70 dark:bg-neutral-900/70 border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onToggleMenu} className="md:hidden p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg>
          </button>
          <a href="/" className="font-semibold text-neutral-800 dark:text-neutral-100">{t('title')}</a>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="px-3 py-1 text-sm rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">
            {lang === 'id' ? 'EN' : 'ID'}
          </button>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800" aria-label="theme">
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 15a5 5 0 100-10 5 5 0 000 10zm9-6a1 1 0 010 2h-2a1 1 0 110-2h2zM5 12a1 1 0 100 2H3a1 1 0 100-2h2zm12.657 6.657a1 1 0 10-1.414 1.414l1.414-1.414zM6.343 6.343A1 1 0 104.93 4.929l1.414 1.414zM18 3a1 1 0 011 1v.05a1 1 0 11-2 0V4a1 1 0 011-1zM6 20a1 1 0 011-1h.05a1 1 0 110 2H7a1 1 0 01-1-1z"/></svg>
            )}
          </button>
          <a href="/admin" className="px-3 py-1 text-sm rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800">{t('admin')}</a>
        </div>
      </div>
    </header>
  )
}
