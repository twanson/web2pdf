'use client'
import { useState } from 'react'
import ContentList from '@/components/content-list'

export default function Home() {
  const [url, setUrl] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState('')

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    
    setError('')
    setIsAnalyzing(false)
    setTimeout(() => setIsAnalyzing(true), 100)
  }

  return (
    <main className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-center mb-8">
        Extractor de Contenido Web
      </h1>
      
      <form onSubmit={handleAnalyze} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Introduce la URL de la página"
            className="flex-1 p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            disabled={isAnalyzing}
          >
            {isAnalyzing ? 'Analizando...' : 'Analizar'}
          </button>
        </div>
        
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}
        
        {isAnalyzing && url && (
          <div className="mt-4">
            <ContentList key={url} url={url} />
          </div>
        )}
      </form>
    </main>
  )
