import { useEffect, useState } from 'react'

const API = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'

export default function Test(){
  const [health, setHealth] = useState(null)
  useEffect(()=>{ fetch(API + '/test').then(r=>r.json()).then(setHealth) },[])
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <pre className="text-xs bg-neutral-100 dark:bg-neutral-900 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-200 overflow-auto">{JSON.stringify(health, null, 2)}</pre>
    </div>
  )
}
