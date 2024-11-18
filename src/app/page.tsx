'use client'
import { useState, useEffect } from 'react'

type Item = {
  title: string
  url: string
  selected?: boolean
}

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [items, setItems] = useState<Item[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mounted) return
    
    setIsLoading(true)
    setItems([])
    setError(null)
    
    try {
      const response = await fetch('/api/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()
      if (data.success) {
        setItems(data.items)
      } else {
        setError(data.error || 'Error al procesar la página')
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">
        Extractor de Contenido Web
      </h1>
      
      <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Introduce la URL (ej: https://www.hellofresh.es/recipes/recetas-faciles)"
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
          >
            {isLoading ? 'Analizando...' : 'Analizar'}
          </button>
        </div>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg max-w-2xl mx-auto">
          {error}
        </div>
      )}

      {items.length > 0 && (
        <div className="mt-8 max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-4">
            Recetas encontradas: {items.length}
          </h2>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li 
                key={index} 
                className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
              >
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {item.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}
