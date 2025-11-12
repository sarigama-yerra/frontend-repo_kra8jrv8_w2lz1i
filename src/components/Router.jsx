import { BrowserRouter, Routes, Route } from 'react-router-dom'
import CatalogPage from './Catalog'
import AdminPage from './Admin'

export default function Router(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CatalogPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="*" element={<CatalogPage />} />
      </Routes>
    </BrowserRouter>
  )
}
