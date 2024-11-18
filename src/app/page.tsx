'use client'
import { useState, useEffect } from 'react'

type Item = {
  title: string
  url: string
  selected: boolean
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
        setItems(data.items.map(item => ({ ...item, selected: false })))
      } else {
        setError(data.error || 'Error al procesar la página')
      }
    } catch (error) {
      setError('Error de conexión. Por favor, intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleItem = (index: number) => {
    setItems(items.map((item, i) => 
      i === index ? { ...item, selected: !item.selected } : item
    ))
  }

  const toggleAll = () => {
    const allSelected = items.every(item => item.selected)
    setItems(items.map(item => ({ ...item, selected: !allSelected })))
  }

  const handleDownload = async () => {
    const selectedUrls = items
      .filter(item => item.selected)
      .map(item => item.url)

    console.log('URLs seleccionadas:', selectedUrls)

    if (selectedUrls.length === 0) {
      setError('Por favor, selecciona al menos una receta')
      return
    }

    try {
      setIsLoading(true)
      console.log('Iniciando petición a /api/pdf')
      
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls: selectedUrls }),
      })

      console.log('Respuesta recibida:', response.status)

      if (!response.ok) {
        throw new Error('Error al generar el PDF')
      }

      const blob = await response.blob()
      console.log('Blob recibido:', blob.size)
      
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'recetas.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Error en handleDownload:', error)
      setError('Error al descargar las recetas')
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
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              Recetas encontradas: {items.length}
            </h2>
            <div className="space-x-2">
              <button
                onClick={toggleAll}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
              >
                {items.every(item => item.selected) ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!items.some(item => item.selected) || isLoading}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Generando PDF...' : `Descargar seleccionadas (${items.filter(item => item.selected).length})`}
              </button>
            </div>
          </div>
          <ul className="space-y-2">
            {items.map((item, index) => (
              <li 
                key={index} 
                className="p-4 border rounded hover:bg-gray-50 cursor-pointer flex items-center gap-3"
              >
                <input
                  type="checkbox"
                  checked={item.selected}
                  onChange={() => toggleItem(index)}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex-1"
                  onClick={(e) => e.stopPropagation()}
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
